const knex = require('knex');

exports.up = (knex, Promise)=> {
  return knex.schema.createTable('balances',(table)=>{
    table.string('symbol');
    table.foreign('symbol').references('coins_index.symbol');
    table.decimal('weighted_usd_per_unit')
    table.decimal('liquid_units',16,10);
    // table.string('location')
  })

};

exports.down = (knex, Promise)=> {
  knex.schema.dropTable('balances');
};