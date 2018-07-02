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
2. Calculates available crypto balances in purchases table.
3. Eventually, will also work for trades table.

Prices are from [CoinMarketCap](https://coinmarketcap.com/)
