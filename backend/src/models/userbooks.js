const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');
const Book = require('./book');

const UserBook = sequelize.define('UserBook', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  bookId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM('want_to_read', 'not_interested', 'read_liked', 'read_disliked'),
    allowNull: false,
  },
}, {
  tableName: 'user_books',
  timestamps: false,
});

module.exports = UserBook;