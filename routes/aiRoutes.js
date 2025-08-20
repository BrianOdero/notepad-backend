const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.post('/generate', authMiddleware, aiController.generateNote);

module.exports = router;
