const express = require('express');
const router = express.Router();
const {signup,login,updateFavoriteGenres,getRecommendations,  } = require('../controllers/userController');


router.post('/signup', signup);

router.post('/login', login);

router.patch('/user/:username', updateFavoriteGenres);

router.post('/recommendations',getRecommendations);

module.exports = router;