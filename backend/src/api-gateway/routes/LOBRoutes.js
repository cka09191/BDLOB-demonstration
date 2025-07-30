import express from 'express';
import { getLatestLOB, getAllTimestamp, createLOB} from '../controllers/LOBControllers.js';

const router = express.Router();

router.get('/latest', getLatestLOB);
router.get('/timestamps', getAllTimestamp);
router.post('/', createLOB);

export default router;