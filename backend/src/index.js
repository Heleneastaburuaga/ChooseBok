const express = require('express');
const dotenv = require('dotenv');
const { connectDB, sequelize } = require('./config/database');
const cors = require('cors');

require('./models/associations');
const userBookRoutes = require('./routes/userBookRoutes');
const bookRoutes = require('./config/books');
const statsRoutes = require('./routes/stats');
const userRoutes = require('./routes/userRouters.js'); 

dotenv.config();

if (process.env.NODE_ENV !== 'test') {
  connectDB();

  sequelize.sync()
    .then(() => console.log("Tablas sincronizadas"))
    .catch((err) => console.error("Error al sincronizar tablas:", err));
}

const app = express();

app.use(express.static('public'));

app.use(cors({
  origin: 'http://localhost:3000',  
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: 'Content-Type,Authorization'  
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/api/users', userRoutes);

app.use('/user-books', userBookRoutes);

app.use('/api/books', bookRoutes);

app.use('/api', statsRoutes);

module.exports = app;

if (require.main === module && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
}
