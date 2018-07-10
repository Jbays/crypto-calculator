const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);
const _ = require('underscore');

let strayBNBFees = [];

knex('trades')
  .distinct('trade_buy')
  .select()
  .where('type','=','BUY')
  .then((response)=>{
    let allCryptosBought = {};
    response.forEach((cryptoCurrency)=>{
      allCryptosBought[cryptoCurrency.trade_buy] = 0;
    })
    return allCryptosBought;
  })
  .then((allCryptosBoughtObj)=>{
    knex('trades')
      .select('trade_id','date_trade','trade_buy','amount','fee','total','fee_coin_symbol','trade_sell')
      .where('type','=','BUY')
    .then((allTradesBuy)=>{
      allTradesBuy.forEach((singleTradeBuy)=>{
        //add amount to trade_buy (symbol)
        allCryptosBoughtObj[singleTradeBuy.trade_buy] += parseFloat(singleTradeBuy.amount)

        //if trade_buy is equal to fee_coin_symbol
        if ( singleTradeBuy.trade_buy === singleTradeBuy.fee_coin_symbol ) {
          //subtract fee from amount
          allCryptosBoughtObj[singleTradeBuy.trade_buy] -= parseFloat(singleTradeBuy.fee);
        } else {
          //NOTE: this BNB fee should be pushed into an array
          strayBNBFees.push([
            singleTradeBuy.trade_id,
            singleTradeBuy.date_trade,
            parseFloat(singleTradeBuy.fee),
            singleTradeBuy.fee_coin_symbol,
            singleTradeBuy.trade_sell
          ])
        }
      })
      return allCryptosBoughtObj;
    })
    .then((allCryptosSums)=>{
      let insert = [];
      console.log('allCryptosSums',allCryptosSums);

      Object.keys(allCryptosSums).forEach((singleCryptoSum)=>{
        console.log('singleCryptoSum',singleCryptoSum)
        let obj = {};
        obj.symbol = singleCryptoSum;
        obj.weighted_usd_per_unit = null;
        obj.liquid_units = allCryptosSums[singleCryptoSum];
        obj.from = 'trades_buy';
        insert.push(obj);
      })

      knex('balances')
        .insert(insert)
        .then((done)=>{
          console.log('currently calculate the balance from all buy trades')
          knex.destroy();
        })
      console.log(insert);
    })
  })

    // let sums = {};
    // console.log('this is response',response);
    // response.forEach((singleTrade)=>{
    //   if ( !sums.hasOwnProperty(singleTrade.trade_buy) ) {
    //     if ( singleTrade.trade_buy === singleTrade.fee_coin_symbol ) {
    //       sums[singleTrade.trade_buy] = parseFloat(singleTrade.amount)-parseFloat(singleTrade.fee);
    //     } else {
    //       sums[singleTrade.trade_buy] = parseFloat(singleTrade.amount)
    //       strayBNBFees.push([singleTrade.trade_id,singleTrade.date_trade,singleTrade.fee,singleTrade.fee_coin_symbol])
    //     }
    //   } else {
    //     sums[singleTrade.trade_buy] += parseFloat(singleTrade.amount)
    //
    //     if ( !singleTrade.trade_buy === singleTrade.fee_coin_symbol ) {
    //       strayBNBFees.push([singleTrade.trade_id,singleTrade.date_trade,singleTrade.fee,singleTrade.fee_coin_symbol])
    //     }
    //   }
    // })
  // })



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
