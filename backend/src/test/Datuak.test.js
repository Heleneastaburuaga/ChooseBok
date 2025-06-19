const request = require('supertest');
const app = require('../index');
const User = require('../models/user');
const Book = require('../models/book');
const UserBook = require('../models/userbooks');
const { sequelize } = require('../config/database');

beforeAll(async () => {
  await sequelize.sync({ force: true });

  await User.create({
    id: 1,
    name: 'user',
    password: 'password',
    fullName: 'User User',
    age: 25,
    favoriteGenres: 'fantasy',
    totalSwipes: 10,
    likeSwipes: 4
  });

  // Crea libros
  await Book.bulkCreate([
    {
      id: 'book1',
      title: 'Book One',
      title_normalized: 'book one',
      author: 'Author A',
      genre: ['Fantasy', 'Adventure'],
      image: 'img1.jpg'
    },
    {
      id: 'book2',
      title: 'Book Two',
      title_normalized: 'book two',
      author: 'Author B',
      genre: ['Romance'],
      image: 'img2.jpg'
    },
    {
      id: 'book3',
      title: 'Book Three',
      title_normalized: 'book three',
      author: 'Author A',
      genre: ['Fantasy'],
      image: 'img3.jpg'
    }
  ]);

  await UserBook.bulkCreate([
    { userId: 1, bookId: 'book1', status: 'read_liked' },
    { userId: 1, bookId: 'book2', status: 'read_disliked' },
    { userId: 1, bookId: 'book3', status: 'want_to_read' }
  ]);
});

afterAll(async () => {
  await sequelize.close();
});

describe('GET /api/user-stats/:userId', () => {
  test('Estadistikak ondo hartu', async () => {
    const res = await request(app).get('/api/user-stats/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.totalRead).toBe(2);
    expect(res.body.totalReadLiked).toBe(1);
    expect(res.body.totalWantToRead).toBe(1);
    expect(res.body.genresReadBreakdown).toEqual(expect.objectContaining({
      Fantasy: 1,
      Adventure: 1,
      'Romance': 1
    }));
    expect(res.body.mostLikedGenre).toBe('Fantasy');
    expect(res.body.mostReadAuthor).toBe('Author A');
    expect(res.body.totalSwipes).toBe(10);
    expect(res.body.likesCount).toBe(4);
    expect(res.body.swipeSuccessRate).toBe("0.40");
  });

  test('Errore bat gertatu da', async () => {
    const res = await request(app).get('/api/user-stats/999');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Usuario no encontrado' });
  });
});
