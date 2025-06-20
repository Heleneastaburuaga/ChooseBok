import React, { useEffect, useState } from 'react';
import Menu from '../components/Menu';
import axios from 'axios';
import '../css/style.css';
import { fetchBookDetails } from "../api/googleBooks";
import BookInfoModal from "../components/BookInfoModel";



const LiburutegiaLike = () => {
  const [books, setBooks] = useState([]);
  const [currentBookTitle, setCurrentBookTitle] = useState(''); 
  const [showReasonsFor, setShowReasonsFor] = useState(null); 
  const [showInfoLaukia, setShowInfoLaukia] = useState(false); 
  const [currentBookInfo, setCurrentBookInfo] = useState(null); 



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

    const books = await fetchUserBooksByStatus(userId, "want_to_read");
    setBooks(books.slice(0, 10));
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleRemoveBook = async (bookId, reason) => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return alert("No estás logueado");

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/user-books/remove`, {
        userId,
        bookId,
        reason,
      });

      if (res.data.success) {
        await loadBooks();
        setShowReasonsFor(null);
      } else {
        console.log('Liburua ezabatzean');
      }
    } catch (error) {
      console.error("Error eliminando libro del usuario:", error);
    }
  };

  const handleShowInfo = async (book) => {
    setCurrentBookTitle(book.title);
    const info = await fetchBookDetails(book.title);
    setCurrentBookInfo(info);
    setShowInfoLaukia(true);
  };

  const closeInfoModal = () => {
    setShowInfoLaukia(false);
    setCurrentBookInfo(null);
    setCurrentBookTitle('');
  };

  const filledSlots = [...books];
  while (filledSlots.length < 10) {
    filledSlots.push(null);
  }

  return (
    <>
      <Menu />
      <div className="mainhome-container">
        <h1>Want to read  </h1>
       
        <div className="grid-container">
          {filledSlots.map((book, index) => (
            <div className="book-slot" key={index}>
              {book ? (
                <>
                <span
                    className="see-more"
                    onClick={() => handleShowInfo(book)}
                  >
                    ➕
                </span>
                  
                  {book.image && <img src={book.image} alt={book.title} className="book-image" />}
                  <p className="book-title">{book.title}</p>
                  <span
                    className="remove-x"
                    onClick={() => setShowReasonsFor(index)}
                  >
                    ❌
                  </span>
                  {showReasonsFor === index && (
                    <div className="remove-reasons">
                      <p>Reason:</p>
                      <button onClick={() => handleRemoveBook(book.id, 'not_interested')}>I'm not interested anymore.</button>
                      <button onClick={() => handleRemoveBook(book.id, 'read_liked')}>I read it and I liked it.</button>
                      <button onClick={() => handleRemoveBook(book.id, 'read_disliked')}>I read it and I didn't like it.</button>
                      <button onClick={() => setShowReasonsFor(null)}>Leave</button>
                    </div>
                  )}
                 
                </>
              ) : (
                <div className="empty-slot">Empty</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div><button onClick={() => {window.location.href = "/liburutegiaRead"; }} className="read-like-see-buttom" > Read & Like </button></div>

       <BookInfoModal
        isOpen={showInfoLaukia}
        onClose={closeInfoModal}
        bookTitle={currentBookTitle}
        bookInfo={currentBookInfo}
      />
    </>
  );
};

export default LiburutegiaLike;
