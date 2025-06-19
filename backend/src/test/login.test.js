const request = require('supertest');
const app = require('../index.js'); 
const { sequelize } = require('../config/database');
const User = require('../models/user');

const bcrypt = require('bcrypt');

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const hashedPassword = await bcrypt.hash('password', 10);
  await User.create({
    name: 'user',
    password: hashedPassword,
    fullName: 'User',
    age: 22
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/users/login', () => {
  test('Erabiltzailea existitzen da eta pasahitza zuzena da', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'user', password: 'password' });

    expect(res.body.success).toBe(true);
    expect(res.body.userId).toBeDefined();
  });

  test('Erabiltzailea ez da existitzen', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'nouser', password: 'password' });

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('The user does not exist');
  });

  test('Erabiltzailea existitzen da baina pasahitza ez da zuzena', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'user', password: 'nopassword' });

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('The password is incorrect');
  });
});
