const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

app.use(express.json());

// enable cors

app.use(cors());

app.use(cookieParser());
// Use fileUpload middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
);
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

app.use('/api', require('./routes/category.route'));
app.use('/api', require('./routes/upload.route'));

app.use('/api', require('./routes/product.route'));

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
