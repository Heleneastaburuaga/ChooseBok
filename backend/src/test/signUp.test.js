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

describe('POST /api/users/signup', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

  test('Signup zuzena', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'create').mockImplementation(async (user) => ({ id: 1, ...user }));

    const res = await request(app)
      .post('/api/users/signup')
      .send({
        username: 'user',
        password: '12345',
        passwordtwo: '12345',
        fullName: 'User User',
        age: 22
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.userId).toBeDefined();
    expect(User.findOne).toHaveBeenCalledWith({ where: { name: 'user' } });
    expect(User.create).toHaveBeenCalled();
  });


  test('Pasahitak ez dira berdinak', async () => {
    const res = await request(app)
      .post('/api/users/signup')  
      .send({
        username: 'user2',
        password: '12345',
        passwordtwo: '1234',
        fullName: 'User User',
        age: 25
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/different passwords/i);
  });

  test('Username existizten da', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue({ id: 1, name: 'existinguser' });

    const res = await request(app)
      .post('/api/users/signup')  
      .send({
        username: 'existinguser',
        password: '12345',
        passwordtwo: '12345',
        fullName: 'User User',
        age: 22
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already registered/i);
    expect(User.findOne).toHaveBeenCalledWith({ where: { name: 'existinguser' } });
  });

  test('Errore bat gertatu da', async () => {
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('DB failure'));

    const res = await request(app)
      .post('/api/users/signup') 
      .send({
        username: 'user',
        password: '12345',
        passwordtwo: '12345',
        fullName: 'User User',
        age: 22
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/error has occurred/i);
  });
});
