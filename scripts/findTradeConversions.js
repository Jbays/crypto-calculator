const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);
const secret = require('../data/cryptoCurrencyChartSecret');
const key = require('../data/cCCKey');

const axios = require('axios');
const _ = require('underscore');

let axiosGetTradeIdSequence = [];

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
    return response.map((singleTradeConversion)=>{
      //maps trade_sell_symbol to its cryptocurrencychart's equivalent id
      singleTradeConversion.trade_sell_symbol = mapCryptoToId[singleTradeConversion.trade_sell_symbol.toLowerCase()];
      //format ISO with Time to YYYY-MM-DD
      singleTradeConversion.date_trade = singleTradeConversion.date_trade.toISOString().substring(0,10);
      return singleTradeConversion
    })
  })
  .then((response)=>{
    console.log('!!response',response);
    response.forEach((singleTradeBuy)=>{
      axiosGetTradeIdSequence.push(singleTradeBuy.trade_id)
    })
    //NOTE: this response data is compatible with cryptocurrencychart's api.
    let baseUrl = `https://www.cryptocurrencychart.com/api/coin/view/${response[0].trade_sell_symbol}/${response[0].date_trade}/USD`;
    let baseUrl2 = `https://www.cryptocurrencychart.com/api/coin/view/2471/${response[0].date_trade}/USD`;

    const config = {
      headers:{
        Key: key,
        Secret: secret
      }
    }

    return axios.all([axios.get(baseUrl,config),axios.get(baseUrl2,config)])
      .then((response)=>{
        //this returns an array of response objects
        return [response[0].data,response[1].data]
      })
      .catch((err)=>{
        console.error('this is error is from axios.all',err)
      })

    //this works.  now I need to get the promise.all version of this working.
    // return axios.get(baseUrl,config)
    //   .then((axiosResponse)=>{
    //     console.log('this is axiosResponse',axiosResponse);
    //     return axiosResponse.data
    //   })
    //   .catch((err)=>{
    //     console.error('this is your error',err);
    //   })
  })
  .then((response)=>{
    console.log('trade id sequence',axiosGetTradeIdSequence);

    console.log('at the end response',response)

    knex('trades_conversions')
      .where('trade_id','=',axiosGetTradeIdSequence[0])
      .update({
        usd_per_unit: response[0].coin.price,
        bnb_price_usd: response[1].coin.price
      })
      .then((knexResponse)=>{
        console.log('this is knexResponse',knexResponse);
      })
  })

//for trade_type = SELL,
//I also need trade_buy_symbol
// knex('trades')
//   .join('trades_conversions','trades.trade_id','=','trades_conversions.trade_id')
//   .select('trades.trade_id','date_trade','trade_buy_symbol')
//   .then((response)=>{
//     console.log('this is response',response);
//   })