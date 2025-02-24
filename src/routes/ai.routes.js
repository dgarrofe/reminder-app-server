const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const { processVoiceToTask } = require('../controllers/ai.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/voice-to-task', processVoiceToTask);

module.exports = router; 