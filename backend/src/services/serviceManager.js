import LOBCollectorService from './collectDataService/LOBCollectorService.js';
import BDLOBPredictionService from './predictService/BDLOBPredictionService.js';

class ServiceManager {
    constructor() {
        this.services = {
            LOBCollector: LOBCollectorService,
            BDLOBPrediction: BDLOBPredictionService
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
        } catch (error) {
            console.error('✗ Failed to stop services:', error);
        }
    }

    getServicesStatus() {
        return {
            LOBCollector: this.services.LOBCollector.getStatus(),
            BDLOBPrediction: this.services.BDLOBPrediction.getStatus()
        };
    }
}

// Create singleton instance
const serviceManager = new ServiceManager();

export default serviceManager;
