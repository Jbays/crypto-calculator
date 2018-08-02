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

        tradesJoinTableElements.forEach((singleTrade)=>{
          let price = parseFloat(singleTrade.price);
          let amount = parseFloat(singleTrade.amount);
          let usdPerUnit = parseFloat(singleTrade.usd_per_unit);
          let sum = allCryptoSumsAndSymbols[singleTrade.trade_buy_symbol];
          //if singleTrade.trade_buy_symbol === singleTrade.fee_coin-symbol, then the fee's already been subtracted!
          let feeInUsd = ( singleTrade.trade_buy_symbol !== singleTrade.fee_coin_symbol ) ? parseFloat(singleTrade.fee*singleTrade.bnb_price_usd).toFixed(4) : 0;
          
          console.log("this is singleTrade",singleTrade);
          console.log("this is feeInUsd >>>>>>>",feeInUsd,'\n');

          if ( !weightsObj.hasOwnProperty(singleTrade.trade_buy_symbol) ) {
            weightsObj[singleTrade.trade_buy_symbol] = ((price*(amount-feeInUsd)*usdPerUnit)/sum);
          } else {
            weightsObj[singleTrade.trade_buy_symbol] += ((price*(amount-feeInUsd)*usdPerUnit)/sum);
          }
        })

        //this object contains all the weighted_usd_per_unit for each cryptocurrency.
        //NOTE: BTC, EOS, and ETH have screwy numbers.
        console.log('this is weightsObj',weightsObj);
        
      })
  })