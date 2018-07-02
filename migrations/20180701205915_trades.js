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
    //should this table have a purchase_id??
  })
  .then((response)=>{
    return knex('trades').insert([
      {date_trade:'2018-03-17 20:32:16',market:'EOSETH',type:'BUY',price:0.00833,amount:69.01,total:0.5748533,fee:0.06901,fee_coin_symbol:'EOS'},
      {date_trade:'2018-03-17 20:38:28',market:'XRPETH',type:'BUY',price:0.00113358,amount:507,total:0.57472506,fee:0.507,fee_coin_symbol:'XRP'},
      {date_trade:'2018-04-28 01:33:01',market:'ADAETH',type:'BUY',price:0.00043965,amount:2297,total:1.00987605,fee:2.297,fee_coin_symbol:'ADA'},
      {date_trade:'2018-05-16 03:22:00',market:'XMRETH',type:'BUY',price:0.283,amount:1.767,total:0.500061,fee:0.001767,fee_coin_symbol:'XMR'},
      {date_trade:'2018-05-16 03:23:19',market:'DASHETH',type:'BUY',price:0.5807,amount:0.861,total:0.4999827,fee:0.000861,fee_coin_symbol:'DASH'},
      {date_trade:'2018-06-10 22:11:12',market:'DASHETH',type:'BUY',price:0.52481,amount:0.998,total:0.52376038,fee:0.000998,fee_coin_symbol:'DASH'},
      {date_trade:'2018-06-10 22:14:18',market:'BNBETH',type:'BUY',price:0.026562,amount:10,total:0.26562,fee:0.005,fee_coin_symbol:'BNB'},
      {date_trade:'2018-06-10 22:14:49',market:'BNBETH',type:'BUY',price:0.026562,amount:1.91,total:0.05073342,fee:0.000955,fee_coin_symbol:'BNB'},
      {date_trade:'2018-06-10 22:14:54',market:'BNBETH',type:'BUY',price:0.026562,amount:11.02,total:0.29271324,fee:0.00551,fee_coin_symbol:'BNB'},
      {date_trade:"2018-06-22 13:18:34",market:"EOSETH",type:"SELL",price:0.018747,amount:0.8,total:0.0149976,fee:0.00022284,fee_coin_symbol:"BNB"},
      {date_trade:"2018-06-22 13:18:35",market:"EOSETH",type:"SELL",price:0.018741,amount:3.76,total:0.07046616,fee:0.00104678,fee_coin_symbol:"BNB"},
      {date_trade:"2018-06-28 15:36:59",market:"XMRETH",type:"BUY",price:0.30048,amount:0.002,total:0.00060096,fee:0.00000902,fee_coin_symbol:"BNB"},
      {date_trade:"2018-06-28 15:42:29",market:"XMRETH",type:"BUY",price:0.30048,amount:3.463,total:1.04056224,fee:0.01563883,fee_coin_symbol:"BNB"},
      {date_trade:"2018-06-28 15:42:47",market:"XMRETH",type:"BUY",price:0.30048,amount:1.887,total:0.56700576,fee:0.00851291,fee_coin_symbol:"BNB"},
      {date_trade:"2018-06-28 15:43:50",market:"XMRETH",type:"BUY",price:0.30048,amount:0.973,total:0.29236704,fee:0.00437629,fee_coin_symbol:"BNB"},
      {date_trade:"2018-06-28 15:44:28",market:"XMRETH",type:"BUY",price:0.30048,amount:0.095,total:0.0285456,fee:0.00042809,fee_coin_symbol:"BNB"},
      {date_trade:"2018-06-28 15:45:03",market:"XMRETH",type:"BUY",price:0.30048,amount:1.056,total:0.31730688,fee:0.00475279,fee_coin_symbol:"BNB"},
      {date_trade:"2018-06-29 13:08:48",market:"XMRBTC",type:"SELL",price:0.020515,amount:0.054,total:0.00110781,fee:0.00023564,fee_coin_symbol:"BNB"},
      {date_trade:"2018-06-29 13:10:30",market:"XMRBTC",type:"SELL",price:0.020515,amount:0.946,total:0.01940719,fee:0.00411822,fee_coin_symbol:"BNB"},
      {date_trade:"2018-06-29 13:13:41",market:"ETHBTC",type:"SELL",price: 0.069847,amount:0.3,total:0.0209541,fee:0.00442505,fee_coin_symbol:"BNB"},
      {date_trade:"2018-06-29 13:22:15",market:"ETHBTC",type:"SELL",price:0.069847,amount:0.992,total:0.069288224,fee:0.0146602,fee_coin_symbol: "BNB"},
      {date_trade:"2018-06-29 14:34:28",market:"NASBTC",type:"BUY",price:0.000779,amount:19,total:0.014801,fee:0.00312674,fee_coin_symbol:"BNB"},
      {date_trade:"2018-06-29 14:34:57",market:"NASBTC",type:"BUY",price:0.000779,amount:14.12,total:0.01099948,fee:0.00231903,fee_coin_symbol:"BNB"},
      {date_trade:"2018-06-29 14:35:55",market:"NASBTC",type:"BUY",price:0.000779,amount:109.05,total:0.08494995,fee:0.01794415,fee_coin_symbol: "BNB"},
    ])
  })
  .catch((err)=>{
    return console.error('error from trades migration',err);
  })
};

exports.down = (knex, Promise)=> {
  return knex.schema.dropTable('trades');
};
