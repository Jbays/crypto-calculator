const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);

const axios = require('axios');
const _ = require('underscore');

//IDs from www.cryptocurrencychart.com
const mapCryptoToId = {
  'btc': 363,
  'eth': 364,
  'bnb': 2471,
  'xmr': 370,
  'dash': 367,
  'ltc': 366,
  'xrp': 365,
  'ada': 2796,
  'eos': 2391,
  'nas': 3128
};

//NOTE: knex join table on trades && trades_conversions
//join on trade_id
//from trades table, I need date_trade,

//for trade_type = BUY,
//I also need trade_sell_symbol
knex('trades')
  .join('trades_conversions','trades.trade_id','=','trades_conversions.trade_id')
  .select('trades.trade_id','date_trade','trade_sell_symbol')
  .where('trades.trade_type','=','BUY')
  .then((response)=>{
    console.log('this is response',response);
  })

//for trade_type = SELL,
//I also need trade_buy_symbol
// knex('trades')
//   .join('trades_conversions','trades.trade_id','=','trades_conversions.trade_id')
//   .select('trades.trade_id','date_trade','trade_buy_symbol')
//   .then((response)=>{
//     console.log('this is response',response);
//   })

// const baseUrl = `https://www.cryptocurrencychart.com/api/coin/view/`;

// axios.get('thisURL')
//   .then((response)=>{
//
//   });
