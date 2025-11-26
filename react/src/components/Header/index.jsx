import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { searchMembers } from '../../api/members';
import './Header.css';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchMembers(searchQuery);
          setSearchResults(results);
          setShowSearchDropdown(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 500);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleMemberClick = (memberId) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    navigate(`/profile/${memberId}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = () => {
    if (!user) return '?';
    return user.first_name ? user.first_name.charAt(0).toUpperCase() : '?';
  };

  const getFullName = () => {
    if (!user) return 'User';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
  };

  return (
    <header className="header" data-easytag="id4-src/components/Header/index.jsx">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="header-logo">
            <div className="logo-circle">СС</div>
          </Link>
        </div>

        <div className="header-center" ref={searchRef}>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Поиск"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {isSearching && (
              <div className="search-loading">...</div>
            )}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map((member) => (
                  <div
                    key={member.id}
                    className="search-result-item"
                    onClick={() => handleMemberClick(member.id)}
                  >
                    <div className="search-result-avatar">
                      {member.first_name ? member.first_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="search-result-info">
                      <div className="search-result-name">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="search-result-email">{member.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showSearchDropdown && searchQuery.trim().length > 0 && searchResults.length === 0 && !isSearching && (
              <div className="search-dropdown">
                <div className="search-no-results">Ничего не найдено</div>
              </div>
            )}
          </div>
        </div>

        <div className="header-right">
          <Link to="/" className="header-icon-button" title="Главная">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </Link>
          <Link to="/search" className="header-icon-button" title="Друзья">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </Link>
          <div className="header-profile" ref={profileRef}>
            <div
              className="header-avatar"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              {getInitials()}
            </div>
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-avatar">{getInitials()}</div>
                  <div className="profile-dropdown-name">{getFullName()}</div>
                </div>
                <div className="profile-dropdown-divider"></div>
                <Link
                  to={`/profile/${user?.id}`}
                  className="profile-dropdown-item"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Мой профиль
                </Link>
                <Link
                  to="/settings"
                  className="profile-dropdown-item"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                  </svg>
                  Настройки
                </Link>
                <div className="profile-dropdown-divider"></div>
                <div className="profile-dropdown-item" onClick={handleLogout}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  Выйти
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
