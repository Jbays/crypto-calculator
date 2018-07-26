const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);
const _ = require('underscore');

let strayBNBFees = [];
let insertIntoBalancesTable = [];

//lines 11-23 create an object w/correct keys for tallying sums
knex('trades')
  .distinct('trade_buy_symbol')
  .select()
  .then((allUniqueCryptos)=>{
    let allCryptosBought = {};
    allUniqueCryptos.forEach((cryptoCurrency)=>{
      allCryptosBought[cryptoCurrency.trade_buy_symbol] = 0;
    })
    return allCryptosBought;
  })
  .then((allCryptosBought)=>{
    return knex('trades')
      .select('trade_id', 'trade_buy_symbol', 'amount', 'fee', 'total_cost', 'fee_coin_symbol', 'trade_sell_symbol')
      .then((allTrades)=>{
        allTrades.forEach((singleTrade)=>{
          //add amount to trade_buy_symbol
          allCryptosBought[singleTrade.trade_buy_symbol] += parseFloat(singleTrade.amount);
          //subtract amount from trade_sell_symbol
          allCryptosBought[singleTrade.trade_sell_symbol] -= parseFloat(singleTrade.total_cost);

          //if trade_buy_symbol is equal to fee_coin_symbol
          if ( singleTrade.trade_buy_symbol === singleTrade.fee_coin_symbol ) {
            allCryptosBought[singleTrade.trade_buy_symbol] -= parseFloat(singleTrade.fee);
          } else {
            strayBNBFees.push({
              trade_id: singleTrade.trade_id
            });
          }
        })
        console.log('allCryptosBought after!!!',allCryptosBought);
      })
  })
  //       allTradesBuy.forEach((singleTradeBuy)=>{
  //         console.log('label',singleTradeBuy)
  //         //add amount to trade_buy_symbol
  //         allCryptosBoughtObj[singleTradeBuy.trade_buy_symbol] += parseFloat(singleTradeBuy.amount)
  //         //subtract amount from trade_sell_symbol
  //         allCryptosBoughtObj[singleTradeBuy.trade_sell_symbol] -= parseFloat(singleTradeBuy.total_cost)

  //         //if trade_buy_symbol is equal to fee_coin_symbol
  //         if ( singleTradeBuy.trade_buy_symbol === singleTradeBuy.fee_coin_symbol ) {
  //           //subtract fee from amount
  //           allCryptosBoughtObj[singleTradeBuy.trade_buy_symbol] -= parseFloat(singleTradeBuy.fee);
  //         } else {
  //           //NOTE: this BNB fee should be pushed into an array
  //           strayBNBFees.push({
  //             trade_id: singleTradeBuy.trade_id
  //           })
  //         }
  //       })
  //       return allCryptosBoughtObj;
  //     })
  //   })
  //   .then((allCryptosSumsWithNegatives)=>{
  //     //HACK --> technically, this is a hack.  10 July 2018
  //     //But since I only purchase ETH from coinbase, don't see an immediate problem.
  //     //this knex query will pull every coinbase ETH purchase transferred to binance
  //     return knex('purchases')
  //       .sum('pch_units')
  //       .where('symbol','=','ETH')
  //       .where('withdrawn','=',true)
  //       .then((knexResult)=>{
  //         allCryptosSumsWithNegatives['ETH'] += parseFloat(knexResult[0].sum)
  //         return allCryptosSumsWithNegatives;
  //       })
  //   })
  //   .then((allCryptosSumsProper)=>{
  //     Object.keys(allCryptosSumsProper).forEach((singleCryptoSum)=>{
  //       let obj = {};
  //       obj.symbol = singleCryptoSum;
  //       obj.weighted_usd_per_unit = null;
  //       obj.liquid_units = allCryptosSumsProper[singleCryptoSum];
  //       obj.from = 'trades';
  //       insertIntoBalancesTable.push(obj);
  //     })
  //     return knex('balances')
  //       .insert(insertIntoBalancesTable)
  //       .then((knexResult)=>{
  //         //NOTE: to trades_conversions this inserts all trades which require converting units to USD
  //         return knex('trades_conversions')
  //           .insert(strayBNBFees);
  //       })
  //       .then((done)=>{
  //         console.log('calculated all balances from all trades');
  //         knex.destroy();
  //       })
  //   })
