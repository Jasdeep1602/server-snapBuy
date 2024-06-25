const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const { urlencoded } = require('express');

const app = express();
app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// Use fileUpload middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
);

// enable cors

const corsOptions = {
  origin: 'https://snapbuy-omega.vercel.app/',
  credentials: true,
};

app.use(cors(corsOptions));

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
