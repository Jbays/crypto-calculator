# crypto-calculator
Calculates profitability for crypto assets

## To Run tests
`npm run test`

## To Run Server
`nodemon index.js`

## To Run db migrations:
`knex migrate:latest`

Should create a proof of concept 'coinx_index_2' table.

### Up to date pricing
updatePrice.js requests the latest crypto prices for 10 different cryptocurrencies.

Prices are from [CoinMarketCap](https://coinmarketcap.com/)
