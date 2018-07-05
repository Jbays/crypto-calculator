const tradeData = require('../data/trades');

exports.up = (knex, Promise)=> {
  return knex.schema.createTable('trades',(table)=>{
    table.dateTime('date_trade');
    table.string('type');
    table.increments('trade_id');
    table.string('trade_buy');
    table.string('trade_sell');
    table.decimal('price',16,10);
    table.decimal('amount',16,10);
    table.decimal('total',16,10);
    table.decimal('fee',16,10);
    table.string('fee_coin_symbol');
    //should this table have a purchase_id??
  })
  .then((response)=>{
    return knex('trades').insert(tradeData)
  })
  .catch((err)=>{
    return console.error('error from trades migration',err);
  })
};

exports.down = (knex, Promise)=> {
  return knex.schema.dropTable('trades');
};
