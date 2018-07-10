const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);
const _ = require('underscore');

let strayBNBFees = [];
let insertIntoBalancesTable = [];

knex('trades')
  .distinct('trade_buy')
  .select()
  .where('type','=','BUY')
  .then((allUniqueCryptos)=>{
    let allCryptosBought = {};
    allUniqueCryptos.forEach((cryptoCurrency)=>{
      allCryptosBought[cryptoCurrency.trade_buy] = 0;
    })
    //HACK -- 10 July 2018
    //NOTE: which knexQuery will return to me all the cryptos I trade?
    allCryptosBought['ETH'] = 0;
    allCryptosBought['BTC'] = 0;
    return allCryptosBought;
  })
  .then((allCryptosBoughtObj)=>{
    return knex('trades')
      .select('trade_id','date_trade','trade_buy','amount','fee','total','fee_coin_symbol','trade_sell')
      .where('type','=','BUY')
      .then((allTradesBuy)=>{
        allTradesBuy.forEach((singleTradeBuy)=>{
          //add amount to trade_buy (symbol)
          allCryptosBoughtObj[singleTradeBuy.trade_buy] += parseFloat(singleTradeBuy.amount)
          //subtract amount from trade_sell
          allCryptosBoughtObj[singleTradeBuy.trade_sell] -= parseFloat(singleTradeBuy.total)

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
    })
    .then((allCryptoSums)=>{
      return knex('trades')
        .select('trade_id','date_trade','trade_buy','amount','fee','total','fee_coin_symbol','trade_sell')
        .where('type','=','SELL')
        .then((allTradesSell)=>{
          allTradesSell.forEach((singleTradeSell)=>{
            allCryptoSums[singleTradeSell.trade_sell] += parseFloat(singleTradeSell.total);
            allCryptoSums[singleTradeSell.trade_buy]  -= parseFloat(singleTradeSell.amount);
            if ( singleTradeSell.trade_sell === singleTradeSell.fee_coin_symbol ) {
              allCryptosBought[singleTradeSell.trade_sell] -= parseFloat(singleTradeSell.fee);
            } else {
              strayBNBFees.push([
                singleTradeSell.trade_id,
                singleTradeSell.date_trade,
                parseFloat(singleTradeSell.fee),
                singleTradeSell.fee_coin_symbol,
                singleTradeSell.trade_sell
              ])
            }
          })
          return allCryptoSums;
        })
    })
    .then((allCryptosSumsWithNegatives)=>{
      //HACK --> technically, this is a hack.  10 July 2018
      //But since I only purchase ETH from coinbase, don't see an immediate problem.
      //this knex query will pull every coinbase ETH purchase transferred to binance

      return knex('purchases(pch)')
        .sum('pch_units')
        .where('symbol','=','ETH')
        .where('withdrawn','=',true)
        .then((knexResult)=>{
          allCryptosSumsWithNegatives['ETH'] += parseFloat(knexResult[0].sum)
          return allCryptosSumsWithNegatives;
        })
    })
    .then((allCryptosSumsProper)=>{
      console.log('allCryptosSumsProper',allCryptosSumsProper);
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
