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
  const fetchInitialBook = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/recommendations`, {
        userId,
      });

      if (res.data.success && res.data.books.length > 0) {
        const validBook = await findNextValidBook(res.data.books);
        if (validBook) {
          setBooks(res.data.books);
          setCurrentBookIndex(validBook.index);
          setBookTitle(validBook.title);
          setBookInfo(validBook.info);
        } else {
          setBookTitle('');
          setBookInfo(null);
        }
      }
    } catch (err) {
      alert("The daily recommendation limit has been reached. Please try again later.");
    }
  };

  fetchInitialBook();
}, []);

const findNextValidBook = async (bookList, startIndex = 0) => {
  for (let i = startIndex; i < bookList.length; i++) {
    const title = bookList[i];
    const info = await fetchBookDetails(title);
    if (info?.image) {
      return { index: i, title, info };
    }
  }
  return null;
};

 
const nextBook = async () => {
  const userId = sessionStorage.getItem("userId");
  if (!userId) return;

  const next = await findNextValidBook(books, currentBookIndex + 1);

  if (next) {
    setCurrentBookIndex(next.index);
    setBookTitle(next.title);
    setBookInfo(next.info);
  } else {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/recommendations`, {
        userId,
      });

      if (res.data.success && res.data.books.length > 0) {
        const validBook = await findNextValidBook(res.data.books);
        if (validBook) {
          setBooks(res.data.books);
          setCurrentBookIndex(validBook.index);
          setBookTitle(validBook.title);
          setBookInfo(validBook.info);
        } else {
          setBookTitle('');
          setBookInfo(null);
        }
      } else {
        setBookTitle('');
        setBookInfo(null);
      }
    } catch (err) {
      alert("The daily recommendation limit has been reached. Please try again later.");
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
    console.error("Error updating swipe stats:", err.message);
  }
};

 const handleAddUserBook = async (status) => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return alert("You are not log");

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
        } else {
          console.log('Error saving the workbook');
        }
      } catch (error) {
        console.error("Error saving user book:", error);
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
        <h2>{bookInfo?.title || bookTitle}</h2>
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
