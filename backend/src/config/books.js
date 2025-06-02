const express = require("express");
const axios = require("axios");
const router = express.Router();


router.get("/search", async (req, res) => {
  const { q } = req.query;

  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${q}&key=${process.env.GOOGLE_API_KEY}&maxResults=20`
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error buscando libros:", err.message);
    res.status(500).json({ error: "Error buscando libros" });
  }
});

module.exports = router;
