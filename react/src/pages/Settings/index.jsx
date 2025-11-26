import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { updateMember } from '../../api/members';
import { getMe } from '../../api/auth';
import './Settings.css';

export const Settings = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('basic');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      });
    }
  }, [user, loading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      setMessage({ type: 'error', text: 'Пользователь не найден' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await updateMember(user.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email
      });

      const updatedUser = await getMe();
      
      setMessage({ type: 'success', text: 'Профиль успешно обновлен' });
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || 'Ошибка при сохранении изменений';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="settings-loading">Загрузка...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="settings-container" data-easytag="id12-src/pages/Settings/index.jsx">
        <div className="settings-sidebar">
          <nav className="settings-menu">
            <button
              className={`settings-menu-item ${activeSection === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveSection('basic')}
            >
              Основная информация
            </button>
          </nav>
        </div>

        <div className="settings-content">
          {activeSection === 'basic' && (
            <div className="settings-card">
              <h2 className="settings-card-title">Основная информация</h2>
              
              {message.text && (
                <div className={`settings-message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="settings-form">
                <div className="settings-form-group">
                  <label htmlFor="first_name" className="settings-label">
                    Имя
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="settings-input"
                    maxLength={150}
                    required
                  />
                </div>

                <div className="settings-form-group">
                  <label htmlFor="last_name" className="settings-label">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="settings-input"
                    maxLength={150}
                    required
                  />
                </div>

                <div className="settings-form-group">
                  <label htmlFor="email" className="settings-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="settings-input"
                    required
                  />
                </div>

                <div className="settings-form-actions">
                  <button
                    type="submit"
                    className="settings-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
