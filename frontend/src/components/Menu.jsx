import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../css/style.css';

const Menu = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation(); 

  return (
    <div className="menu-container">
      <div className="menu-button-wrapper">
        <button onClick={() => setShowDropdown(!showDropdown)} className="menu-button">
          Menu ☰
        </button>

        {showDropdown && (
          <div className="dropdown-menu">
            {location.pathname !== '/home' && (
              <button
                onClick={() => {
                  setShowDropdown(false);
                  window.location.href = "/home";
                }}
                className="dropdown-item"
              >
                🏠 Home
              </button>
            )}
              {location.pathname !== '/findBook' && (
              <button
                onClick={() => {
                  setShowDropdown(false);
                  window.location.href = "/findBook";
                }}
                className="dropdown-item"
              >
                🔍 Find Book
              </button>
            )}
            {!['/liburutegiaLike', '/liburutegiaRead'].includes(location.pathname) && ( 
              <button
                onClick={() => {
                  setShowDropdown(false);
                  window.location.href = "/liburutegiaLike";
                }}
                className="dropdown-item"
              >
                📚 Library
              </button>
            )}
            {location.pathname !== '/statistics' && (
              <button
                onClick={() => {
                  setShowDropdown(false);
                  window.location.href = "/statistics";
                }}
                className="dropdown-item"
              >
                📊 Statistics
              </button>
            )}
            <button
              onClick={() => {
                sessionStorage.removeItem("userId");
                window.location.href = "/";
              }}
              className="dropdown-item logout"
            >
              🚪 Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
