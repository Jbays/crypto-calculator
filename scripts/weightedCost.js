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
      .catch((err)=>{
        console.error('failed to fetch all withdrawn ETH from purchases table',err);
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
      .catch((err)=>{
        console.error('failed to select from trades table',err);
      })
  })
  .then((allCryptoSumsAndSymbols)=>{
    //fetch all data to calculate weighted_usd_per_unit!
    return knex('trades')
      .join('trades_conversions','trades.trade_id','=','trades_conversions.trade_id')
      .orderBy('trade_buy_symbol')
      .then((tradesJoinTableElements)=>{
        let weightsObj = {};

        //do the weighted_usd_per_unit math!
        tradesJoinTableElements.forEach((singleTrade)=>{
          let price = parseFloat(singleTrade.price);
          let amount = parseFloat(singleTrade.amount);
          let usdPerUnit = parseFloat(singleTrade.usd_per_unit);
          let sum = allCryptoSumsAndSymbols[singleTrade.trade_buy_symbol];

          //OPPOSITE LOGIC: if singleTrade.trade_buy_symbol === singleTrade.fee_coin-symbol, 
          //then the fee's already been subtracted!
          let feeInUsd = ( singleTrade.trade_buy_symbol !== singleTrade.fee_coin_symbol ) ? 
                          parseFloat(singleTrade.fee*singleTrade.bnb_price_usd).toFixed(4) : 0;
          
          if ( weightsObj.hasOwnProperty(singleTrade.trade_buy_symbol) ) {
            weightsObj[singleTrade.trade_buy_symbol] += ((price*(amount-feeInUsd)*usdPerUnit)/sum);
          } else {
            weightsObj[singleTrade.trade_buy_symbol] = ((price*(amount-feeInUsd)*usdPerUnit)/sum);
          }
        })
        return weightsObj;
      })
      .catch((err)=>{
        console.error('failed to join trades and trades_conversions table',err);
      })
  .then((allWeightsFromTrades)=>{
    //this object contains all the weighted_usd_per_unit for each cryptocurrency.
    //NOTE: BTC and EOS have screwy numbers.
    
    return knex('balances')
      .select('symbol','weighted_usd_per_unit','liquid_units')
      .then((response)=>{
        response.forEach((balanceEntry)=>{
          if ( allWeightsFromTrades.hasOwnProperty(balanceEntry.symbol) ) {
            allWeightsFromTrades[balanceEntry.symbol] += parseFloat(balanceEntry.weighted_usd_per_unit);
          } else {
            allWeightsFromTrades[balanceEntry.symbol] = parseFloat(balanceEntry.weighted_usd_per_unit);
          }
          if ( allCryptoSumsAndSymbols.hasOwnProperty(balanceEntry.symbol) ) {
            allCryptoSumsAndSymbols[balanceEntry.symbol] += parseFloat(balanceEntry.liquid_units);
          } else {
            allCryptoSumsAndSymbols[balanceEntry.symbol] = parseFloat(balanceEntry.liquid_units);
          }
        })
        return allWeightsFromTrades;
      })
      .catch((err)=>{
        console.error('failed to select symbol and weighted_usd_per_unit from balances',err);
      })
  })
  .then((allWeightsObject)=>{
    let insertAllWeightsArr = [];

    Object.keys(allWeightsObject).forEach((symbol)=>{
      let obj = {};
      obj.symbol = symbol;
      obj.weighted_usd_per_unit = allWeightsObject[symbol].toFixed(3);
      obj.liquid_units = allCryptoSumsAndSymbols[symbol].toFixed(8);
      insertAllWeightsArr.push(obj);
    })

    return knex('balances')
      .select('*')
      .del()
      .then((response)=>{
        return knex('balances')
          .insert(insertAllWeightsArr)
          .then((done)=>{
            console.log('in the balance table','\n',
                        'for each crypto','\n',
                        'are prices at which I am profitable');

            //HACK TO CLEAR UP THE NONSENSE
            return knex('balances')
              .del()
              .where('symbol','=','BTC')
              .then((response)=>{
                return knex('balances')
                  .del()
                  .where('symbol','=','EOS')
                  .then((done)=>{
                    knex.destroy();
                  })
              })
            
          })
          .catch((err)=>{
            console.error('failed to insert into the balances table',err);
          })
      })
      .catch((err)=>{
        console.error('failed to delete outdated entries in balances table',err);
      })
  })
})