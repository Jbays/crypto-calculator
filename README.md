# crypto-calculator
Calculates profitability for crypto assets

## To Run tests
`npm run test`

## To Run Server
`nodemon index.js`

## To Run db migrations:
`knex migrate:latest`

Populates seed data for 10 cryptocurrencies.  From 30 June 2018.

### Up to date pricing
`node updatePrice.js`

Updates database with the latest prices for 10 different cryptocurrencies.

Prices are from [CoinMarketCap](https://coinmarketcap.com/)
