import express from 'express';
import cors from 'cors';
import binanceRoutes from './routes/binanceRoutes.js';
import chartRoutes from './routes/chartRoutes.js';
import LOBRoutes from './routes/LOBRoutes.js';
import { connectDB } from './config/db.js';

const app = express();
app.use(cors());

connectDB();

app.use(express.json());

app.use('/api/binance', binanceRoutes);
app.use('/charts', chartRoutes)
app.use('/lob', LOBRoutes);

app.listen(process.env.PORT_BACKEND, () => console.log(`Backend on port ${process.env.PORT_BACKEND}`));