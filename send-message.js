/*
  Queries all the transactions associated with a BCH address. Each transaction
  is then analyized for memo.cash messages. If found, the message and TXID
  are displayed.
*/

"use strict";

const BITBOXSDK = require("bitbox-sdk");
const BITBOX = new BITBOXSDK();

const memopress = require("memopress")

// Used for debugging and iterrogating JS objects.
const util = require("util");
util.inspect.defaultOptions = { depth: 1 };

const ADDR = "bitcoincash:qq34qnz6527rp2szzkull8dzrkmmrnlfuq4ua74spq";
const MNEMONIC = ""

if(MNEMONIC === "") {
  console.log(`Please add your mnemonic.`)
  return
}

async function runTest() {
  console.log(`Sending a memo.cash message for ${ADDR}`)
  console.log(` `)

  const u = await BITBOX.Address.utxo(ADDR)
  //console.log(`u: ${JSON.stringify(u, null, 2)}`)
  const utxo = findBiggestUtxo(u.utxos)
  //console.log(`utxo: ${JSON.stringify(utxo, null, 2)}`)

  // instance of transaction builder
  const transactionBuilder = new BITBOX.TransactionBuilder()

  //const satoshisToSend = SATOSHIS_TO_SEND
  const originalAmount = utxo.satoshis
  const vout = utxo.vout
  const txid = utxo.txid

  // add input with txid and index of vout
  transactionBuilder.addInput(txid, vout)

  const fee = 500

  // Send the same amount - fee.
  transactionBuilder.addOutput(ADDR, originalAmount - fee)

  // Add the memo.cash OP_RETURN to the transaction.
  const script = [BITBOX.Script.opcodes.OP_RETURN,
    Buffer.from('6d02', 'hex'),
    Buffer.from('Hello BITBOX 02')
  ]
  console.log(`script: ${util.inspect(script)}`)
  const data = BITBOX.Script.encode(script)
  console.log(`data: ${util.inspect(data)}`)
  transactionBuilder.addOutput(data, 0)

  // Generate a change address from a Mnemonic of a private key.
  const change = changeAddrFromMnemonic(MNEMONIC)

  // Generate a keypair from the change address.
  const keyPair = BITBOX.HDNode.toKeyPair(change)

  // Sign the transaction with the HD node.
  let redeemScript
  transactionBuilder.sign(
    0,
    keyPair,
    redeemScript,
    transactionBuilder.hashTypes.SIGHASH_ALL,
    originalAmount
  )

  // build tx
  const tx = transactionBuilder.build()
  // output rawhex
  const hex = tx.toHex()
  console.log(`TX hex: ${hex}`)
  console.log(` `)

  // Broadcast transation to the network
  const txidStr = await BITBOX.RawTransactions.sendRawTransaction(hex)
  console.log(`Transaction ID: ${txidStr}`)
  console.log(`Check the status of your transaction on this block explorer:`)
  console.log(`https://explorer.bitcoin.com/bch/tx/${txidStr}`)

}
runTest();

// Generate a change address from a Mnemonic of a private key.
function changeAddrFromMnemonic(mnemonic) {
  // root seed buffer
  const rootSeed = BITBOX.Mnemonic.toSeed(mnemonic)

  // master HDNode
  const masterHDNode = BITBOX.HDNode.fromSeed(rootSeed, "testnet")

  // HDNode of BIP44 account
  const account = BITBOX.HDNode.derivePath(masterHDNode, "m/44'/145'/0'")

  // derive the first external change address HDNode which is going to spend utxo
  const change = BITBOX.HDNode.derivePath(account, "0/0")

  return change
}

// Returns the utxo with the biggest balance from an array of utxos.
function findBiggestUtxo(utxos) {
  let largestAmount = 0
  let largestIndex = 0

  for (var i = 0; i < utxos.length; i++) {
    const thisUtxo = utxos[i]

    if (thisUtxo.satoshis > largestAmount) {
      largestAmount = thisUtxo.satoshis
      largestIndex = i
    }
  }

  return utxos[largestIndex]
}
