exports.up = (knex, Promise)=>{
  return knex.schema.createTable('coins_index',(table)=>{
    table.string('symbol').primary();
    table.string('coin_name');
    table.decimal('usd_per_unit');
  }).then((response)=>{
    return knex('coins_index').insert([
      {coin_name:'Bitcoin',symbol:'BTC',usd_per_unit:6357.04},
      {coin_name:'Ethereum',symbol:'ETH',usd_per_unit:447.578},
      {coin_name:'Binance Coin',symbol:'BNB',usd_per_unit:14.4759},
      {coin_name:'Monero',symbol:'XMR',usd_per_unit:131.075},
      {coin_name:'Dash',symbol:'DASH',usd_per_unit:235.537},
      {coin_name:'Nebulas',symbol:'NAS',usd_per_unit:4.7941},
      {coin_name:'Ripple',symbol:'XRP',usd_per_unit:0.459986},
      {coin_name:'Cardano',symbol:'ADA',usd_per_unit:0.135845},
      {coin_name:'EOS',symbol:'EOS',usd_per_unit:8.06736},
      {coin_name:'Litecoin',symbol:'LTC',usd_per_unit:80.4113}
    ])
  })
  .catch((err)=>{
    return console.error("error from coins_index migration",err)
  })
};

exports.down = (knex, Promise)=>{
  return knex.schema.dropTable('coins_index');
};
