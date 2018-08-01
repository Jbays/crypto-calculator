const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);

// knex('trade_conversions')
//   .select('*')
//   where('trade_id','=')
knex('trades')
  .select('*')
  .where('trade_buy_symbol','=','XMR')
  .then((response)=>{
    let weighted_cost_per_unit = null;

    response.forEach((xmrTrade)=>{
      let price = xmrTrade.price;
      let amount = xmrTrade.amount;

      //NOTE: really should be amount - fee (but this will work for now)

      //in updateBalancePurchases,
      //weighted_cost_per_unit = (pch_units/sum)*pch_usd_per_unit;
      
      //for trades
      
      //to calculate the weighted_cost_per_unit,
      //I need the amount, sum, trade_sell_price @ date_trade, and price
      
      //and technically -- must subract the fees from amount
      //do I need the xmr cost on that day?
      //I can derive the xmr cost (price*trade_sell_symbol @ date_trade)
      // console.log('hello',price*435.21);
      //real sum = 8.241233;
      //trade_sell_symbol @ date_trade = 435.21;
      
      console.log('before',weighted_cost_per_unit)
      weighted_cost_per_unit += (amount /8.241233)*(435.21*price);
      console.log('after',weighted_cost_per_unit)
      
      //400 is dummy data.  More accurate is the price of ( trade_sell_symbol @ date_trade * price ) !
      //will need the trades_conversions table!^^
    });

    knex.destroy();
  })