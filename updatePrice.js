const env = 'development';
const config = require('./knexfile')[env];
const knex = require('knex')(config);

const axios = require('axios');

//NOTE: to add more coins, I have to look at the ticket's id.
//if the id changes, then my profitiability will MISCALCULATE!
const coinsInvested = [
  1,    //bitcoin
  1027, //ethereum
  1839, //binance coin
  328,  //monero
  131,  //dash
  1908, //nebulas
  52,   //ripple
  2010, //cardano
  1765, //eos
  2,    //litecoin
]

axios.get('https://api.coinmarketcap.com/v2/ticker/')
  .then((response)=>{
    let promiseArr = [];

    coinsInvested.forEach((coinCapMarketId,index)=>{
      promiseArr.push(
         knex('coins_index')
          .where('symbol','=',response.data['data'][coinCapMarketId].symbol)
          .update({'usd_per_unit':response.data['data'][coinCapMarketId]['quotes']['USD']['price']})
          .catch((err)=>{
            return console.error("this is your problem, boss",err,'with this id',index+1)
          })
      )
      console.log('when is this executed?');
    })

    return Promise.all(promiseArr)
  })
  .catch((err)=>{
    return console.error('your get request failed',err);
  })
