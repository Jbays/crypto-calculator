const knex = require('knex');

exports.up = (knex, Promise)=>{
  return knex.schema.createTable('purchases(pch)',(table)=>{
    table.increments('pch_id');
    table.date('pch_date');
    table.string('symbol');
    table.foreign('symbol').references('coins_index.symbol');
    table.decimal('pch_usd_per_unit')
    table.decimal('pch_units',16,10)
    table.boolean('traded')
    // NOTE: create trades table then comment in code below
    // table.string('trade_id')
    // table.foreign('trade_id').references('trades.trade_id')
  })
  .then((response)=>{
    return knex('purchases(pch)')
      .insert([
        {symbol:'ETH',pch_date:'8 march 2018',pch_usd_per_unit:679.75,pch_units:1.1596374,traded:true},
        {symbol:'ETH',pch_date:'17 march 2018',pch_usd_per_unit:552.15,pch_units:1.42762706,traded:false},
        {symbol:'LTC',pch_date:'24 march 2018',pch_usd_per_unit:167.99,pch_units:1,traded:false},
        {symbol:'ETH',pch_date:'26 march 2018',pch_usd_per_unit:488.73,pch_units:1,traded:true},
        {symbol:'ETH',pch_date:'30 march 2018',pch_usd_per_unit:394.98,pch_units:1.995721,traded:false},
        {symbol:'ETH',pch_date:'15 may 2018',pch_usd_per_unit:717.38,pch_units:1,traded:false},
        {symbol:'ETH',pch_date:'10 june 2018',pch_usd_per_unit:521.03,pch_units:1.13465156,traded:true},
        {symbol:'ETH',pch_date:'28 june 2018',pch_usd_per_unit:438.62,pch_units:2.24639793,traded:true}
      ])
  })
  .catch((err)=>{
    return console.error("error from purchase migration",err)
  })
};

exports.down = (knex, Promise)=>{
  return knex.schema.dropTable('purchases(pch)');
};
