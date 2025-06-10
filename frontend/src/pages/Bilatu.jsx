import React, { useState, useEffect, useRef, useCallback } from "react"; 
import axios from 'axios';
import '../css/style.css';
import Menu from "../components/Menu";
import BookInfoModal from "../components/BookInfoModel";


function Bilatu () {
    const [book, setBook] = useState("");
    const [result, setResult] = useState([]);
    const [visibleCount, setVisibleCount] = useState(10);
    const [activeAddMenu, setActiveAddMenu] = useState(null);
    const containerRef = useRef(null);

    const [showInfoLaukia, setShowInfoLaukia] = useState(false);
    const [currentBookInfo, setCurrentBookInfo] = useState(null);
    const [currentBookTitle, setCurrentBookTitle] = useState('');

    function handleChange(event){
        setBook(event.target.value);
    }

    async function handleSubmit(event){
        event.preventDefault();
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/books/search?q=${book}`);
            setResult(response.data.items || []);
            setVisibleCount(10); 
        } catch (error) {
            console.error("Error buscando libros:", error);
        }
    }

    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
            setVisibleCount(prev => Math.min(prev + 5, result.length));
        }
    }, [result]); 

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    const handleAddBook = async (book, status) => {
        const userId = sessionStorage.getItem("userId");
        if (!userId) {
            console.log("Not logged in");
            return;
        }

        try {
            const checkRes = await axios.get(`${process.env.REACT_APP_API_URL}/user-books/user/${userId}/book/${book.id}`);
            console.log("checkRes.data:", checkRes.data);

            if (checkRes.data.exists) {
                const existingStatus = checkRes.data.status;
                if ((existingStatus === 'read_liked' || existingStatus === 'read_disliked') && status === 'want_to_read') {
                   alert("This book is already marked as read, it cannot be set to 'Want to read'.");
                  return;
                }
            }

            const publishedYear = book.volumeInfo.publishedDate
            ? book.volumeInfo.publishedDate.substring(0, 4)
            : null;

            const bookData = {
                id: book.id,
                title: book.volumeInfo.title,
                author: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : "Unknown",
                year: publishedYear,
                description: book.volumeInfo.description || "",
                genre: book.volumeInfo.categories || [],
                image: book.volumeInfo.imageLinks?.thumbnail || ""
            };

            const res = await axios.post(`${process.env.REACT_APP_API_URL}/user-books`, {
                userId,
                bookData,
                status
            });

            if (res.data.success) {
                alert("Booak Add'.");

                console.log("Book add");
            } else {
                alert("Error adding book.");
            }

        } catch (error) {
            console.error("Error en handleAddBook:", error.message);
        }
    };
    const displayedBooks = result
        .filter(book => book?.volumeInfo?.imageLinks?.thumbnail) // solo libros con imagen
        .slice(0, visibleCount);

    const handleShowInfo = (book) => {
        const info = {
            title: book.volumeInfo.title,
            image: book.volumeInfo.imageLinks?.thumbnail || "",
            authors: book.volumeInfo.authors || [],
            publishedDate: book.volumeInfo.publishedDate || "N/A",
            categories: book.volumeInfo.categories || [],
            description: book.volumeInfo.description || "We don’t have that information."
        };

        setCurrentBookTitle(info.title);
        setCurrentBookInfo(info);
        setShowInfoLaukia(true);
    }; 

    const closeInfoModal = () => {
        setShowInfoLaukia(false);
        setCurrentBookInfo(null);
        setCurrentBookTitle('');
    };

    return (
        <>
            <Menu />
            <div className="mainhome-container">
                <h1>Search Book</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group-bilatu">
                        <input 
                            type="text"
                            onChange={handleChange}
                            className="input-bilatu"
                            placeholder="Search for Books"
                            autoComplete="off"
                        />
                    </div>
                    <button type="submit" className="bilatu-btn">Search</button>
                </form>

                <div className="scroll-grid-container" ref={containerRef}>
                    {displayedBooks.map((book, index) => (
                        <div className="book-slot" key={index}>
                            {book ? (
                                <>
                                <span
                                    className="like-serch"
                                    onClick={() => setActiveAddMenu(activeAddMenu === index ? null : index)}
                                >
                                    💚
                                </span>
                                  <span
                                    className="see-more"
                                    onClick={() => handleShowInfo(book)}
                                >
                                    ➕
                                </span>  

                                {activeAddMenu === index && (
                                <div className="add-options">
                                    <button onClick={() => { handleAddBook(book, 'want_to_read'); setActiveAddMenu(null); }}>Want to read</button>
                                    <button onClick={() => { handleAddBook(book, 'read_liked'); setActiveAddMenu(null); }}>Read & Like</button>
                                    <button onClick={() => { handleAddBook(book, 'read_disliked'); setActiveAddMenu(null); }}>Read & dislike</button>
                                    </div>
                                )}
                                    {book.volumeInfo.imageLinks?.thumbnail && (
                                        <img 
                                            src={book.volumeInfo.imageLinks.thumbnail}
                                            alt={book.volumeInfo.title}
                                            className="book-image"
                                        />
                                    )}
                                    <p className="book-title">{book.volumeInfo.title}</p>
                                </>
                            ) : (
                                <div className="empty-slot">Empty</div>
                            )}
                        </div>
                    ))}
                </div>
                          
            </div>
            <BookInfoModal
                isOpen={showInfoLaukia}
                onClose={closeInfoModal}
                bookTitle={currentBookTitle}
                bookInfo={currentBookInfo}
            />
        </>
    );
}

export default Bilatu;
