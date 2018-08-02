const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);

let tradesWithConversions = [];
let tradesWithoutConversions = [];

//creating objects for insertion into balance tables
//  balance table has three fields.
//  symbol, weighted_usd_per_unit, and liquid_units

//fetch all unique crypto symbols
knex('trades')
  .distinct('trade_buy_symbol')
  .orderBy('trade_buy_symbol')
  .then((arrayOfUniqueCrypto)=>{
    let everyUniqueCrypto = {}
    arrayOfUniqueCrypto.forEach((singleCrypto)=>{
      everyUniqueCrypto[singleCrypto.trade_buy_symbol] = 0;
    });

    //this will add ETH to the emptyCryptoSums
    return knex('purchases')
      .sum('pch_units')
      .where('symbol', '=', 'ETH')
      .where('withdrawn', '=', true)
      .then((allEthPurchased) => {
        everyUniqueCrypto['ETH'] += parseFloat(allEthPurchased[0].sum)
        return everyUniqueCrypto
      })
  })
  .then((allCryptoWithPurchases)=>{
    //this fetches all data -- to calculate the liquid_units
    return knex('trades')
      .select('trade_buy_symbol','trade_sell_symbol','amount','total_cost','fee','fee_coin_symbol')
      .orderBy('trade_buy_symbol')
      .then((allTradeDataJoined)=>{
        allTradeDataJoined.forEach((singleTrade)=>{
          allCryptoWithPurchases[singleTrade.trade_buy_symbol] += parseFloat(singleTrade.amount);
          allCryptoWithPurchases[singleTrade.trade_sell_symbol] -= parseFloat(singleTrade.total_cost);

          if ( singleTrade.trade_buy_symbol === singleTrade.fee_coin_symbol ) {
            allCryptoWithPurchases[singleTrade.trade_buy_symbol] -= parseFloat(singleTrade.fee);
          };
        });
        return allCryptoWithPurchases;
      })
  })
  .then((allCryptoSumsAndSymbols)=>{
    //fetch all data to calculate weighted_usd_per_unit!
    knex('trades')
      .join('trades_conversions','trades.trade_id','=','trades_conversions.trade_id')
      .orderBy('trade_buy_symbol')
      .then((tradesJoinTableElements)=>{
        let weightsObj = {};
        
        // console.log('allCryptoSumsAndSymbols',allCryptoSumsAndSymbols);

        // tradesJoinTableElements.forEach((singleTrade)=>{
        //   console.log('this is singleTrade',singleTrade);
        //   let price = parseFloat(singleTrade.price);
        //   let amount = parseFloat(singleTrade.amount);
        //   let usdPerUnit = parseFloat(singleTrade.usd_per_unit);
        //   let sum = allCryptoSumsAndSymbols[singleTrade.trade_buy_symbol];
          
        //   console.log('this is price',price);
        //   console.log('this is amount',amount);
        //   console.log('this is usdPerUnit',usdPerUnit);
        //   console.log('this is sum',sum);

        //   if ( !weightsObj.hasOwnProperty(singleTrade.trade_buy_symbol) ) {
        //     weightsObj[singleTrade.trade_buy_symbol] = (price*amount*usdPerUnit)/sum;
        //   } else {
        //     weightsObj[singleTrade.trade_buy_symbol] += (price*amount*usdPerUnit)/sum;
        //   }

        // })
        // console.log('this is weightsObj',weightsObj);
        
      })
  })


//       .then((allCryptoSumsProper)=>{
//         console.log('allCryptoSumsProper', allCryptoSumsProper)

//         // //each unique crypto now has a corresponding (correct) liquid_units
//         // console.log('this is allCryptoSumsProper',allCryptoSumsProper);

//         // //fetch trades_conversions
//         // knex('trades')
//         //   .join('trades_conversions','trades.trade_id','=','trades_conversions.trade_id')
//         //   .then((allTradesWithConversions)=>{
//         //     //calculate weighted_usd_per_unit for each cryptocurrency
//         //     let allTradesJoined = tradesWithoutConversions.concat(...allTradesWithConversions);
//         //     let weightedArr = [];

//         //     //1 AUGUST 2018.  O(n^2) time complexity.  :(
//         //     Object.keys(allCryptoSumsProper).forEach((singleCrypto)=>{
//         //       let weighted_usd_per_unit = 0;
//         //       // console.log('singleCrypto',singleCrypto);
              
//         //       allTradesJoined.forEach((singleTrade)=>{
//         //         if ( singleTrade.trade_buy_symbol === singleCrypto ) {
//         //           // console.log('singleTrade',singleTrade)
//         //           if ( singleTrade.hasOwnProperty('usd_per_unit') ){
//         //             console.log('allCryptoSumsProper[singleCrypto]',allCryptoSumsProper[singleCrypto])
//         //             // weighted_cost_per_unit += (amount / sum) * (usd_per_unit * price)
//         //             weighted_usd_per_unit += (parseFloat(singleTrade.amount)/allCryptoSumsProper[singleCrypto])*(parseFloat(singleTrade.usd_per_unit)*parseFloat(singleTrade.price));
//         //           } else {
//         //             // weighted_cost_per_unit += (amount / sum);
//         //             weighted_usd_per_unit += (parseFloat(singleTrade.amount)/allCryptoSumsProper[singleCrypto]);
//         //           }
//         //         }
//         //       })

//         //       weightedArr.push(weighted_usd_per_unit);
//         //     })
//         //     console.log('weightedArr',weightedArr);
//         //   })
//       })
//   })