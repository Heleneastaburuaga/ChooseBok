const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');


const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  favoriteGenres: {
    type: DataTypes.TEXT, 
    allowNull: true,
    get() {
      const raw = this.getDataValue('favoriteGenres');
      return raw ? JSON.parse(raw) : [];
    },
    set(val) {
      this.setDataValue('favoriteGenres', JSON.stringify(val));
    },
  },
    totalSwipes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  likeSwipes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }
}, {
  tableName: 'users',
  timestamps: false,
});

module.exports = User;