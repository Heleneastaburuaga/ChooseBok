const request = require('supertest');
const app = require('../index');
const { User } = require('../models/associations');
const { sequelize } = require('../config/database');

beforeAll(async () => {
  await sequelize.sync({ force: true });  
});

afterAll(async () => {
  await sequelize.close(); 
});

describe('PATCH /api/users/user/:username', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });


  test('SignUpTwo Ondo, generoak ondo gehitu', async () => {
    const mockUser = {
      favoriteGenres: [],
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);

    const res = await request(app)
      .patch('/api/users/user/testuser')
      .send({
        favoriteGenres: ['Fantasy', 'Romance'],
      });

    expect(User.findOne).toHaveBeenCalledWith({ where: { name: 'testuser' } });
    expect(mockUser.favoriteGenres).toEqual(['Fantasy', 'Romance']);
    expect(mockUser.save).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Erabiltzailea ez da bilatzen ', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/users/user/nonexistent')
      .send({
        favoriteGenres: ['History'],
      });

    expect(User.findOne).toHaveBeenCalledWith({ where: { name: 'nonexistent' } });
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/User not found/i);
  });

  test('Errore bat gertatu da', async () => {
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .patch('/api/users/user/testuser')
      .send({
        favoriteGenres: ['Sports'],
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Error updating favorite genres/i);
  });
});
