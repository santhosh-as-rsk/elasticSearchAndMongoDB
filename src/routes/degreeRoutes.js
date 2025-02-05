import express from 'express';
import { createDegree, updateDegree, deleteDegree, searchDegrees } from '../controllers/degreeController.js';

const router = express.Router();

router.post('/degrees', createDegree);
router.put('/degrees/:id', updateDegree);
router.delete('/degrees/:id', deleteDegree);
router.get('/degrees/search', searchDegrees);

export default router;
