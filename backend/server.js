import 'dotenv/config';
import http from 'http'
import app from './src/app.js';
import { connectMongoDB } from './src/config/mongodb.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  await connectMongoDB();

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
