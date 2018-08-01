const env = 'development';
const config = require('../knexfile')[env];
const knex = require('knex')(config);

//the promise-chain in plain language:
//1. fetch a list of all unique cryptocurrencies traded
//2. fetch trade information for all trades
//3. then calculate sums for each unique cryptocurrency
//4. then add sums from purchases table
//5. fetch entries in the balance table.  attach sums data.
//6. then prep entries for insertion into balance table
//7. first try updating the balance table
//8. then insert the rest of the data.

