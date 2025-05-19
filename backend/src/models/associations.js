const User = require('./user');
const Book = require('./book');
const UserBook = require('./userbooks');

User.belongsToMany(Book, { through: UserBook, foreignKey: 'userId' });
Book.belongsToMany(User, { through: UserBook, foreignKey: 'bookId' });

UserBook.belongsTo(Book, { foreignKey: 'bookId' });
UserBook.belongsTo(User, { foreignKey: 'userId' });

module.exports = { User, Book, UserBook };
