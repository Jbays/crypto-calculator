const axios = require('axios');


//NOTE: request address
// 'https://api.coinmarketcap.com/v2/ticker/'

const coinsInvested = [
  1, //bitcoin
  2, //litecoin
  1027, //ethereum
  1765, //eos
  1839, //binance coin
  328, //monero
  131, //dash
  52, //ripple
  2010, //cardano
  1908, //nebulas
]

axios.get('https://api.coinmarketcap.com/v2/ticker/')
  .then((response)=>{
    console.log("response.data",JSON.stringify(response.data))
  })
