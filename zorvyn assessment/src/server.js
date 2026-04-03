import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

//Connect to Database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error(`Failed to connect to database: ${error.message}`);
  process.exit(1);
});

//Handle Rejection
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down the server because of Unhandled Promise Rejection');
  process.exit(1);
});
