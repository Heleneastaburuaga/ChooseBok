import axios from 'axios';

export const fetchBookDetails = async (title) => {
  try {
    const res = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}`
    );
    const item = res.data.items?.[0];
    const book = item?.volumeInfo;

    if (!book) return null;

    return {
      title: book.title || "Ezezaguna",
      authors: book.authors?.join(", ") || "Ezezaguna",
      publishedDate: book.publishedDate || "Ezezaguna",
      description: book.description || "Ezezaguna",
      categories: book.categories?.join(", ") || "Ezezaguna",
      image: book.imageLinks?.thumbnail || null,
      id:item.id,
    };
  } catch (err) {
    console.error("Error al buscar libro:", err.message);
    return null;
  }
};
