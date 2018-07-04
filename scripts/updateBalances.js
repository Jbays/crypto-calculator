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
  .where('traded','=',false)
  .orderBy('symbol','desc')
.then((response)=>{
  //NOTE:  USE THE RESPONSE TO CALCULATE
  // FOR EACH COIN:
  // 1. total amount liquid
  // 2. weighted_usd_per_unit
  calculateSumsForAllCryptos(response)
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
          knex.destroy();
        })
        .catch((err)=>{
          console.error('failed to insert in balances table',err)
        })
    })

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
