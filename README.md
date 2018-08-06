# crypto-calculator
This backend application calculates profitability for all crypto assets.

## To Run db migrations:
`knex migrate:latest`

## To Run db seeds:
`knex seed:run`

Seed data includes both purchase and trade information.
1. All purchases --> usd to crypto.
2. All trades --> crypto1 to crypto2.

## Scripts
In the scripts directory are node files which perform specific operations related to calculating profitability.  The field I need to calculate for each cryptocurrency is `weighted_usd_per_unit`.

### Example 1. updatePrice.js
`node scripts/updatePrice.js`

To calculate profitability, I need the most current prices.

This script fetches the latest price information for 10 cryptocurrencies.

Prices are from [CoinMarketCap](https://coinmarketcap.com/)

Fetched data will update entries in the coins_index table.

### Example 2. updateBalancePurchases.js
`node scripts/updateBalancePurchases.js`

Because a single purchase contains less data, calculating `weighted_usd_per_unit` for purchases is much simpler.

For each **purchased** cryptocurrency, this script calculates:
1. the sum
2. the weighted_usd_per_unt

Then, the calculated objects are inserted into the balances table.

## Calculating Profitability
To calculate `weighted_cost_per_unit`, run this script:
`knex migrate:rollback && knex migrate:latest && knex seed:run && node scripts/updatePrice.js && node scripts/updateBalancePurchase.js && node scripts/weightedCost`

After these six commands, in the balances table is an updated entry for each cryptocurrency.

In the balances table.  Each unique cryptocurrency should show the sum of all `liquid units` (how much of this currency I have available) and the `weighted_usd_per_unit`.

if `coins_index.usd_per_unit` > `balances.weighted_usd_per_unit`, then that cryptocurrency is PROFITABLE!

### ERD:

![alt text][erd]

[erd]: https://github.com/Jbays/crypto-calculator/blob/18_updateErd/assets/crypto-calculator-erd.png
