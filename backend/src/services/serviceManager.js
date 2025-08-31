import LOBCollectorService from './collectDataService/LOBCollectorService.js';
import BDLOBPredictionService from './predictService/BDLOBPredictionService.js';
import PredictionCollectorService from './collectDataService/predictionCollectorService.js';
import EvaluationCollectorService from './collectDataService/evaluationCollectorService.js';

class ServiceManager {
    constructor() {
        this.services = {
            LOBCollector: LOBCollectorService,
            BDLOBPrediction: BDLOBPredictionService,
            predictionCollector: PredictionCollectorService,
            evaluationCollector: EvaluationCollectorService
        };
    }

    async startAllServices() {
        console.log('Starting all background services...');
        
        try {
            // Start LOB collection service
            this.services.LOBCollector.start();
            console.log('✓ LOB Collector Service started');

            // Start BDLOB prediction service
            this.services.BDLOBPrediction.start();
            console.log('✓ BDLOB Prediction Service started');

            // Start prediction collector service
            this.services.predictionCollector.start();
            console.log('✓ Prediction Collector Service started');

            // Start evaluation collector service
            this.services.evaluationCollector.start();
            console.log('✓ Evaluation Collector Service started');
        } catch (error) {
            console.error('✗ Failed to start services:', error);
        }
    }

    async stopAllServices() {
        console.log('Stopping all background services...');
        
        try {
            this.services.LOBCollector.stop();
            console.log('✓ LOB Collector Service stopped');

            this.services.BDLOBPrediction.stop();
            console.log('✓ BDLOB Prediction Service stopped');

            this.services.predictionCollector.stop();
            console.log('✓ Prediction Collector Service stopped');

            this.services.evaluationCollector.stop();
            console.log('✓ Evaluation Collector Service stopped');
        } catch (error) {
            console.error('✗ Failed to stop services:', error);
        }
    }

    getServicesStatus() {
        return {
            LOBCollector: this.services.LOBCollector.getStatus(),
            BDLOBPrediction: this.services.BDLOBPrediction.getStatus(),
            predictionCollector: this.services.predictionCollector.getStatus(),
            evaluationCollector: this.services.evaluationCollector.getStatus()
        };
    }
}

// Create singleton instance
const serviceManager = new ServiceManager();

export default serviceManager;
