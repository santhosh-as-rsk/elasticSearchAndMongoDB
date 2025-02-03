const express = require('express');
const router = express.Router();
const { createDegree, updateDegree, deleteDegree, searchDegrees } = require('../controllers/degreeController');

router.post('/degrees', createDegree);
router.put('/degrees/:id', updateDegree);
router.delete('/degrees/:id', deleteDegree);
router.get('/degrees/search', searchDegrees);

module.exports = router;
