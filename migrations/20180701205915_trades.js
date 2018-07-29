const tradeData = require('../data/trades');

exports.up = (knex, Promise)=> {
  return knex.schema.createTable('trades',(table)=>{
    table.dateTime('date_trade');
    table.increments('trade_id').primary();
    table.string('trade_buy_symbol');
    //table.foreign('trade_buy_symbol').references('coins_index.symbol)
    table.string('trade_sell_symbol');
    //table.foreign('trade_sell_symbol').references('coins_index.symbol)
    table.decimal('price',16,10);
    table.decimal('amount',16,10);
    table.decimal('total_cost',16,10);
    table.decimal('fee',16,10);
    table.string('fee_coin_symbol');
    //table.foreign('fee_coin_symbol').references('coins_index.symbol)
  })
  .then((response)=>{
    let simplifiedTradeData = tradeData.map((singleTrade)=>{
      if ( singleTrade.trade_type === 'SELL' ) {
        //variable swap!
        [singleTrade.trade_buy_symbol, singleTrade.trade_sell_symbol] = [singleTrade.trade_sell_symbol, singleTrade.trade_buy_symbol];
        [singleTrade.amount, singleTrade.total_cost] = [singleTrade.total_cost, singleTrade.amount];
      }
      delete singleTrade.trade_type;
      return singleTrade;
    });

    return knex('trades').insert(simplifiedTradeData)
  })
  .catch((err)=>{
    return console.error('error from trades migration',err);
  })
};

exports.down = (knex, Promise)=> {
  return knex.schema.dropTable('trades');
};
