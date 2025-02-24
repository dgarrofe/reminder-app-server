const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const { processVoiceToTask, autoCategorize } = require('../controllers/ai.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/voice-to-task', processVoiceToTask);
router.post('/auto-categorize', autoCategorize);

module.exports = router; 