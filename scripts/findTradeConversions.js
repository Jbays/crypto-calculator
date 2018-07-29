const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);

const axios = require('axios');
const secret = require('../data/cryptoCurrencyChartSecret');
const key = require('../data/cCCKey');
const axiosConfig = {headers: {Key: key,Secret: secret}}

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

knex('trades')
  .join('trades_conversions','trades.trade_id','=','trades_conversions.trade_id')
  .select('trades.trade_id','date_trade','trade_sell_symbol')
  .then((tradesNeedingConversions)=>{
    return tradesNeedingConversions.map((singleTradeConversion)=>{
      //maps trade_sell_symbol to its cryptocurrencychart's equivalent id
      singleTradeConversion.trade_sell_symbol = mapCryptoToId[singleTradeConversion.trade_sell_symbol.toLowerCase()];
      //format ISO with Time to YYYY-MM-DD
      singleTradeConversion.date_trade = singleTradeConversion.date_trade.toISOString().substring(0,10);
      return singleTradeConversion
    })
  })
  .then((tradesReadyForCryptoApi)=>{
    let axiosPromiseArr = [];

    tradesReadyForCryptoApi.forEach((singleTrade,index)=>{
      axiosGetTradeIdSequence.push(singleTrade.trade_id);
      
      //many of these requests are duplicates.  In the future, I should optimize this request builder.
      //request-builder should remove duplicate api calls.
      axiosPromiseArr.push(axios.all([
        singleTrade.trade_id,
        axios.get(`https://www.cryptocurrencychart.com/api/coin/view/${tradesReadyForCryptoApi[index].trade_sell_symbol}/${tradesReadyForCryptoApi[index].date_trade}/USD`,axiosConfig),
        axios.get(`https://www.cryptocurrencychart.com/api/coin/view/2471/${tradesReadyForCryptoApi[index].date_trade}/USD`,axiosConfig),
      ]))
    })

    return axios.all(axiosPromiseArr);
  })
  .then((axiosResult)=>{
    let knexPromiseArr = [];

    axiosResult.forEach((responseObj)=>{
      knexPromiseArr.push(
        knex('trades_conversions')
          .where('trade_id','=',responseObj[0])
          .update({
            usd_per_unit: responseObj[1].data.coin.price,
            bnb_price_usd: responseObj[2].data.coin.price
          })
          .catch((err)=>{
            console.error('you have an error with trade_conversions update w/trade_id:',responseObj[0]);
          })
      )
    })
    return Promise.all(knexPromiseArr);
  })
  .then((done)=>{
    console.log('successfully queried cryptocurrencycharts.com,','\n',
            'prices in usd at date_time for:','\n',
            'trade_sell_symbol price(usd)','\n',
            'and bnb_price')
    knex.destroy();
  })
  .catch((err)=>{
    console.error('find all tradeConversions error',err);
  })