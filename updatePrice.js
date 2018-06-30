const axios = require('axios');

//NOTE: request address
// 'https://api.coinmarketcap.com/v2/ticker/'

//NOTE: to add more coins, I have to look up
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

//NOTE: when should this script run?  On opening of the app?
axios.get('https://api.coinmarketcap.com/v2/ticker/')
  .then((response)=>{
    //probably should use a filter
    coinsInvested.forEach((cryptoIndex)=>{
      console.log("this is what I want",response.data['data'][cryptoIndex]['name'])
      console.log("this is what I want",response.data['data'][cryptoIndex]['symbol'])
      console.log("this is what I want",response.data['data'][cryptoIndex]['quotes']['USD']['price'])
    })

  })
