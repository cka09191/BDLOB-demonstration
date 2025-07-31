import LOBCollectorService from '../../services/collectDataService/LOBCollectorService.js';

export const startLOBCollection = (req, res) => {
    try {
        LOBCollectorService.start();
        res.json({ 
            message: 'LOB collection service started successfully',
            status: LOBCollectorService.getStatus()
        });
    } catch (error) {
        console.error('Error starting LOB collection:', error);
        res.status(500).json({ error: 'Failed to start LOB collection service' });
    }
};

export const stopLOBCollection = (req, res) => {
    try {
        LOBCollectorService.stop();
        res.json({ 
            message: 'LOB collection service stopped successfully',
            status: LOBCollectorService.getStatus()
        });
    } catch (error) {
        console.error('Error stopping LOB collection:', error);
        res.status(500).json({ error: 'Failed to stop LOB collection service' });
    }
};

export const getLOBCollectionStatus = (req, res) => {
    try {
        const status = LOBCollectorService.getStatus();
        res.json(status);
    } catch (error) {
        console.error('Error getting LOB collection status:', error);
        res.status(500).json({ error: 'Failed to get LOB collection status' });
    }
};

export const getCurrentLOBSnapshot = (req, res) => {
    try {
        const snapshot = LOBCollectorService.getCurrentSnapshot();
        res.json(snapshot);
    } catch (error) {
        console.error('Error getting current LOB snapshot:', error);
        res.status(500).json({ error: 'Failed to get current LOB snapshot' });
    }
};
