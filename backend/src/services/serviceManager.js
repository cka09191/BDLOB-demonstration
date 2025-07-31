import LOBCollectorService from './collectDataService/LOBCollectorService.js';

class ServiceManager {
    constructor() {
        this.services = {
            LOBCollector: LOBCollectorService
        };
    }

    async startAllServices() {
        console.log('Starting all background services...');
        
        try {
            // Start LOB collection service
            this.services.LOBCollector.start();
            console.log('✓ LOB Collector Service started');
        } catch (error) {
            console.error('✗ Failed to start LOB Collector Service:', error);
        }
    }

    async stopAllServices() {
        console.log('Stopping all background services...');
        
        try {
            this.services.LOBCollector.stop();
            console.log('✓ LOB Collector Service stopped');
        } catch (error) {
            console.error('✗ Failed to stop LOB Collector Service:', error);
        }
    }

    getServicesStatus() {
        return {
            LOBCollector: this.services.LOBCollector.getStatus()
        };
    }
}

// Create singleton instance
const serviceManager = new ServiceManager();

export default serviceManager;
