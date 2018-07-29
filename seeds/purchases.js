const allPurchases = require('../data/purchases')

exports.seed = (knex, Promise) => {
  return knex('purchases').del()
    .then( ()=> {
      return knex('purchases')
        .insert(allPurchases)
        .catch((err)=>{
          console.error('error while inserting purchase data',err);
        });
    })
    .catch((err)=>{
      console.error('error in purchases.js seed file',err);
    })
};
