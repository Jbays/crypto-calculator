const cryptoPrices = require('../data/cryptoPricesAt30June2018');

exports.seed = (knex, Promise)=>{
  return knex('coins_index').del()
    .then(()=> {
      return knex('coins_index')
        .insert(cryptoPrices)
        .catch((err)=>{
          console.error('error while inserting coins_index data',err);
        });
    })
    .catch((err)=>{
      console.error('error in coins_index seed file',err);
    });
};
