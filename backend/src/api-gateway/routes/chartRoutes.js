import express from 'express';
import { getMemo, updateMemo } from '../controllers/chartControllers.js';

const router = express.Router();

router.get('/memo', getMemo);
router.post('/memo', updateMemo);

export default router;