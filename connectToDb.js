const env = 'development';
const config = require('./knexfile')[env];
const knex = require('knex')(config);

const sql = knex('coins_index').toString();

console.log("sql>>>>>",sql);
