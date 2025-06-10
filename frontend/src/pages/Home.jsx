import React, { useState, useEffect } from "react";
import axios from 'axios';
import '../css/style.css';
import { fetchBookDetails } from "../api/googleBooks";
import Menu from "../components/Menu";
import BookInfoModal from "../components/BookInfoModel";



const Home = () => {
  const [books, setBooks] = useState([]); 
  const [currentBookIndex, setCurrentBookIndex] = useState(0); 
  const [bookTitle, setBookTitle] = useState(''); 
  const [bookInfo, setBookInfo] = useState(null); 
  const [showInfoLaukia, setShowInfoLaukia] = useState(false);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      const userId = sessionStorage.getItem("userId");
      if (!userId) return;
      
      try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/recommendations`, {
          userId,
        });

        if (res.data.success) {
          setBooks(res.data.books); 
          const firstTitle = res.data.books[0];
          setBookTitle(firstTitle);
          fetchAndSetBookInfo(firstTitle);
        }
      } catch (err) {
        console.error("Error al obtener recomendaciones:", err.message);
      }
    };

    fetchRecommendations();
  }, []);

  const fetchAndSetBookInfo = async (title) => {
    const info = await fetchBookDetails(title);
    setBookInfo(info);
    console.log("Detalles del libro:", info);
  };

const nextBook = async () => {
  const nextIndex = currentBookIndex + 1;

  if (nextIndex < books.length) {
    const nextTitle = books[nextIndex];
    setCurrentBookIndex(nextIndex);
    setBookTitle(nextTitle);
    fetchAndSetBookInfo(nextTitle);
  } else {

    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/recommendations`, {
        userId,
      });
      console.log("Respuesta de recomendaciones:", res.data);

      if (res.data.success && res.data.books.length > 0) {
        setBooks(res.data.books);
        setCurrentBookIndex(0);
        const newTitle = res.data.books[0];
        setBookTitle(newTitle);
        fetchAndSetBookInfo(newTitle);
      } else {
        console.log("No se pudieron obtener más recomendaciones.");
        setBookTitle('');
        setBookInfo(null);
      }
    } catch (err) {
      console.error("Error al obtener nuevas recomendaciones:", err.message);
      //aqui poner algo cuando se pasa la ia
      setBookTitle('');
      setBookInfo(null);
    }
  }
};

const updateSwipeStats = async (isLike) => {
  const userId = sessionStorage.getItem("userId");
  if (!userId) return;

  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/user-books/swipe/${userId}`, {
      isLike, 
    });
  } catch (err) {
    console.error("Error actualizando swipe stats:", err.message);
  }
};

 const handleAddUserBook = async (status) => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return alert("No estás logueado");

    if (bookInfo!=null) {
      const book = {
        id: bookInfo.id || bookTitle,  
        title: bookTitle,
        author: bookInfo.authors || "Unknown",
        publishedDate: bookInfo.publishedDate,
        description: bookInfo.description,
        genre: bookInfo.categories || [],
        image: bookInfo.image,
      };

      const payload = {
        userId,
        bookData: book,
        status,
      };

      try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/user-books`, payload);
        if (res.data.success) {
          console.log('Libro guardado con éxito');
        } else {
          console.log('Error al guardar el libro');
        }
      } catch (error) {
        console.error("Error guardando libro del usuario:", error);
      }
    }
  };
 
  const handleAdd = () => {
    setShowInfoLaukia(true);
  };

  const handleLike = async () => {
    await handleAddUserBook('want_to_read');
    await updateSwipeStats(true);
    nextBook(); 
  };

 const handleDislike = async () => {
    await handleAddUserBook('not_interested');
    await updateSwipeStats(false);
    nextBook(); 
  };

   const handleReadLike =  async () => {
    await handleAddUserBook('read_liked');
    await updateSwipeStats(false);
    nextBook();
  };

  const handleReadNotLike = async () =>{
    await handleAddUserBook('read_disliked');
    await updateSwipeStats(false);
    nextBook(); 
  };

  const itxiLaukia = () => {
    setShowInfoLaukia(false);
  };

  return (
    <>
    <Menu />
    <div className="mainhome-container">
      <div className="book-title">
        <h2>{bookTitle}</h2>
        {bookInfo?.image && (
          <div className="image">
            <img src={bookInfo.image} alt="Portada del libro" className="book-img" />
          </div>
        )}
      </div>
      <div className="button-row">
        <button className="btn bottom-btn dislike" onClick={handleDislike}>
          ❌
        </button>
        <button className="btn bottom-btn add" onClick={handleAdd}>
          ➕
        </button>
        <button className="btn bottom-btn like" onClick={handleLike}>
          💚
        </button>
      </div>
      <div className="read-buttons">
        <button className="btn  bottom-btn like-read" onClick={handleReadLike}>
          Read & Liked
        </button>
        <button className="btn  bottom-btn dislike-read" onClick={handleReadNotLike}>
          Read & Didn't Like
        </button>
     </div>
      <BookInfoModal
        isOpen={showInfoLaukia}
        onClose={itxiLaukia}
        bookTitle={bookTitle}
        bookInfo={bookInfo}
      />
     
    </div>
    </>
  );
};

export default Home;
