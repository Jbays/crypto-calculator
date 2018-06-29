const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();

app.get('/',(req,res)=>{
  res.status(200).send('you hit the root route');
})

module.exports = app;
