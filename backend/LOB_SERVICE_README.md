# LOB Data Collection Service

This service continuously collects Limit Order Book (LOB) data from Binance WebSocket API and stores it in MongoDB.

## Features

- **Continuous Data Collection**: Automatically connects to Binance WebSocket and maintains real-time order book data
- **Automatic Reconnection**: Handles connection drops and automatically reconnects
- **Data Persistence**: Saves LOB snapshots to MongoDB every second
- **REST API Control**: Start, stop, and monitor the service via HTTP endpoints
- **Graceful Shutdown**: Properly closes connections when the server shuts down

## Architecture

### Files Structure
```
backend/src/
├── services/
│   ├── collectDataService/
│   │   ├── lobCollectorService.js      # Main collection service
│   │   └── binanceService.js           # Enhanced with LOB methods
│   └── serviceManager.js               # Manages all background services
├── api-gateway/
│   ├── controllers/
│   │   └── lobCollectionController.js  # REST API controllers
│   ├── routes/
│   │   ├── LOBRoutes.js               # LOB-related endpoints
│   │   └── binanceRoutes.js           # Binance API endpoints
│   └── models/
│       └── LOB.js                     # MongoDB schema
```

## API Endpoints

### LOB Collection Service Control
- `POST /lob/collection/start` - Start the LOB collection service
- `POST /lob/collection/stop` - Stop the LOB collection service
- `GET /lob/collection/status` - Get service status
- `GET /lob/collection/current` - Get current LOB snapshot without saving

### Binance Data
- `GET /api/binance/btc` - Get current BTC price
- `GET /api/binance/orderbook` - Get full order book snapshot
- `GET /api/binance/lob/current` - Get current LOB from collector service
- `GET /api/binance/btc/stream` - Stream LOB data (WebSocket)

### LOB Database Operations
- `GET /lob/latest` - Get latest saved LOB data
- `GET /lob/timestamps` - Get all timestamps
- `POST /lob/` - Create new LOB entry

## Usage

### 1. Automatic Start
The service starts automatically when the server boots up.

### 2. Manual Control
```bash
# Start collection
curl -X POST http://localhost:3001/lob/collection/start

# Check status
curl http://localhost:3001/lob/collection/status

# Stop collection
curl -X POST http://localhost:3001/lob/collection/stop
```

### 3. Get Current Data
```bash
# Get current LOB snapshot from collector
curl http://localhost:3001/lob/collection/current

# Get current LOB via Binance service
curl http://localhost:3001/api/binance/lob/current
```

## Data Format

The service collects and stores LOB data in the following format:
```javascript
{
    timestamp: 1700000000,
    book: [
        [100.0, 10, 101.0, 15],     // [bid_price, bid_volume, ask_price, ask_volume]
        [100.5, 20, 101.5, 25],
        // ... up to 20 levels
    ]
}
```

## Configuration

### Collection Settings
- **Save Interval**: 1000ms (1 second) - How often to save snapshots to DB
- **Reconnect Interval**: 5000ms (5 seconds) - How long to wait before reconnecting
- **Max Reconnect Attempts**: 10 - Maximum number of reconnection attempts
- **Order Book Depth**: 20 levels for both bids and asks

### WebSocket Connection
- **Endpoint**: `wss://stream.binance.com:9443/ws/btcusdt@depth@100ms`
- **Symbol**: BTCUSDT
- **Update Speed**: 100ms
