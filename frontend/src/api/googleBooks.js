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
      title: book.title || "Unknown",
      authors: book.authors?.join(", ") || "Unknown",
      publishedDate: book.publishedDate || "Unknown",
      description: book.description || "Unknown",
      categories: book.categories?.join(", ") || "Unknown",
      image: book.imageLinks?.thumbnail || null,
      id:item.id,
    };
  } catch (err) {
    console.error("Error searching for book:", err.message);
    return null;
  }
};
