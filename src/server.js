const dotenv = require('dotenv');
dotenv.config();

// Fix for mongoose 9+ - ignore deprecated options
const mongoose = require('mongoose');
const originalConnect = mongoose.connect.bind(mongoose);
mongoose.connect = (uri, options) => {
  const { useNewUrlParser, useUnifiedTopology, ...rest } = options || {};
  return originalConnect(uri, rest);
};

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});