exports.up = (knex, Promise)=>{
  return knex.schema.createTable('coins_index',(table)=>{
    table.string('symbol').primary();
    table.string('coin_name');
    table.decimal('usd_per_unit');
  })
  .catch((err)=>{
    return console.error("error from coins_index migration",err)
  })
};

exports.down = (knex, Promise)=>{
  return knex.schema.dropTable('coins_index');
};
