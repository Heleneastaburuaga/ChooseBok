const express = require('express');
const router = express.Router();
const UserBook = require('../models/userbooks');
const Book = require('../models/book');
const User = require('../models/user'); 
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

router.get('/user-stats/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const totalRead = await UserBook.count({
      where: {
        userId,
        status: { [Op.in]: ['read_liked', 'read_disliked'] }
      }
    });

    const totalReadLiked = await UserBook.count({
      where: {
        userId,
        status: 'read_liked'
      }
    });

    const totalWantToRead = await UserBook.count({
      where: {
        userId,
        status: 'want_to_read'
      }
    });

    const readBooks = await UserBook.findAll({
      where: {
        userId,
        status: { [Op.in]: ['read_liked', 'read_disliked'] }
      },
      include: [{ model: Book }]
    });

    console.log("Libros leídos con info de libro:");
    readBooks.forEach(ub => {
  console.log({
    bookId: ub.bookId,
    title: ub.Book?.title,
    genre: ub.Book?.genre,  // Esto debería ser un array
  });
});

    const likedBooks = await UserBook.findAll({
      where: {
        userId,
        status: 'read_liked'
      },
      include: [{ model: Book }]
    });

    function mostFrequent(arr) {
      if (!arr.length) return null;
      const freqMap = arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});
      return Object.entries(freqMap).sort((a,b) => b[1] - a[1])[0][0];
    }

    let genresRead = [];
    readBooks.forEach(ub => {
      if (ub.Book && ub.Book.genre && ub.Book.genre.length) {
        genresRead.push(...ub.Book.genre);
      }
    });

    let genresLiked = [];
    likedBooks.forEach(ub => {
      if (ub.Book && ub.Book.genre && ub.Book.genre.length) {
        genresLiked.push(...ub.Book.genre);
      }
    });

    let authorsRead = [];
    readBooks.forEach(ub => {
      if (ub.Book && ub.Book.author) {
        authorsRead.push(ub.Book.author);
      }
    });

    let genreCountMap = {};

    readBooks.forEach(ub => {
      if (ub.Book && Array.isArray(ub.Book.genre)) {
        ub.Book.genre.forEach(g => {
          genreCountMap[g] = (genreCountMap[g] || 0) + 1;
        });
      }
    });
    const mostLikedGenre = mostFrequent(genresLiked);
    const mostReadAuthor = mostFrequent(authorsRead);

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const totalSwipes = user.totalSwipes;
    const likesCount = user.likeSwipes;
    const swipeSuccessRate = totalSwipes > 0 ? (likesCount / totalSwipes).toFixed(2) : null;
  
    res.json({
      totalRead,
      totalWantToRead,
      totalReadLiked,
      genresReadBreakdown: genreCountMap,
      mostLikedGenre,
      mostReadAuthor,
      totalSwipes,
      likesCount,
      swipeSuccessRate,
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
