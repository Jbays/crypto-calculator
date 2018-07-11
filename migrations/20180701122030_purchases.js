const purchaseData = require('../data/purchases');

exports.up = (knex, Promise)=>{
  return knex.schema.createTable('purchases',(table)=>{
    table.increments('pch_id');
    table.date('pch_date');
    table.string('symbol');
    // table.foreign('symbol').references('coins_index.symbol');
    table.decimal('pch_usd_per_unit')
    table.decimal('pch_units',16,10)
    table.boolean('withdrawn')
    // NOTE: create trades table then comment in code below
    // table.string('trade_id')
    // table.foreign('trade_id').references('trades.trade_id')
  })
  .then((response)=>{
    return knex('purchases').insert(purchaseData)
  })
  .catch((err)=>{
    return console.error("error from purchase migration",err)
  })
};

exports.down = (knex, Promise)=>{
  return knex.schema.dropTable('purchases');
};
