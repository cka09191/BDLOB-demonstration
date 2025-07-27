import express from 'express';
import cors from 'cors';
import binanceRoutes from './routes/binanceRoutes.js';
import { connectDB } from './config/db.js';

const app = express();
app.use(cors());

app.use('/api/binance', binanceRoutes);

connectDB();
app.listen(process.env.PORT_BACKEND, () => console.log(`Backend on port ${process.env.PORT_BACKEND}`));