const express = require('express');
const router = express.Router();

const { getUserStats } = require('../controllers/statsController');

router.get('/user-stats/:userId', getUserStats);

module.exports = router;