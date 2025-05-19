const User = require('../models/user');
const Book = require('../models/book');
const UserBook = require('../models/userbooks');

const addUserBook = async (req, res) => {
  const { userId, bookData, status } = req.body;
  if (!bookData.id) {
    return res.status(400).json({ success: false, message: 'Falta el ID del libro (bookData.id)' });
  }

  try {
    const [book] = await Book.findOrCreate({
      where: { id: bookData.id },
      defaults: {
        title: bookData.title,
        author: bookData.author,
        year: bookData.year,
        description: bookData.description || '',
        genre: Array.isArray(bookData.genre) ? bookData.genre : [bookData.genre],
        image: bookData.image || '',
      },
    });

    await UserBook.upsert({
      userId,
      bookId: book.id, 
      status,
    });

    res.json({ success: true, message: 'Relación guardada' });
  } catch (error) {
    console.error("Error al guardar UserBook:", error.message);
    res.status(500).json({ success: false, message: 'Fallo al guardar el libro del usuario' });
  }
};

module.exports = {
  addUserBook,
};
