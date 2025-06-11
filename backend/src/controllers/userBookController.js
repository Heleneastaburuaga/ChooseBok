const User = require('../models/user');
const Book = require('../models/book');
const UserBook = require('../models/userbooks');

const addUserBook = async (req, res) => {
  const { userId, bookData, status } = req.body;
  if (!bookData.id) {
    return res.status(400).json({ success: false, message: 'Falta el ID del libro (bookData.id)' });
  }
    const titleNorm = bookData.title
    ?.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .replace(/[“”"'`´]/g, "")                   
    .replace(/[^a-z0-9\s]/gi, "")        
    .replace(/\s+/g, " ")                            
    .trim();

  try {
    const [book] = await Book.findOrCreate({
      where: { id: bookData.id },
      defaults: {
        title: bookData.title,
        title_normalized: titleNorm,
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

const getUserBooksByStatus = async (req, res) => {
  const { userId, status } = req.params;

  try {
    const userBooks = await UserBook.findAll({
      where: {
        userId,
        status,
      },
      include: [
        {
          model: Book,
          attributes: ['id', 'title', 'author', 'year', 'description', 'genre', 'image'],
        },
      ],
    });

    const books = userBooks.map(ub => ub.Book);

    res.json({ success: true, books });
  } catch (error) {
    console.error('Error fetching user books:', error);
    res.status(500).json({ success: false, message: 'Error al obtener libros' });
  }
};

const removeUserBook = async (req, res) => {
  const { userId, bookId, reason } = req.body;
  
  if (!userId || !bookId || !reason) {
    return res.status(400).json({ success: false, message: 'Faltan datos para eliminar libro' });
  }

  try {
    await UserBook.update(
      { status: reason },  
      { where: { userId, bookId } }
    );


    res.json({ success: true, message: 'Libro eliminado o actualizado correctamente' });
  } catch (error) {
    console.error("Error al eliminar libro:", error.message);
    res.status(500).json({ success: false, message: 'Error al eliminar libro del usuario' });
  }
};

const updateSwipeStats = async (req, res) => {
  const { userId } = req.params;
  const { isLike } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.totalSwipes += 1;
    if (isLike) {
      user.likeSwipes += 1;
    }

    await user.save();

    res.json({ success: true, message: 'Swipe counters updated' });
  } catch (error) {
    console.error("Error updating swipe stats:", error.message);
    res.status(500).json({ success: false, message: 'Failed to update swipe stats' });
  }
};

const findRelation = async (req, res) => {
  const { userId, bookId } = req.params;
  const record = await UserBook.findOne({ where: { userId, bookId } });
  if (record) {
    res.json({ exists: true, status: record.status });
  } else {
    res.json({ exists: false });
  }
};

module.exports = {
  addUserBook,
  getUserBooksByStatus,
  removeUserBook,
  updateSwipeStats,
  findRelation,
};
