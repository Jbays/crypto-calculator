const express = require('express');
const app = express();

app.get('/',(req,res)=>{
  res.status(200).send('you hit the root route');
})

module.exports = app;
