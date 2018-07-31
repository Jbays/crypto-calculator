const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);
const _ = require('underscore');
// const bigNumber = require('bignumber');
// calculated totalLiquidAmount { LTC: 1, ETH: 3.4233480600000004 }
// NOTE: the stray 4 at the end of my available ETH
//MIGHT NEED a library to better handle the annoying little floating decimals

knex('purchases')
  .select('symbol','pch_usd_per_unit','pch_units')
  .where('withdrawn','=',false)
  .orderBy('symbol','desc')
.then((response)=>{
  let sumsObj = {};
  let weightsObj = {};

  //NOTE: this logic reads:
  /**
    if object does not have key
    then add key && prop
    else add to sum of prop
  */
  response.forEach((object)=>{
    if ( !sumsObj.hasOwnProperty(object.symbol) ){
      sumsObj[object.symbol] = parseFloat(object.pch_units);
    } else {
      sumsObj[object.symbol] += parseFloat(object.pch_units);
    }
  })

  let mapped = response.map((purchasedObj)=>{
    purchasedObj['weighted_usd_per_unit'] = ((purchasedObj.pch_units/sumsObj[purchasedObj.symbol])*purchasedObj.pch_usd_per_unit).toFixed(2);
    return purchasedObj;
  })

  //NOTE: highly similar logic in this map

  mapped.forEach((purchasedObj)=>{
    if ( !weightsObj.hasOwnProperty(purchasedObj.symbol) ) {
      weightsObj[purchasedObj.symbol] = parseFloat(purchasedObj.weighted_usd_per_unit)
    } else {
      weightsObj[purchasedObj.symbol] += parseFloat(purchasedObj.weighted_usd_per_unit)
    }
  })

  return _.zip(Object.keys(sumsObj),Object.values(sumsObj),Object.values(weightsObj))
})
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
      console.error('failed to insert in balances table',err);
    })
})
