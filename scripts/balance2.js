const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);

let strayBNBFees = [];
let insertIntoBalanceTable = [];

knex('trades')
  .distinct('trade_buy_symbol')
  .select()
  .then((allUniqueCryptos) => {
    let allCryptosBought = {};
    allUniqueCryptos.forEach((cryptoCurrency) => {
      allCryptosBought[cryptoCurrency.trade_buy_symbol] = 0;
    })
    return allCryptosBought;
  })
  .then((allCryptosBought)=>{
    return knex('trades')
      .select('trade_id', 'trade_buy_symbol', 'amount', 'fee', 'total_cost', 'fee_coin_symbol', 'trade_sell_symbol')
      .then((allTrades) => {
        allTrades.forEach((singleTrade) => {
          //add amount to trade_buy_symbol
          allCryptosBought[singleTrade.trade_buy_symbol] += parseFloat(singleTrade.amount);
          //subtract amount from trade_sell_symbol
          allCryptosBought[singleTrade.trade_sell_symbol] -= parseFloat(singleTrade.total_cost);

          //if trade_buy_symbol is equal to fee_coin_symbol
          if (singleTrade.trade_buy_symbol === singleTrade.fee_coin_symbol) {
            allCryptosBought[singleTrade.trade_buy_symbol] -= parseFloat(singleTrade.fee);
          } else {
            strayBNBFees.push({
              trade_id: singleTrade.trade_id
            });
          }
        })
        return allCryptosBought;
      })
  })
  .then((allCryptosWithSums)=>{
    //this step removes all the negative ETH from the balances object.
    return knex('purchases')
    .sum('pch_units')
    .where('symbol', '=', 'ETH')
    .where('withdrawn', '=', true)
    .then((knexResult) => {
      allCryptosWithSums['ETH'] += parseFloat(knexResult[0].sum);
      return allCryptosWithSums
    })
  })
  .then((allCryptoSumsProper)=>{
    //this promiseArr is used to fetch all entries in the balance table.
    let promiseArr = [];

    Object.keys(allCryptoSumsProper).forEach((singleCryptoSum)=>{
      let obj = {};
      obj.symbol = singleCryptoSum;
      obj.weighted_usd_per_unit = null;
      obj.liquid_units = allCryptoSumsProper[singleCryptoSum];

      promiseArr.push(
        knex('balances')
          .where('symbol','=',singleCryptoSum)
          .select()  
      )

      insertIntoBalanceTable.push(obj);
    });

    return Promise.all(promiseArr);
  })
  .then((knexResponse)=>{
    //NOTE 1: this is def. working -- but may not be the best possible way.
    //my issue is I'm doing logic on the knexResponse but what I return is insertIntoBalanceTable.
    //So shouldn't I instead do logic on insertIntoBalanceTable?

    //NOTE 2: I bet here's a great place to calculate the weighted_usd_per_unit FOR ALL CRYPTOS!
    //NOT JUST ETH.

    knexResponse.forEach((balanceEntry,index)=>{
      if ( balanceEntry.length > 0 ) {
        //diff is the difference between liquid units in the balance table vs liquid units in the trades table.
        //MUST be of the same unique crypto
        let diff = balanceEntry[0].liquid_units - insertIntoBalanceTable[index].liquid_units;
        
        insertIntoBalanceTable[index].liquid_units = diff;
        //recalculates the weighted_usd_per_unit && attaches value to the corresponding sums entry
        insertIntoBalanceTable[index].weighted_usd_per_unit = parseFloat((balanceEntry[0].weighted_usd_per_unit*(balanceEntry[0].liquid_units/diff)).toFixed(2));
      }
    })
    return insertIntoBalanceTable;
  })
  .then((allBalanceEntries)=>{
    //this promiseArr is used to update / insert entries into the balances table
    let promiseArr = [];
    //now I can reach into the balances && update where appropriate.

    allBalanceEntries.forEach((singleBalance)=>{
      promiseArr.push(
        knex('balances')
          .where('symbol','=',singleBalance.symbol)
          .select()
          .update({
            symbol: singleBalance.symbol,
            weighted_usd_per_unit: singleBalance.weighted_usd_per_unit,
            liquid_units: singleBalance.liquid_units,
            from: singleBalance.from
          })
      )
    })
    return Promise.all(promiseArr);
  })
  .then((postUpdate)=>{
    let promiseArr = [];

    postUpdate.forEach((unsuccessfulUpdates,index)=>{
      if ( unsuccessfulUpdates === 0 ) {
        promiseArr.push(
          knex('balances')
            .where('symbol','=',insertIntoBalanceTable[index].symbol)
            .insert({
              symbol: insertIntoBalanceTable[index].symbol,
              weighted_usd_per_unit: insertIntoBalanceTable[index].weighted_usd_per_unit,
              liquid_units: insertIntoBalanceTable[index].liquid_units,
            })
        )
      }
    });

    return Promise.all(promiseArr)
  })
  .then((done)=>{
    console.log(
      'for each crypto,', '\n',
      'inserted into balance table is:', '\n',
      'a crypto database entry with fields symbol, weighted_usd_per_unit, and liquid_units'
    );
    knex.destroy();
  })

  
