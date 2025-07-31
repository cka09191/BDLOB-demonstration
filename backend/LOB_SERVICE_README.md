# LOB Data Collection Service

This service continuously collects Limit Order Book (LOB) data from Binance WebSocket API and stores it in MongoDB.

## Features

- **Automatic Reconnection**: Handles connection drops and automatically reconnects
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
