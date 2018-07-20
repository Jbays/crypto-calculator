const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);
const _ = require('underscore');

let strayBNBFees = [];
let insertIntoBalancesTable = [];

knex('trades')
  .distinct('trade_buy_symbol')
  .select()
  .where('trade_type','=','BUY')
  .then((allUniqueCryptos)=>{
    let allCryptosBought = {};
    allUniqueCryptos.forEach((cryptoCurrency)=>{
      allCryptosBought[cryptoCurrency.trade_buy_symbol] = 0;
    })
    //HACK -- 10 July 2018
    //NOTE: which knexQuery will return to me all the cryptos I trade?
    allCryptosBought['ETH'] = 0;
    allCryptosBought['BTC'] = 0;
    return allCryptosBought;
  }).then((allCryptosBoughtObj)=>{
    return knex('trades')
      .select('trade_id','date_trade','trade_buy_symbol','amount','fee','total_cost','fee_coin_symbol','trade_sell_symbol')
      .where('trade_type','=','BUY')
      .then((allTradesBuy)=>{
        allTradesBuy.forEach((singleTradeBuy)=>{
          //add amount to trade_buy_symbol (symbol)
          allCryptosBoughtObj[singleTradeBuy.trade_buy_symbol] += parseFloat(singleTradeBuy.amount)
          //subtract amount from trade_sell_symbol
          allCryptosBoughtObj[singleTradeBuy.trade_sell_symbol] -= parseFloat(singleTradeBuy.total_cost)

          //if trade_buy_symbol is equal to fee_coin_symbol
          if ( singleTradeBuy.trade_buy_symbol === singleTradeBuy.fee_coin_symbol ) {
            //subtract fee from amount
            allCryptosBoughtObj[singleTradeBuy.trade_buy_symbol] -= parseFloat(singleTradeBuy.fee);
          } else {
            //NOTE: this BNB fee should be pushed into an array
            strayBNBFees.push([
              singleTradeBuy.trade_id,
              singleTradeBuy.date_trade,
              parseFloat(singleTradeBuy.fee),
              singleTradeBuy.fee_coin_symbol,
              singleTradeBuy.trade_sell_symbol
            ])
          }
        })
        return allCryptosBoughtObj;
      })
    }).then((allCryptoSums)=>{
      return knex('trades')
        .select('trade_id','date_trade','trade_buy_symbol','amount','fee','total_cost','fee_coin_symbol','trade_sell_symbol')
        .where('trade_type','=','SELL')
        .then((allTradesSell)=>{
          allTradesSell.forEach((singleTradeSell)=>{
            allCryptoSums[singleTradeSell.trade_sell_symbol] += parseFloat(singleTradeSell.total_cost);
            allCryptoSums[singleTradeSell.trade_buy_symbol]  -= parseFloat(singleTradeSell.amount);
            if ( singleTradeSell.trade_sell_symbol === singleTradeSell.fee_coin_symbol ) {
              allCryptosBought[singleTradeSell.trade_sell_symbol] -= parseFloat(singleTradeSell.fee);
            } else {
              strayBNBFees.push([
                singleTradeSell.trade_id,
                singleTradeSell.date_trade,
                parseFloat(singleTradeSell.fee),
                singleTradeSell.fee_coin_symbol,
                singleTradeSell.trade_sell_symbol
              ])
            }
          })
          return allCryptoSums;
        })
    }).then((allCryptosSumsWithNegatives)=>{
      //HACK --> technically, this is a hack.  10 July 2018
      //But since I only purchase ETH from coinbase, don't see an immediate problem.
      //this knex query will pull every coinbase ETH purchase transferred to binance
      return knex('purchases')
        .sum('pch_units')
        .where('symbol','=','ETH')
        .where('withdrawn','=',true)
        .then((knexResult)=>{
          allCryptosSumsWithNegatives['ETH'] += parseFloat(knexResult[0].sum)
          return allCryptosSumsWithNegatives;
        })
    }).then((allCryptosSumsProper)=>{
      Object.keys(allCryptosSumsProper).forEach((singleCryptoSum)=>{
        let obj = {};
        obj.symbol = singleCryptoSum;
        obj.weighted_usd_per_unit = null;
        obj.liquid_units = allCryptosSumsProper[singleCryptoSum];
        obj.from = 'trades';
        insertIntoBalancesTable.push(obj);
      })
      return knex('balances')
        .insert(insertIntoBalancesTable)
        .then((done)=>{
          console.log('calculated all balances from all trades');
          knex.destroy();
        })
    })
