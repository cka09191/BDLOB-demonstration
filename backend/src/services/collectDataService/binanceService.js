import axios from 'axios';
import { WebSocket } from 'ws';
import LOBCollectorService from './LOBCollectorService.js';

export async function getBTCUSDTPrice(req, res) {
  try {
    const r = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    res.json({ price: r.data.price, time: Date.now() });
  } catch (error) {
    console.error('Error fetching Binance price:', error);
    res.status(500).json({ error: 'Could not fetch Binance price.' });
  }
}

export async function getFullOrderBook(req, res) {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=1000');
    res.json({
      bids: response.data.bids.slice(0, 20).map(([price, quantity]) => [parseFloat(price), parseFloat(quantity)]),
      asks: response.data.asks.slice(0, 20).map(([price, quantity]) => [parseFloat(price), parseFloat(quantity)]),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching order book:', error);
    res.status(500).json({ error: 'Could not fetch order book.' });
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

// Get current LOB snapshot from the continuous collector
export function getCurrentLOBFromCollector(req, res) {
  try {
    if (!LOBCollectorService.getStatus().isRunning) {
      return res.status(503).json({ 
        error: 'LOB collector service is not running. Please start it first.' 
      });
    }

    const snapshot = LOBCollectorService.getCurrentSnapshot();
    res.json(snapshot);
  } catch (error) {
    console.error('Error getting LOB snapshot from collector:', error);
    res.status(500).json({ error: 'Could not get LOB snapshot from collector.' });
  }
}
