const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);

let tradesWithConversions = [];
let tradesWithoutConversions = [];

//the promise-chain in plain language:
//1. fetch a list of all unique cryptocurrencies traded
//2. fetch trade information for all trades
//3. then calculate sums for each unique cryptocurrency
//4. then add sums from purchases table
//5. fetch entries in the balance table.  attach sums data.
//6. then prep entries for insertion into balance table
//7. first try updating the balance table
//8. then insert the rest of the data.


//assumes purchases is handled first

//creating objects for insertion into balance tables
//  balance table has three fields.
//  symbol, weighted_usd_per_unit, and liquid_units

//finds all unique symbols
knex('trades')
  .distinct('trade_buy_symbol')
  .then((everyUniqueCrypto)=>{
    let allCryptosBought = {};
    everyUniqueCrypto.forEach((cryptoCurrency) => {
      allCryptosBought[cryptoCurrency.trade_buy_symbol] = 0;
    })

    //next let's calculate the liquid_units
    knex('trades')
      .select('*')
      .then((allTradeInfo)=>{
        tradesWithoutConversions.push(...allTradeInfo.slice(0,9));
        allTradeInfo.forEach((singleTrade)=>{
          allCryptosBought[singleTrade.trade_buy_symbol] += parseFloat(singleTrade.amount);
          allCryptosBought[singleTrade.trade_sell_symbol] -= parseFloat(singleTrade.total_cost);
          
          if ( singleTrade.trade_buy_symbol === singleTrade.fee_coin_symbol ) {
            allCryptosBought[singleTrade.trade_buy_symbol] -= parseFloat(singleTrade.fee);
          } else {
            tradesWithConversions.push({
              trade_id:singleTrade.trade_id
            });
          }
        })
        return allCryptosBought;
      })
      .then((allCryptoSumsWithNegatives)=>{
        //this fetches the sum of all purchased ETH transferred from coinbase to binance
        return knex('purchases')
          .sum('pch_units')
          .where('symbol','=','ETH')
          .where('withdrawn','=',true)
          .then((allEthPurchased)=>{
            allCryptoSumsWithNegatives['ETH'] += parseFloat(allEthPurchased[0].sum)
            return allCryptoSumsWithNegatives;
          })
      })
      .then((symbolsAndSums)=>{
        //symbols and sums
        console.log('symbolsAndSums',symbolsAndSums);
        
        knex('trades')
        .join('trades_conversions','trades.trade_id','=','trades_conversions.trade_id')
        .then((allTradesWithConversions)=>{
          let arr = [];
          // let allTradesJoined = tradesWithoutConversions.concat(...allTradesWithConversions);
          // console.log('these are all trades',allTradesJoined);

          Object.keys(symbolsAndSums).forEach((singleCrypto)=>{
            let weighted_cost_per_unit = 0;
            
            
            allTradesWithConversions.forEach((singleTrade)=>{
              
              if ( singleTrade.trade_buy_symbol === singleCrypto ) {
                console.log('singleCrypto',singleCrypto);
                // console.log('singleTrade.amount', parseFloat(singleTrade.amount)/symbolsAndSums[singleCrypto]);

                //
                console.log('singleTrade.amount', parseFloat(singleTrade.amount)/symbolsAndSums[singleCrypto]);
                weighted_cost_per_unit += parseFloat(singleTrade.amount)/symbolsAndSums[singleCrypto];

              }
              console.log('weighted_cost_per_unit',weighted_cost_per_unit);

            })
            // arr.push([singleCrypto,weighted_cost_per_unit]);
          })
        })


        // let weightedCosts = [];
        // //each unique crypto now has a corresponding (correct) liquid_units
        // console.log('this is allCryptoSumsProper',allCryptoSumsProper);

        // //fetch trades_conversions
        // knex('trades')
        //   .join('trades_conversions','trades.trade_id','=','trades_conversions.trade_id')
        //   .then((allTradesWithConversions)=>{
        //     //calculate weighted_usd_per_unit for each cryptocurrency
        //     let allTradesJoined = tradesWithoutConversions.concat(...allTradesWithConversions);
        //     let weightedArr = [];

        //     //1 AUGUST 2018.  O(n^2) time complexity.  :(
        //     Object.keys(allCryptoSumsProper).forEach((singleCrypto)=>{
        //       let weighted_usd_per_unit = 0;
        //       // console.log('singleCrypto',singleCrypto);
              
        //       allTradesJoined.forEach((singleTrade)=>{
        //         if ( singleTrade.trade_buy_symbol === singleCrypto ) {
        //           // console.log('singleTrade',singleTrade)
        //           if ( singleTrade.hasOwnProperty('usd_per_unit') ){
        //             console.log('allCryptoSumsProper[singleCrypto]',allCryptoSumsProper[singleCrypto])
        //             // weighted_cost_per_unit += (amount / sum) * (usd_per_unit * price)
        //             weighted_usd_per_unit += (parseFloat(singleTrade.amount)/allCryptoSumsProper[singleCrypto])*(parseFloat(singleTrade.usd_per_unit)*parseFloat(singleTrade.price));
        //           } else {
        //             // weighted_cost_per_unit += (amount / sum);
        //             weighted_usd_per_unit += (parseFloat(singleTrade.amount)/allCryptoSumsProper[singleCrypto]);
        //           }
        //         }
        //       })

        //       weightedArr.push(weighted_usd_per_unit);
        //     })
        //     console.log('weightedArr',weightedArr);
        //   })
      })
    
  })