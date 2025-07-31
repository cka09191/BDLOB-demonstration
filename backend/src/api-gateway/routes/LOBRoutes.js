import express from 'express';
import { getLatestLOB, getAllTimestamp, createLOB} from '../controllers/LOBControllers.js';
import { 
    startLOBCollection, 
    stopLOBCollection, 
    getLOBCollectionStatus, 
    getCurrentLOBSnapshot 
} from '../controllers/LOBCollectionController.js';

const router = express.Router();

router.get('/latest', getLatestLOB);
router.get('/timestamps', getAllTimestamp);
router.post('/', createLOB);

// LOB Collection Service endpoints
router.post('/collection/start', startLOBCollection);
router.post('/collection/stop', stopLOBCollection);
router.get('/collection/status', getLOBCollectionStatus);
router.get('/collection/current', getCurrentLOBSnapshot);

export default router;