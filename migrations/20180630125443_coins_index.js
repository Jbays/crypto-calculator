const knex = require('knex');

exports.up = function(knex, Promise) {
  return knex.schema.createTable('coins_index_2',(table)=>{
    table.increments().primary();
    table.string('coin_name');
    table.string('coin_abbreviation');
    table.decimal('usd per unit',2);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('coins_index_2');
};
