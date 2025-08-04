import express from 'express';
import { getLatestLOB, getAllTimestamp, createLOB, getLatest4500} from '../controllers/LOBControllers.js';
import { 
    startLOBCollection, 
    stopLOBCollection, 
    getLOBCollectionStatus, 
    getCurrentLOBSnapshot,
} from '../controllers/LOBCollectionController.js';

const router = express.Router();

router.get('/latest', getLatestLOB);
router.get('/timestamps', getAllTimestamp);
router.get('/latest4500', getLatest4500);
router.post('/', createLOB);

// LOB Collection Service endpoints
router.post('/collection/start', startLOBCollection);
router.post('/collection/stop', stopLOBCollection);
router.get('/collection/status', getLOBCollectionStatus);
router.get('/collection/current', getCurrentLOBSnapshot);


export default router;