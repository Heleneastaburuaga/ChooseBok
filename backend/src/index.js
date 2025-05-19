const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { connectDB, sequelize } = require('./config/database');
const User = require('./models/user');
const cors = require('cors');
const { getInitialRecommendations, getPersonalizedRecommendations } = require('./config/groq');
const UserBook = require('./models/userbooks');
const Book = require('./models/book');

require('./models/associations');
const userBookRoutes = require('./routes/userBookRoutes');


dotenv.config();
connectDB();

sequelize.sync() 
  .then(() => console.log("Tablas sincronizadas"))
  .catch((err) => console.error("Error al sincronizar tablas:", err));

const app = express();

app.use(express.static('public'));

app.use(cors({
  origin: 'http://localhost:3000',  
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: 'Content-Type,Authorization'  
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.post("/signup", async (req, res) => {
  const { username, password, passwordtwo, fullName, age } = req.body;

  console.log("Datos recibidos:", { username, password, passwordtwo, fullName, age });

  if (password !== passwordtwo) {
    return res.json({ success: false, message: "Pasahitzak ez dira berdinak" });
  }

  try {
    const existingUser = await User.findOne({ where: { name: username } });
    if (existingUser) {
      return res.json({ success: false, message: "Izen hau erregistratuta dago" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: username,
      password: hashedPassword,
      fullName,  
      age
    });

    res.json({ success: true, userId: user.id });  
    } 
    catch (err) {
      console.error("Errorea signup:", err.message);
      res.json({ success: false, message: "Errore bat gertatu da." });
    }
});

app.patch("/users/:username", async (req, res) => {
  const { username } = req.params; 
  const { favoriteGenres } = req.body; 

  try {
    const user = await User.findOne({ where: { name: username } });

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    user.favoriteGenres = favoriteGenres;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar los géneros favoritos: ', err.message);
    res.status(500).json({ success: false, message: "Error al actualizar los géneros favoritos." });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { name: username } });
    if (!user) {
      return res.json({ success: false, message: "Erabiltzailea ez da existitzen" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (isPasswordCorrect) {
      res.json({ 
        success: true ,
        userId: user.id
      });
    } else {
      res.json({ success: false, message: "Pasahitza ez da zuzena" });
    }
  } catch (err) {
    console.error("Errorea login:", err.message);
    res.json({ success: false, message: "Errore bat gertatu da." });
  }
});

app.post('/recommendations', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let genres = user.favoriteGenres;
    if (typeof genres === 'string') {
      try {
        genres = JSON.parse(genres);
      } catch {
        return res.status(400).json({ success: false, message: "Invalid genres format" });
      }
    }

    const allUserBooks = await UserBook.findAll({
      where: { userId },
      include: [{
        model: Book,
        attributes: ['id', 'title']  
      }]
    });

    const likedBooks = allUserBooks
      .filter(ub => ub.status === 'read_liked')
      .map(ub => ub.Book?.title);

    const dislikedBooks = allUserBooks
      .filter(ub => ub.status === 'read_disliked')
      .map(ub => ub.Book?.title);

    const wantToRead = allUserBooks
      .filter(ub => ub.status === 'want_to_read')
      .map(ub => ub.Book?.title);

    const notInterested = allUserBooks
      .filter(ub => ub.status === 'not_interested')
      .map(ub => ub.Book?.title);

    const hasHistory = likedBooks.length || dislikedBooks.length || wantToRead.length || notInterested.length;

    const books = hasHistory
      ? await getPersonalizedRecommendations(user.age, genres, likedBooks, dislikedBooks, wantToRead, notInterested)
      : await getInitialRecommendations(user.age, genres);

    res.json({ success: true, books });
  } catch (err) {
    console.error("Error al recomendar libros:", err.message);
    res.status(500).json({ success: false, message: "Fallo al obtener recomendaciones." });
  }
});

app.use('/user-books', userBookRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

});


