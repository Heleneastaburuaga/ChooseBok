const request = require('supertest');
const app = require('../index');
const User = require('../models/user');
const UserBook = require('../models/userbooks');
const Book = require('../models/book');
const { getInitialRecommendations, getPersonalizedRecommendations } = require('../config/groq');
const { sequelize } = require('../config/database');


jest.mock('../config/groq');

beforeAll(async () => {
  await sequelize.sync({ force: true });  
});

afterAll(async () => {
  await sequelize.close(); 
});

describe('POST /api/users/recommendations', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Recomendation baina historial gabe', async () => {
    const Erabiltzailea = {
      id: 1,
      favoriteGenres: JSON.stringify(['romance', 'fantasy']),
      age: 30,
    };

    jest.spyOn(User, 'findByPk').mockResolvedValue(Erabiltzailea);
    jest.spyOn(UserBook, 'findAll').mockResolvedValue([]); 
    getInitialRecommendations.mockResolvedValue(['Book1', 'Book2', 'Book3', 'Book4', 'Book5']);

    const res = await request(app)
      .post('/api/users/recommendations')
      .send({ userId: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.books).toEqual(expect.arrayContaining(['Book1', 'Book2']));
    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(getInitialRecommendations).toHaveBeenCalled();
  });
  

  test('Erabiltzailea ez da aurkitzen', async () => {
    jest.spyOn(User, 'findByPk').mockResolvedValue(null);

    const res = await request(app)
      .post('/api/users/recommendations')
      .send({ userId: 999 });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/user not found/i);
  });

  test('Errorea generoak JSON-ekin', async () => {
    const Erabiltzailea = {
      id: 1,
      favoriteGenres: "nojson",
      age: 30,
    };

    jest.spyOn(User, 'findByPk').mockResolvedValue(Erabiltzailea);

    const res = await request(app)
      .post('/api/users/recommendations')
      .send({ userId: 1 });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid genres format/i);
  });
});


describe('POST /user-books', () => {
  test('Liburua eta eralzioa gehitzen du, hurrengo liburura pasatzean', async () => {
    const bookData = {
      id: 'book',
      title: 'Book',
      author: 'Author',
      year: 2021,
      description: 'The book is ...',
      genre: ['fantasy'],
      image: 'http/www.example.cpm',
    };

    jest.spyOn(Book, 'findOrCreate').mockResolvedValue([{ id: 'book' }, false]);
    jest.spyOn(UserBook, 'upsert').mockResolvedValue();

    const res = await request(app)
      .post('/user-books')
      .send({ userId: 1, bookData, status: 'want_to_read' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/guardada/i);
  });

  test('Errorea itzuli id falta bada', async () => {
    const res = await request(app)
      .post('/user-books')
      .send({ userId: 1, bookData: {}, status: 'want_to_read' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});


describe('POST /user-books/swipe/:userId', () => {
  test('Swipak ongi update', async () => {
    const Erabiltzailea = { id: 1, totalSwipes: 0, likeSwipes: 0, save: jest.fn() };

    jest.spyOn(User, 'findByPk').mockResolvedValue(Erabiltzailea);

    const res = await request(app)
      .post('/user-books/swipe/1')
      .send({ isLike: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Erabiltzailea.totalSwipes).toBe(1);
    expect(Erabiltzailea.likeSwipes).toBe(1);
    expect(Erabiltzailea.save).toHaveBeenCalled();
  });

  test('Erabiltzailea ez du bilatzen ', async () => {
    jest.spyOn(User, 'findByPk').mockResolvedValue(null);

    const res = await request(app)
      .post('/user-books/swipe/2')
      .send({ isLike: true });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});