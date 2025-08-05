import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BDLOBPredictionService {
    constructor() {
        this.isRunning = false;
        this.pythonProcess = null;
        this.modelPath = path.join(__dirname);
        this.pendingRequests = new Map(); // Track pending requests only
    }

    start() {
        if (this.isRunning) {
            console.log('BDLOB Prediction Service is already running');
            return;
        }

        console.log('Starting BDLOB Prediction Service...');
        this.isRunning = true;
        this.initializePythonProcess();
    }

    stop() {
        console.log('Stopping BDLOB Prediction Service...');
        this.isRunning = false;
        
        if (this.pythonProcess) {
            this.pythonProcess.kill();
            this.pythonProcess = null;
        }
    }

    initializePythonProcess() {
        const pythonScript = path.join(this.modelPath, 'prediction_server.py');
        
        this.pythonProcess = spawn('python', [pythonScript], {
            cwd: this.modelPath,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        this.pythonProcess.stdout.on('data', (data) => {
            try {
                const result = JSON.parse(data.toString());
                this.handleResponse(result);
            } catch (error) {
                console.log('Python output:', data.toString());
            }
        });

        this.pythonProcess.stderr.on('data', (data) => {
            console.error('Python error:', data.toString());
        });

        this.pythonProcess.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
            if (this.isRunning) {
                // Restart if it was supposed to be running
                setTimeout(() => this.initializePythonProcess(), 5000);
            }
        });
    }

    async predict(lobData) {
        if (!this.pythonProcess || !this.isRunning) {
            throw new Error('Prediction service is not running');
        }

        return new Promise((resolve, reject) => {
            const requestId = Date.now().toString();
            const request = {
                id: requestId,
                action: 'predict',
                data: lobData
            };

            this.pendingRequests.set(requestId, { resolve, reject });

            this.pythonProcess.stdin.write(JSON.stringify(request) + '\n');

            // Timeout after 10 seconds
            setTimeout(() => {
                this.pendingRequests.delete(requestId);
                reject(new Error('Prediction timeout'));
            }, 10000);
        });
    }

    handleResponse(result) {
        // Check if this is a response to a pending request
        if (result.id && this.pendingRequests.has(result.id)) {
            const { resolve, reject } = this.pendingRequests.get(result.id);
            this.pendingRequests.delete(result.id);
            
            if (result.error) {
                reject(new Error(result.error));
            } else {
                // Just resolve with the prediction, don't store it
                resolve(result.prediction);
            }
        } else {
            // This might be an automatic/unsolicited prediction
            console.log('Received unsolicited prediction:', result);
            // Don't store it here since it's stored in database elsewhere
        }
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            processRunning: this.pythonProcess !== null,
            pendingRequests: this.pendingRequests.size
        };
    }
}

// Create singleton instance
const bdlobPredictionService = new BDLOBPredictionService();

export default bdlobPredictionService;