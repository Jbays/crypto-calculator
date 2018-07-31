exports.up = (knex, Promise)=> {
  return knex.schema.dropTableIfExists('balances')
    .then(()=>{
      return knex.schema.createTable('balances',(table)=>{
        table.string('symbol').primary();
        table.foreign('symbol').references('coins_index.symbol');
        table.decimal('weighted_usd_per_unit')
        table.decimal('liquid_units',16,10);
      })
    });
}

exports.down = (knex, Promise)=> {
  return knex.schema.dropTable('balances');
};
