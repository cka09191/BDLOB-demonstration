import express from 'express';
import axios from 'axios';
import cors from 'cors';
const app = express();
app.use(cors());

app.get('/api/btc', async (req, res) => {
  try {
    const r = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    res.json({ price: r.data.price, time: Date.now() });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch Binance price.' });
  }
});

app.listen(5005, () => console.log('Backend on port 5005'));