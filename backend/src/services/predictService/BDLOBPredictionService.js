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
        this.predictions = [];
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
                this.handlePrediction(result);
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

            // Set up one-time listener for this prediction
            const responseHandler = (data) => {
                try {
                    const response = JSON.parse(data.toString());
                    if (response.id === requestId) {
                        this.pythonProcess.stdout.removeListener('data', responseHandler);
                        if (response.error) {
                            reject(new Error(response.error));
                        } else {
                            resolve(response.prediction);
                        }
                    }
                } catch (error) {
                    // Ignore parsing errors for non-JSON output
                }
            };

            this.pythonProcess.stdout.on('data', responseHandler);
            this.pythonProcess.stdin.write(JSON.stringify(request) + '\n');

            // Timeout after 10 seconds
            setTimeout(() => {
                this.pythonProcess.stdout.removeListener('data', responseHandler);
                reject(new Error('Prediction timeout'));
            }, 10000);
        });
    }

    handlePrediction(result) {
        // Store prediction with timestamp
        const prediction = {
            timestamp: Date.now(),
            ...result
        };

        this.predictions.push(prediction);


        console.log('New prediction received:', prediction);
    }

    getRecentPredictions(limit = 100) {
        return this.predictions.slice(-limit);
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            processRunning: this.pythonProcess !== null,
            predictionsCount: this.predictions.length
        };
    }
}

// Create singleton instance
const bdlobPredictionService = new BDLOBPredictionService();

export default bdlobPredictionService;