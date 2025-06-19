const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});


const connectDB = async () => {
    try {
        
        await sequelize.authenticate();
        console.log('Conectado a MySQL correctamente');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
};

module.exports = { sequelize, connectDB };