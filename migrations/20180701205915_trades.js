const knex = require('knex');

//NOTE: what's left in wallet is (total - fee)
//NOTE:   where traded = false

exports.up = (knex, Promise)=> {
  return knex.schema.createTable('trades',(table)=>{
    table.dateTime('date_trade');
    table.increments('trade_id');
    table.string('market');
    table.string('type');
    table.decimal('price',16,10);
    table.decimal('amount',16,10);
    table.decimal('total',16,10);
    table.decimal('fee',16,10);
    table.string('fee_coin_symbol');
    table.boolean('traded');
    //should this table have a purchase_id??
  })
  .then((response)=>{
    return knex('trades').insert([
      {date_trade:'2018-03-17 20:32:16',market:'EOSETH',type:'BUY',price:0.00833,amount:69.01,total:0.5748533,fee:0.06901,fee_coin_symbol:'EOS',traded:true},
      {date_trade:'2018-03-17 20:38:28',market:'XRPETH',type:'BUY',price:0.00113358,amount:507,total:0.57472506,fee:0.507,fee_coin_symbol:'XRP',traded:false},
      {date_trade:'2018-04-28 01:33:01',market:'ADAETH',type:'BUY',price:0.00043965,amount:2297,total:1.00987605,fee:2.297,fee_coin_symbol:'ADA',traded:false},
      {date_trade:'2018-05-16 03:22:00',market:'XMRETH',type:'BUY',price:0.283,amount:1.767,total:0.500061,fee:0.001767,fee_coin_symbol:'XMR',traded:false},
      {date_trade:'2018-05-16 03:23:19',market:'DASHETH',type:'BUY',price:0.5807,amount:0.861,total:0.4999827,fee:0.000861,fee_coin_symbol:'DASH',traded:false}
    ])
  })
  .catch((err)=>{
    return console.error('error from trades migration',err);
  })
};

exports.down = (knex, Promise)=> {
  return knex.schema.dropTable('trades');
};
