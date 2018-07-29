const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);
const conversionsData = require('../data/conversions');

//28 July 2018 -- HACK -- this solution is temporary.  
//SINCE MY DATABASE IS OF FIXED SIZE FOR THE FORSEEABLE FUTURE,
//Calculating profitability is more important than creating
//a programmatic, long-term, automated solution
//for fetching certain crypto prices at particular dates.

let promiseArr = [];
console.log(conversionsData[0])
conversionsData.forEach((conversionEntry)=>{
  promiseArr.push(
    knex('trades_conversions')
      .where('trade_id', '=', conversionEntry.trade_id)
      .update({
        usd_per_unit: conversionEntry.usd_per_unit,
        bnb_price_usd: conversionEntry.bnb_price_usd
      })
      .then((response) => {
        console.log(response);
        knex.destroy();
      })
      .catch((err)=>{
        console.error(`error updating conversion with trade_id ${conversionEntry.trade_id}`,err);
      })  
  )

})

Promise.all(promiseArr);

// knex('trades_conversions')
//   .where('trade_id','=',conversionsData[0].trade_id)
//   .update({
//     usd_per_unit:conversionsData[0].usd_per_unit,
//     bnb_price_usd:conversionsData[0].bnb_price_usd
//   })
//   .then((response)=>{
//     console.log(response);
//     knex.destroy();
//   })