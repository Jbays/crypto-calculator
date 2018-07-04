# crypto-calculator
Calculates profitability for crypto assets

## To Run tests
`npm run test`

## To Run Server
`nodemon index.js`

## To Run db migrations:
`knex migrate:latest`

Populates 1. seed data for 10 cryptocurrencies (dated 30 June 2018).
          2. all purchases made on coinbase.
          3. all trades made on binance.  (up to 2 July 2018)

### Up to date pricing
`node updatePrice.js`

1. Updates database with the latest prices for 10 different cryptocurrencies.

Prices are from [CoinMarketCap](https://coinmarketcap.com/)

### Updates balances table
`node updateBalance.js`

#### Purchases Balance
For each cryptocurrency in __purchase__ table:
1. Calculates all units available cash (liquid).
2. Calculates the weighted cost per unit acquisition
3. Inserts these entries into the balance table.

#### Trades Balance
For each cryptocurrency in __trades__ table:
1. Calculates all units available cash (liquid).
2. Calculates the weighted cost per unit acquisition.
3. Inserts these entries into the balance table.

All information required to understand trade:
`select date_trade,trade_buy,amount-fee as liquid_units,trade_sell,total as costs from trades
where type = 'BUY';`

Total estimated investment:
`select symbol, liquid_units*weighted_usd_per_unit as total_investment from balances;`

### ERD:
[a link](assets/crypto-calculator-erd.png)
