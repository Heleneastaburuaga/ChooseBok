const express = require('express');
const router = express.Router();
const UserBook = require('../models/userbooks');
const { addUserBook, getUserBooksByStatus, removeUserBook , updateSwipeStats  } = require('../controllers/userBookController');
const User = require('../models/user'); 

router.post('/', addUserBook);

router.get('/user/:userId/books/:status', getUserBooksByStatus);

router.post('/remove', removeUserBook);

router.post('/swipe/:userId', updateSwipeStats);

module.exports = router;
