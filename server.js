const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.json('home route');
});

app.listen(PORT, () => {
  console.log('server is running');
});

//routes

app.use('/user', require('./routes/useRouter'));

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
