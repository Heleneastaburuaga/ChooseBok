import React, { useEffect, useState, useRef , useCallback } from 'react';
import Menu from '../components/Menu';
import axios from 'axios';
import '../css/style.css';

const LiburutegiaRead = () => {
  const [books, setBooks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const containerRef = useRef(null);

  const fetchUserBooksByStatus = async (userId, status) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/user-books/user/${userId}/books/${status}`);
      if (res.data.success) {
        return res.data.books;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error al obtener libros del usuario:", error.message);
      return [];
    }
  };

const loadBooks = async () => {
  const userId = sessionStorage.getItem("userId");
  if (!userId) return;

  const books = await fetchUserBooksByStatus(userId, "read_liked");
  setBooks(books);
  setVisibleCount(10);
};



  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
      setVisibleCount(prev => Math.min(prev + 5, books.length));
    }
  }, [books]);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
      const container = containerRef.current;
      if (container) {
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
      }
    }, [handleScroll]);

    const displayedBooks = books.slice(0, visibleCount);
    while (displayedBooks.length < visibleCount) {
      displayedBooks.push(null);
    }


  return (
    <>
      <Menu />
      <div className="mainhome-container">
        <h1>Read and Like</h1>
           <div className="scroll-grid-container" ref={containerRef}>
              {displayedBooks.map((book, index) => (
                <div className="book-slot" key={index}>
                  {book ? (
                    <>
                      {book.image && <img src={book.image} alt={book.title} className="book-image" />}
                      <p className="book-title">{book.title}</p>
                    </>
                  ) : (
                    <div className="empty-slot">Empty</div>
                  )}
                </div>
              ))}
            </div>
      </div>
      <div><button onClick={() => {window.location.href = "/liburutegiaLike"; }} className="read-like-see-buttom" > Want to read </button></div>
    </>
  );
};

export default LiburutegiaRead;
