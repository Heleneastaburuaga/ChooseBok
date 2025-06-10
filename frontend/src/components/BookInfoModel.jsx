import React from "react";
import '../css/style.css';


const BookInfoModal = ({ isOpen, onClose, bookTitle, bookInfo }) => {
  if (!isOpen || !bookInfo) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>✖</button>
        <h2>{bookTitle}</h2>
        {bookInfo.image && <img src={bookInfo.image} alt="Book Cover" className="modal-image" />}
        <p><strong>Author:</strong> {
          Array.isArray(bookInfo.authors)
            ? bookInfo.authors.join(", ")
            : bookInfo.authors || "We don’t have that information."
        }</p>
        <p><strong>Year of publication:</strong> {bookInfo.publishedDate || "N/A"}</p>
        <p><strong>Genre:</strong> {
          Array.isArray(bookInfo.categories)
            ? bookInfo.categories.join(", ")
            : bookInfo.categories || "N/A"
        }</p>
        <p><strong>Description:</strong> {bookInfo.description || "We don’t have that information."}</p>
      </div>
    </div>
  );
};

export default BookInfoModal;
