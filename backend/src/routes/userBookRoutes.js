const express = require('express');
const router = express.Router();
const UserBook = require('../models/userbooks');
const { addUserBook } = require('../controllers/userBookController');

router.post('/', addUserBook);

module.exports = router;
