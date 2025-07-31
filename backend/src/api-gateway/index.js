import express from 'express';
import cors from 'cors';
import binanceRoutes from './routes/binanceRoutes.js';
import chartRoutes from './routes/chartRoutes.js';
import LOBRoutes from './routes/LOBRoutes.js';
import { connectDB } from './config/db.js';
import serviceManager from '../services/serviceManager.js';

const app = express();
app.use(cors());

connectDB();

app.use(express.json());

app.use('/api/binance', binanceRoutes);
app.use('/charts', chartRoutes)
app.use('/lob', LOBRoutes);

const server = app.listen(process.env.PORT_BACKEND, () => {
    console.log(`Backend on port ${process.env.PORT_BACKEND}`);
    serviceManager.startAllServices();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    serviceManager.stopAllServices();
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    serviceManager.stopAllServices();
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});