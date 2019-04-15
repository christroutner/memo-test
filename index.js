/*
  A scratchpad for working with BITBOX, BCH, and memo.cash.
*/

"use strict";

const BITBOXSDK = require("bitbox-sdk");
const BITBOX = new BITBOXSDK();

// Used for debugging and iterrogating JS objects.
const util = require("util");
util.inspect.defaultOptions = { depth: 1 };

const ADDR = "bitcoincash:qq34qnz6527rp2szzkull8dzrkmmrnlfuq4ua74spq";

async function runTest() {
  const details = await BITBOX.Address.details(ADDR);
  //console.log(`details: ${JSON.stringify(details,null,2)}`)

  const TXIDs = details.transactions

  for(let i=0; i < TXIDs.length; i++) {
    const thisTXID = TXIDs[i]

    //const thisTx = await BITBOX.RawTransactions.getRawTransaction(thisTXID, true)
    //console.log(`thisTx: ${JSON.stringify(thisTx,null,2)}`)

    const thisTx = await BITBOX.Transaction.details(thisTXID)
    console.log(`thisTx: ${JSON.stringify(thisTx,null,2)}`)

  }
}
runTest();
