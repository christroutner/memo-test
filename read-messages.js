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

async function runTest() {
  console.log(`Querying all memo.cash transactions for ${ADDR}`)
  console.log(` `)

  const details = await BITBOX.Address.details(ADDR);
  //console.log(`details: ${JSON.stringify(details,null,2)}`)

  const TXIDs = details.transactions

  // Loop through each transaction associated with this address.
  for(let i=0; i < TXIDs.length; i++) {
    const thisTXID = TXIDs[i]

    const thisTx = await BITBOX.RawTransactions.getRawTransaction(thisTXID, true)
    //console.log(`thisTx: ${JSON.stringify(thisTx,null,2)}`)

    const vout = thisTx.vout

    // Loop through all the vout entries.
    for(let j=0; j < thisTx.vout.length; j++) {
      const thisVout = thisTx.vout[j]

      // Assembly representation.
      const asm = thisVout.scriptPubKey.asm

      // Memopress sometimes throws an error, so I have to wrap it in a try/catch
      // before attempting to decode the message.
      let msg
      try {msg = memopress.decode(asm)}
      catch(err) {}

      if(msg) {
        console.log(`This TXID: ${thisTXID}`)
        console.log(`asm: ${asm}`)
        console.log(`Message: ${msg.message}`)
        console.log(` `)
      }
    }

  }
}
runTest();
