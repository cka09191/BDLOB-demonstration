import { WebSocket } from 'ws';
import LOB from '../../api-gateway/models/LOB.js';

class LOBCollectorService {
    constructor() {
        this.ws = null;
        this.isRunning = false;
        this.reconnectInterval = 5000; // 5 seconds
        this.maxReconnectAttempts = 10;
        this.reconnectAttempts = 0;
        this.count_repetitions = 0;
        this.orderBook = {
            bids: new Map(),
            asks: new Map()
        };
    }

    start() {
        if (this.isRunning) {
            console.log('LOB Collector Service is already running');
            return;
        }

        console.log('Starting LOB Collector Service...');
        this.isRunning = true;
        this.connect();
    }

    stop() {
        console.log('Stopping LOB Collector Service...');
        this.isRunning = false;
        
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
    }

    connect() {
        if (!this.isRunning) return;

        try {
            // Connect to Binance WebSocket for BTCUSDT depth stream
            this.ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth@100ms');
            
            this.ws.on('open', () => {
                console.log('Connected to Binance WebSocket for LOB data');
                this.reconnectAttempts = 0;
            });

            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    if (this.processDepthUpdate(message)) {
                        this.saveLOBSnapshot();
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                }
            });

            this.ws.on('close', (code, reason) => {
                console.log(`WebSocket closed: ${code} - ${reason}`);
                this.ws = null;
                
                if (this.isRunning) {
                    this.scheduleReconnect();
                }
            });

            this.ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                if (this.ws) {
                    this.ws.close();
                }
            });

        } catch (error) {
            console.error('Error connecting to Binance WebSocket:', error);
            this.scheduleReconnect();
        }
    }

    scheduleReconnect() {
        if (!this.isRunning || this.reconnectAttempts >= this.maxReconnectAttempts) {
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached. Stopping service.');
                this.stop();
            }
            return;
        }

        this.reconnectAttempts++;
        console.log(`Attempting to reconnect in ${this.reconnectInterval}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            if (this.isRunning) {
                this.connect();
            }
        }, this.reconnectInterval);
    }

    processDepthUpdate(data) {
        if (!data.b || !data.a) return false;

        // Update bids
        data.b.forEach(([price, quantity]) => {
            const priceNum = parseFloat(price);
            const quantityNum = parseFloat(quantity);
            
            if (quantityNum === 0) {
                this.orderBook.bids.delete(priceNum);
            } else {
                this.orderBook.bids.set(priceNum, quantityNum);
            }
        });

        // Update asks
        data.a.forEach(([price, quantity]) => {
            const priceNum = parseFloat(price);
            const quantityNum = parseFloat(quantity);
            
            if (quantityNum === 0) {
                this.orderBook.asks.delete(priceNum);
            } else {
                this.orderBook.asks.set(priceNum, quantityNum);
            }
        });
        return true;
        
    }

    generateLOBSnapshot() {
        // Sort bids (highest to lowest) and asks (lowest to highest)
        const sortedBids = Array.from(this.orderBook.bids.entries())
            .sort(([a], [b]) => b - a)
            .slice(0, 20);

        const sortedAsks = Array.from(this.orderBook.asks.entries())
            .sort(([a], [b]) => a - b)
            .slice(0, 20);

        // Create the book array in the format expected by your model
        const book = [];
        const maxLength = Math.max(sortedBids.length, sortedAsks.length);

        for (let i = 0; i < 20; i++) {
            const bid = sortedBids[i] || [0, 0];
            const ask = sortedAsks[i] || [0, 0];
            
            book.push([
                bid[0],    // bid price
                bid[1],    // bid volume
                ask[0],    // ask price
                ask[1]     // ask volume
            ]);
        }

        return {
            timestamp: Date.now(),
            book: book
        };
    }

    async saveLOBSnapshot() {
        if (this.orderBook.bids.size === 0 || this.orderBook.asks.size === 0) {
            return; // Don't save empty order book
        }

        try {
            const snapshot = this.generateLOBSnapshot();
            const lobDoc = new LOB(snapshot);
            await lobDoc.save();
            this.count_repetitions++;
            if (this.count_repetitions >= 100) {
                console.log(`Saving LOB snapshot... at ${new Date(snapshot.timestamp).toISOString()}`);
                this.count_repetitions = 0; // Reset counter after saving
            }
        } catch (error) {
            console.error('Error saving LOB snapshot:', error);
        }
    }


    // Method to get current order book status
    getStatus() {
        return {
            isRunning: this.isRunning,
            connected: this.ws && this.ws.readyState === WebSocket.OPEN,
            bidsCount: this.orderBook.bids.size,
            asksCount: this.orderBook.asks.size,
            reconnectAttempts: this.reconnectAttempts
        };
    }

    // Method to get current order book snapshot without saving
    getCurrentSnapshot() {
        return this.generateLOBSnapshot();
    }
}

// Create singleton instance
const lobCollectorService = new LOBCollectorService();

export default lobCollectorService;
