import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

export const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!formData.first_name.trim()) {
      setError('Введите имя');
      return;
    }
    if (!formData.last_name.trim()) {
      setError('Введите фамилию');
      return;
    }
    if (!formData.email.trim()) {
      setError('Введите email');
      return;
    }
    if (formData.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page" data-easytag="id2-src/pages/Register/index.jsx">
      <header className="register-header">
        <div className="register-header-content">
          <h1 className="register-logo">Социальная сеть</h1>
        </div>
      </header>
      
      <div className="register-container">
        <div className="register-card">
          <h2 className="register-title">Регистрация</h2>
          <p className="register-subtitle">Быстро и легко</p>
          
          {error && <div className="register-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-form-row">
              <div className="register-form-group">
                <input
                  type="text"
                  name="first_name"
                  className="register-input"
                  placeholder="Имя"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  maxLength={150}
                />
              </div>
              
              <div className="register-form-group">
                <input
                  type="text"
                  name="last_name"
                  className="register-input"
                  placeholder="Фамилия"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  maxLength={150}
                />
              </div>
            </div>
            
            <div className="register-form-group">
              <input
                type="email"
                name="email"
                className="register-input"
                placeholder="Электронная почта"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            
            <div className="register-form-group">
              <input
                type="password"
                name="password"
                className="register-input"
                placeholder="Новый пароль (минимум 8 символов)"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                minLength={8}
              />
            </div>
            
            <button 
              type="submit" 
              className="register-button"
              disabled={loading}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          
          <div className="register-divider"></div>
          
          <div className="register-login-section">
            <Link to="/login" className="register-login-link">
              Уже есть аккаунт?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
