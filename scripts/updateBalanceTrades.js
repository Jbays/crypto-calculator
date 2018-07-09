const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);
const _ = require('underscore');

knex('trades')
  .select('*')
  .then((response)=>{
    console.log('this is response',response);
  })

// .then((response)=>{
//   //unaccounted fees
//   let strayBNBFees = [];
//
//   return knex('trades')
//     .select('date_trade','trade_buy','amount','fee','total','fee_coin_symbol')
//     .where('type','=','BUY')
//     .then((response)=>{
//       let buys = response;
//       let cryptoFromSelling = {};
//       let cryptoFromBuying = {};
//       // let from = 'trades_sell'
//
//       return knex('trades')
//         //for weighted_usd_per_unit, I must select for 'total' (which is the total cost for the given purchase)
//         .select('date_trade','trade_sell','amount','fee','total','fee_coin_symbol')
//         .where('type','=','SELL')
//         .then((response)=>{
//           console.log('this is response',response);
//           //NOTE: highly similar logic to the map and forEach before
//           response.forEach((salesObj)=>{
//             if ( !cryptoFromSelling.hasOwnProperty(salesObj.trade_sell) ) {
//               cryptoFromSelling[salesObj.trade_sell] = parseFloat(salesObj.amount);
//             } else {
//               cryptoFromSelling[salesObj.trade_sell] = parseFloat(salesObj.amount);
//             }
//           })
//           return cryptoFromSelling;
//       })
//       .then((response)=>{
//         //NOTE: Again, highly similar logic to the map and forEach
//         buys.forEach((tradeObj)=>{
//           if ( !cryptoFromBuying.hasOwnProperty(tradeObj.trade_buy) ) {
//             cryptoFromBuying[tradeObj.trade_buy] = parseFloat(tradeObj.amount-tradeObj.fee);
//           } else {
//             cryptoFromBuying[tradeObj.trade_buy] += parseFloat(tradeObj.amount-tradeObj.fee);
//           }
//         })
//         return Object.assign(cryptoFromBuying,cryptoFromSelling);
//       })
//   })
//   .then((response)=>{
//     let output = [];
//     Object.entries(response).forEach((entry)=>{
//       let obj = {};
//       obj.symbol = entry[0];
//       obj.liquid_units = entry[1];
//       obj.from = 'trade_buy';
//       output.push(obj)
//     })
//
//     //NOTE: this INSERT to balances table does NOT include the weighted_usd_per_unit!
//     return knex('balances')
//       .insert(output)
//       .catch((err)=>{
//         console.error('failed to insert into the balances table',err);
//       })
//   })
// })
// .then((response)=>{
//   console.log('end of the road!');
// })
