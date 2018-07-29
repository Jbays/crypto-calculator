exports.up = (knex, Promise)=> {
  return knex.schema.createTable('trades_conversions',(table)=>{
    table.integer('trade_id');
    table.foreign('trade_id').references('trades.trade_id')
    table.decimal('usd_per_unit');
    table.decimal('bnb_price_usd');
  })
};

exports.down = (knex, Promise)=> {
  return knex.schema.dropTable('trades_conversions');
};
