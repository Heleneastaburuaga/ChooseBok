const request = require('supertest');
const app = require('../index');
const UserBook = require('../models/userbooks');
const Book = require('../models/book');
const User = require('../models/user');
const { sequelize } = require('../config/database');

beforeAll(async () => {
  await sequelize.sync({ force: true });

  await User.create({
    id: 1,
    name: 'testuser',
    password: 'password',
    fullName: 'Test User',
    age: 25,
    favoriteGenres: 'fiction'
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('GET /user-books/user/:userId/book/:bookId', () => {
  test('Erabiltzaileak liburua lista batean du', async () => {
    await Book.create({
    id: 'Book',
    title: 'Test Book',
    title_normalized: 'test book',
    author: 'Author',
    image: 'img.jpg'
  });
    await UserBook.create({ userId: 1, bookId: 'Book', status: 'read_liked' });

    const res = await request(app)
      .get('/user-books/user/1/book/Book');

    expect(res.statusCode).toBe(200);
    expect(res.body.exists).toBe(true);
    expect(res.body.status).toBe('read_liked');
  });

  test('Eabiltzaieak ez du librua listetan', async () => {
    const res = await request(app)
      .get('/user-books/user/1/book/besteBook');

    expect(res.statusCode).toBe(200);
    expect(res.body.exists).toBe(false);
  });
});

describe('POST /user-books', () => {
  beforeEach(async () => {
    await UserBook.destroy({ where: {} });
    await Book.destroy({ where: {} });
  });

  test('Gehitu liburu bat datu basera', async () => {
    const bookData = {
      id: 'book001',
      title: 'Book',
      author: 'Author',
      year: '2020',
      description: 'The book is a ...',
      genre: ['Fantasy'],
      image: 'https/www.example.com'
    };

    const res = await request(app)
      .post('/user-books')
      .send({
        userId: 1,
        bookData,
        status: 'want_to_read'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const userBook = await UserBook.findOne({ where: { userId: 1, bookId: 'book001' } });
    expect(userBook).not.toBeNull();
    expect(userBook.status).toBe('want_to_read');
  });

  test('Id-a falta da', async () => {
    const res = await request(app)
      .post('/user-books')
      .send({
        userId: 1,
        bookData: { title: 'Book' },
        status: 'read_liked'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Errore bat gertatu da', async () => {
    jest.spyOn(Book, 'findOrCreate').mockRejectedValueOnce(new Error('DB error'));

    const bookData = {
      id: 'book',
      title: 'Book',
      author: 'Author',
      year: '2024',
      description: '',
      genre: ['Fantasy'],
      image: ''
    };

    const res = await request(app)
      .post('/user-books')
      .send({
        userId: 1,
        bookData,
        status: 'read_disliked'
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);

    Book.findOrCreate.mockRestore();
  });
});
