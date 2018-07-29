# crypto-calculator
Calculates profitability for crypto assets

## To Run tests
`npm run test`

## To Run Server
`nodemon index.js`

## To Run db migrations:
`knex migrate:latest`

Migrations include data for:
1. All purchases --> usd to crypto.
2. All trades --> crypto1 to crypto2.

## Features:
Scripts Populate: 
1. seed data for 10 cryptocurrencies (dated 30 June 2018).
2. all cryptocurrency balances resulting from both purchases and trades (28 July 2018)
3. trades_conversions table with historical crypto prices from cryptocurrencychart.com
4. profitability && profit margin for each cryptocurrency.

### 1. Up to date pricing
`node updatePrice.js`

1. Updates database with the latest prices for 10 different cryptocurrencies.

Prices are from [CoinMarketCap](https://coinmarketcap.com/)

### 2. Updates balances table
`node updateBalancePurchase.js && updateBalanceTrades.js`

#### 2a. Purchases Balance
For each cryptocurrency in __purchase__ table:
1. Calculates all units available cash (liquid).
2. Calculates the weighted cost per unit acquisition
3. Inserts these entries into the balance table.

#### 2b. Trades Balance
For each cryptocurrency in __trades__ table:
1. Calculates all units available cash (liquid).
2. Calculates the weighted cost per unit acquisition.
3. Inserts these entries into the balance table.

### 3. Fetch n' Populate table with historical crypto prices
`node findTradeConversions.js`

#### BNB/USD necessary for profitability calculation
To calculate true profitability, I need BNB prices for most trades.  

Reason: Binance reduces transaction fees if you pay fees in BNB.

### 4. Calculate profitability
To be continued.  28 July 2018.

### ERD:

![alt text][erd]

[erd]: https://github.com/Jbays/crypto-calculator/blob/18_updateErd/assets/crypto-calculator-erd.png
