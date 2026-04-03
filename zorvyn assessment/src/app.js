import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import routes from './routes/index.routes.js';

const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static('public'));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

//welcome route for root URL
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Finance Data Processing and Access Control Backend API. Base endpoint is /api',
    status: 'Running'
  });
});

//routes
app.use('/api', routes);

//Error handling middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
