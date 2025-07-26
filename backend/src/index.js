import express from 'express';
import cors from 'cors';
import binanceRoutes from './routes/binanceRoutes.js';
const app = express();
app.use(cors());

app.use('/api/binance', binanceRoutes);

app.listen(5005, () => console.log('Backend on port 5005'));