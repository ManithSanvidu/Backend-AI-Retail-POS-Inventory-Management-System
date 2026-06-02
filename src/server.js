const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the old server or change PORT in .env.`);
    process.exit(1);
  }

  console.error(`Server error: ${error.message}`);
  process.exit(1);
});

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
    setTimeout(connectDB, 0);
  });
};

startServer();
