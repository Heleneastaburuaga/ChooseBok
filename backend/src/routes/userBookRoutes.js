const express = require('express');
const router = express.Router();
const UserBook = require('../models/userbooks');
const { addUserBook, getUserBooksByStatus, removeUserBook } = require('../controllers/userBookController');

router.post('/', addUserBook);

router.get('/user/:userId/books/:status', getUserBooksByStatus);

router.post('/remove', removeUserBook);


module.exports = router;
