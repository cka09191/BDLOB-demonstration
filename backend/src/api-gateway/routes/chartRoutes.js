import express from 'express';
import { getAllChart, getChart, createChart, deleteChart} from '../controllers/chartControllers.js';

const router = express.Router();

router.get('/chart', getAllChart);
router.get('/chart/:_id', getChart);
router.post('/chart', createChart);
router.delete('/chart/:_id', deleteChart);

export default router;