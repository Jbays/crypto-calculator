const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);
const _ = require('underscore');
// const bigNumber = require('bignumber');
// calculated totalLiquidAmount { LTC: 1, ETH: 3.4233480600000004 }
// NOTE: the stray 4 at the end of my available ETH
//MIGHT NEED a library to better handle the annoying little floating decimals

knex('purchases(pch)')
  .select('symbol','pch_usd_per_unit','pch_units')
  .where('withdrawn','=',false)
  .orderBy('symbol','desc')
.then((response)=>{
  return calculateSumsForAllCryptos(response)
    .then((response)=>{
      let allCryptoSums = [];

      response.forEach((entry)=>{
        let obj = {};

        obj.symbol = entry[0];
        obj.liquid_units = entry[1];
        obj.weighted_usd_per_unit = entry[2];

        allCryptoSums.push(obj);
      })

      return knex('balances').insert(allCryptoSums)
        .then((done)=>{
          console.log('for each crypto purchased,','\n',
                      'inserted into balance table is:','\n',
                      'a crypto database entry with fields symbol, sum, and weighted_usd_per_unit');
        })
        .catch((err)=>{
          console.error('failed to insert in balances table',err)
        })
    })

})
.then((response)=>{
  //unaccounted fees
  let strayBNBFees = [];

  // `select trade_buy,amount-fee as liquid_units,trade_sell,total as costs from trades
  //  where type = 'BUY';`

  return knex('trades')
    .select('date_trade','trade_buy','amount','fee','fee_coin_symbol')
    .where('type','=','BUY')
    .then((response)=>{
      let buys = response;

      return knex('trades')
        .select('date_trade','trade_sell','amount','fee','fee_coin_symbol')
        .where('type','=','SELL')
        .then((response)=>{
          return lumpCryptoTogetherSell(response)
            .then((response)=>{
              return lumpCryptoTogetherBuy(buys,response)
            })
        })
    })
    .then((response)=>{
      console.log("for each cryptocurrency, here is their respective balance",response);
    })
  //NOTE:  USE THE RESPONSE TO CALCULATE
  // FOR EACH COIN:
  // 1. total amount liquid
  // 2. weighted_usd_per_unit
})

/**
 * @name - calculateSumsForAllCryptos
 * @description - for each crypto purchased, calculates the sum
 * @param - array of purchase objects
 * @returns - {symbolName: sum}
 **/
async function calculateSumsForAllCryptos(input){
  let symbols = {};
  input.forEach((object)=>{
    if ( !symbols[object.symbol] ) {
      symbols[object.symbol] = parseFloat(object.pch_units);
    } else {
      symbols[object.symbol] += parseFloat(object.pch_units);
    }
  })

  return calculateWeighedSums(input,symbols);
}

/**
 * @name - calculateWeighedSums
 * @description - for each crypto purchased, calculates the weighted_usd_per_unit
 * @param - array of purchase objects
 * @param - obj with crypto sums
 * @returns - [['symbol1','sum1','weighted_usd_per_unit1'],
 *             ['symbol2','sum2','weighted_usd_per_unit2']]
 **/
function calculateWeighedSums(input,sumsObj){
  let weighted = {};
  input.forEach((purchaseObj)=>{
    purchaseObj['weighted_usd_per_unit'] = ((purchaseObj.pch_units/sumsObj[purchaseObj.symbol])*purchaseObj.pch_usd_per_unit).toFixed(2);
  })

  input.forEach((purchaseObj)=>{
    if ( !weighted[purchaseObj.symbol] ) {
      weighted[purchaseObj.symbol] = parseFloat(purchaseObj.weighted_usd_per_unit);
    } else {
      weighted[purchaseObj.symbol] += parseFloat(purchaseObj.weighted_usd_per_unit);
    }
  })

  //preps data for 'objectification'
  return _.zip(Object.keys(sumsObj),Object.values(sumsObj),Object.values(weighted));
}

//NOTE: I BET THIS FUNCTION CAN HANDLE BOTH SELL AND BUY CASES FOR TRADES
async function lumpCryptoTogetherSell(arrayOfObjects){
  let cryptoFromSelling = {};

  //inside here could go a conditional:
  //"if trade_sell is not equal to fee_coin_symbol, push relevant info to strayBNBFees"
  arrayOfObjects.forEach((saleObj)=>{
    if ( !cryptoFromSelling.hasOwnProperty(saleObj.trade_sell) ){
      cryptoFromSelling[saleObj.trade_sell] = parseFloat(saleObj.amount);
    } else {
      cryptoFromSelling[saleObj.trade_sell] += parseFloat(saleObj.amount);
    }
  })

  return cryptoFromSelling;
}

// NOTE: lumpCryptoTogetherBuy && lumpCryptoTogetherSell MUST UNITE!
//NOTE: IN FACT, ALL FOUR OF THESE FUNCTIONS PERFORM HIGHLY SIMILAR TASKS
async function lumpCryptoTogetherBuy(arrayOfObjects,object){
  let cryptoFromBuying = {};
  arrayOfObjects.forEach((tradeObj)=>{
    if ( !cryptoFromBuying.hasOwnProperty(tradeObj.trade_buy) ){
      cryptoFromBuying[tradeObj.trade_buy] = parseFloat(tradeObj.amount-tradeObj.fee);
    } else {
      cryptoFromBuying[tradeObj.trade_buy] += parseFloat(tradeObj.amount-tradeObj.fee);
    }
  })

  return Object.assign(cryptoFromBuying,object);
}
