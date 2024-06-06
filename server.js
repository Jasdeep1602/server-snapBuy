const express = require('express');
const mongoose = require('mongoose');

const app = express();
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.json('home route');
});

app.listen(PORT, () => {
  console.log('server is running');
});

//routes

app.use('/user', require('./routes/user.route'));

//connect mongodb

const URI = process.env.MONGODB_URL;

mongoose
  .connect(URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.log(err);
  });
