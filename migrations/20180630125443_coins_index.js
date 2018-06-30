const knex = require('knex');

exports.up = function(knex, Promise) {
  return knex.schema.createTable('coins_index',(table)=>{
    table.increments().primary();
    table.string('coin_name');
    table.string('coin_abbreviation');
    table.decimal('usd_per_unit');
  }).then((response)=>{
    return knex('coins_index')
      .insert([{coin_name:'Bitcoin',coin_abbreviation:'BTC',usd_per_unit:6357.04},
                {coin_name:'Ethereum',coin_abbreviation:'ETH',usd_per_unit:447.578},
                {coin_name:'Binance Coin',coin_abbreviation:'BNB',usd_per_unit:14.4759},
                {coin_name:'Monero',coin_abbreviation:'XMR',usd_per_unit:131.075},
                {coin_name:'Dash',coin_abbreviation:'DASH',usd_per_unit:235.537},
                {coin_name:'Nebulas',coin_abbreviation:'NAS',usd_per_unit:4.7941},
                {coin_name:'Ripple',coin_abbreviation:'XRP',usd_per_unit:0.459986},
                {coin_name:'Cardano',coin_abbreviation:'ADA',usd_per_unit:0.135845},
                {coin_name:'EOS',coin_abbreviation:'EOS',usd_per_unit:8.06736},
                {coin_name:'Litecoin',coin_abbreviation:'LTC',usd_per_unit:80.4113}])
  }).then((response)=>{
    console.log("do this next thing");
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('coins_index');
};
