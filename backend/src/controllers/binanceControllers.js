import axios from 'axios';

export async function getBTCUSDTPrice(req, res) {
  try {
    const r = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    res.json({ price: r.data.price, time: Date.now()});
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch Binance price.' });
  }
}