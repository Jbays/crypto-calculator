const allTradeConversions = require('../data/conversions');

exports.seed = (knex, Promise)=> {
  return knex('trades_conversions').del()
    .then(()=>{
      return knex('trades_conversions')
        .insert(allTradeConversions)
        .catch((err)=>{
          console.error('error while inserting trades conversions',err);
        });
    })
    .catch((err)=>{
      console.error('error in trades_conversions.js seed file',err);
    })
};
