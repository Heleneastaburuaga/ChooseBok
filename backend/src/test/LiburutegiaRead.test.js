const request = require('supertest');
const app = require('../index');
const UserBook = require('../models/userbooks');
const Book = require('../models/book');
const User = require('../models/user'); // agrega esto
const { sequelize } = require('../config/database');

beforeAll(async () => {
  await sequelize.sync({ force: true });

  await User.create({
    id: 1,
    name: 'user1',
    password: 'password',
    fullName: 'User User',
    age: 30,
    favoriteGenres: 'fantasy'
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('GET /user-books/user/:userId/books/:status', () => {
  test('Liburuak ondo itzultzen du', async () => {
    await Book.bulkCreate([
        { id: '1', title: 'Book A', title_normalized: 'book a', author: 'Author A', image: 'imgA.jpg' },
        { id: '2', title: 'Book B', title_normalized: 'book b', author: 'Author B', image: 'imgB.jpg' },
    ]);

    await UserBook.bulkCreate([
      { userId: 1, bookId: '1', status: 'want_to_read' },  
      { userId: 1, bookId: '2', status: 'read_liked' },
    ]);

    const res = await request(app).get('/user-books/user/1/books/read_liked'); 

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.books).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '2', title: 'Book B' })
      ])
    );
    expect(res.body.books).toHaveLength(1);
  });

  test('Errore bat gerttatu da, adibidez datu basearekin', async () => {
    jest.spyOn(UserBook, 'findAll').mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app)
      .get('/user-books/user/1/books/read_liked');

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);

    UserBook.findAll.mockRestore();
  });
});
