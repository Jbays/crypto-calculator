const knex = require('knex');

//NOTE: what's left in wallet is (total - fee)
//NOTE:   where traded = false

exports.up = (knex, Promise)=> {
  return knex.schema.createTable('trades',(table)=>{
    table.date('trade_date');
    table.increments('trade_id');
    table.string('market');
    table.string('type');
    table.decimal('price',16,10);
    table.decimal('amount',16,10);
    table.decimal('total',16,10);
    table.decimal('fee',16,10);
    table.string('fee_coin_symbol');
    table.boolean('traded');
    //should this table have a purchase_id??
  })
  .then((response)=>{
    return knex('trades').insert([
      //17 march 2018
      // {trade_date:'17 march 2018',before_symbol:'ETH',after_symbol:'EOS',conversion:'',units_before:'',units_after:'',traded:true},

      {trade_date:'2018-03-17 20:32:16',market:'EOSETH',type:'BUY',price: 0.00833,amount: 69.01,total: 0.5748533,fee:0.06901,fee_coin_symbol:'EOS',traded:true}
    ])
  })
  .catch((err)=>{
    return console.error("error from trades migration",err);
  })
};

exports.down = (knex, Promise)=> {
  return knex.schema.dropTable('trades');
};
