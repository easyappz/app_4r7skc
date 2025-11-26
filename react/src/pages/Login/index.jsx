import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа. Проверьте email и пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" data-easytag="id1-src/pages/Login/index.jsx">
      <header className="login-header">
        <div className="login-header-content">
          <h1 className="login-logo">Социальная сеть</h1>
        </div>
      </header>
      
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Вход в аккаунт</h2>
          
          {error && <div className="login-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <input
                type="email"
                className="login-input"
                placeholder="Электронная почта"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="login-form-group">
              <input
                type="password"
                className="login-input"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          
          <div className="login-divider"></div>
          
          <div className="login-register-section">
            <Link to="/register" className="login-register-button">
              Создать аккаунт
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
