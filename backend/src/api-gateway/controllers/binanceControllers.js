import axios from 'axios';
import { WebSocket } from 'ws';
import express from 'express';

const app = express();

export async function getBTCUSDTPrice(req, res) {
  try {
    const r = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    res.json({ price: r.data.price, time: Date.now() });
  } catch (error) {
    console.error('Error fetching Binance price:', error);
    res.status(500).json({ error: 'Could not fetch Binance price.' });
  }
}
export function streamBTCUSDTPrice(req, res) {
  try {
    const wss = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth');
    console.log('Connected to Binance order book feed');

    const timeout = setTimeout(() => {
      console.log('Closing WebSocket after 10 seconds');
      wss.close();
    }, 10000); // 10000ms = 10 seconds

    wss.on('open', () => {
        console.log('Connected to WebSocket server');
    });

    wss.on('message', (event) => {
        console.log('Message from server:', event.toString());
        res.write(`data: ${event}\n\n`);
    });

    wss.on('close', (event) => {
        console.log('Disconnected from WebSocket server');
        clearTimeout(timeout);
        res.end();
    });

    wss.on('error', (event) => {
        console.error('WebSocket error:', event);
    });

  } catch (err) {
    res.status(500).json({ error: 'Error connecting to Binance WebSocket.' });
    console.error('Error connecting to Binance WebSocket:', err);
  }
}
