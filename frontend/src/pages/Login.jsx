import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';  
import '../css/style.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/login`, {
        username,
        password,
      });

      if (res.data.success) {
        sessionStorage.setItem('userId', res.data.userId);
        navigate('/home'); 
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Errorea: ezin izan da konektatu.');
    }
  };

  return (
    <>
    <img
      src="/Logo_fondo.png"
      alt="Logo"
      className="login-image"
    />
    <div className="form-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="submit-btn" type="submit">Login</button>
      </form>
      <div className="signup-link">
        <p>Don’t you have an account? <Link to="/signup">Register</Link></p>
      </div>
    </div>
    </>
  );
}

export default Login;
