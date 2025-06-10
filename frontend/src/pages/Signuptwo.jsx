import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/style.css';


function Signup2() {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const username = params.get('username');

  const genreOptions = [
    'Fantasy', 'Fiction', 'Romance', 'Suspense', 'History',
    'Horror', 'Sports', 'Biography', 'Science Fiction', 'Adventure', 'Other'
  ];

  const handleCheckboxChange = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const response = await axios.patch(`${process.env.REACT_APP_API_URL}/api/users/user/${username}`, {
        favoriteGenres: selectedGenres,
      });
      if (response.data.success) {
        console.log('Datos guardados correctamente');
        navigate('/');  
      } else {
        console.error("Error al guardar los géneros:", response.data.message);
        navigate('/signuptwo');  
      }
    } catch (err) {
      console.error('Error al guardar los géneros: ', err);
      navigate('/signuptwo'); 
    }
  };

  return (
    <div className="form-container">
      <h2>Choose your favorite genres</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group checkbox-group">
          {genreOptions.map((genre) => (
            <label className="checkbox-item" key={genre}>
              <span className="checkbox-label">{genre}</span>
              <input
                type="checkbox"
                value={genre}
                checked={selectedGenres.includes(genre)}
                onChange={() => handleCheckboxChange(genre)}
              />
            </label>
          ))}
        </div>
        <button className="submit-btn" type="submit">Register</button>
      </form>
    </div>
  );
}

export default Signup2;
