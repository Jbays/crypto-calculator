const env = 'development';
const config = require('./knexfile')[env];
const knex = require('knex')(config);
const axios = require('axios');
const _ = require('underscore');

//NOTE: to add more coins, I have to look at the ticket's id.
//if the id changes, then my profitiability will MISCALCULATE!
const coinsInvested = [
  1,    //bitcoin
  1027, //ethereum
  1839, //binance coin
  328,  //monero
  131,  //dash
  1908, //nebulas
  52,   //ripple
  2010, //cardano
  1765, //eos
  2,    //litecoin
]

let allCurrencies = [];

axios.get('https://api.coinmarketcap.com/v2/ticker/')
  .then((response)=>{
    let promiseArr = [];
    coinsInvested.forEach((coinCapMarketId,index)=>{
      promiseArr.push(
         knex('coins_index')
          .where('symbol','=',response.data['data'][coinCapMarketId].symbol)
          .update({'usd_per_unit':response.data['data'][coinCapMarketId]['quotes']['USD']['price']})
          .catch((err)=>{
            return console.error("this is your problem, boss",err,'with this id',index+1)
          })
      )
    })
    return Promise.all(promiseArr)
  })
  //NOTE: this .then has nothing to do with updating the prices.  This should probably be refactored into another call.
  .then((res)=>{
    //returns all non-traded purchases
    return knex('purchases(pch)').where('traded','=',false).select('symbol','pch_usd_per_unit','pch_units').orderBy('symbol','desc');
  })
  .then((response)=>{
    //NOTE:  USE THE RESPONSE TO CALCULATE
    // FOR EACH COIN:
    // 1. total amount liquid
    // 2. weighted_usd_per_unit
    console.log("response",response)
  })
    //find all unique types of symbols in the purchase(pch) table
    // return knex('purchases(pch)')
    //   .distinct('symbol')
    //   .select()
    //   .then((res)=>{
    //     res.forEach((object)=>{
    //       allCurrencies.push(object.symbol);
    //     })
    //
    //     return allCurrencies;
    //   })
    // .then((response)=>{
    //   let promiseArr = [];
    //   //for each unique symbol, find total amount of that symbol's crypto in purchase(pch) table
    //   allCurrencies.forEach((searchSymbols)=>{
    //     promiseArr.push(
    //       knex('purchases(pch)')
    //       .where({
    //         symbol: searchSymbols,
    //         traded: false
    //       })
    //       .sum('pch_units')
    //     )
    //   })
    //   return Promise.all(promiseArr);
    // })
    //  this console.logs each symbol along with each symbol's balance
    // .then((response)=>{
    //   allCurrencies.forEach((symbol,index)=>{
    //     console.log("this crypto>>>>>>>>>>>>>>>>>>>>>>>",symbol);
    //     console.log("has this balance in purchases(pch)",response[index][0].sum);
    //   })
    // })
  // })
  .catch((err)=>{
    return console.error('your get request failed',err);
  })
