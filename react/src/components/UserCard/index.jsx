import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleFriend } from '../../api/members';
import { useAuth } from '../../context/AuthContext';
import './UserCard.css';

export const UserCard = ({ member }) => {
  const { user } = useAuth();
  const [isFriend, setIsFriend] = useState(member.is_friend || false);
  const [loading, setLoading] = useState(false);

  const isCurrentUser = user && user.id === member.id;

  const handleToggleFriend = async (e) => {
    e.preventDefault();
    if (loading || isCurrentUser) return;

    setLoading(true);
    try {
      const response = await toggleFriend(member.id);
      setIsFriend(response.is_friend);
    } catch (error) {
      console.error('Error toggling friend:', error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (isCurrentUser) return 'Это вы';
    if (loading) return 'Загрузка...';
    if (isFriend) return 'Удалить из друзей';
    return 'Добавить в друзья';
  };

  const getButtonClass = () => {
    if (isCurrentUser) return 'user-card-button user-card-button-disabled';
    if (isFriend) return 'user-card-button user-card-button-remove';
    return 'user-card-button user-card-button-add';
  };

  return (
    <div className="user-card" data-easytag="id14-src/components/UserCard/index.jsx">
      <Link to={`/profile/${member.id}`} className="user-card-link">
        <div className="user-card-avatar">
          <div className="user-card-avatar-placeholder">
            {member.first_name ? member.first_name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
        <div className="user-card-info">
          <h3 className="user-card-name">
            {member.first_name || member.last_name
              ? `${member.first_name || ''} ${member.last_name || ''}`.trim()
              : 'Пользователь'}
          </h3>
          {member.city && (
            <p className="user-card-city">{member.city}</p>
          )}
        </div>
      </Link>
      <button
        className={getButtonClass()}
        onClick={handleToggleFriend}
        disabled={loading || isCurrentUser}
      >
        {getButtonText()}
      </button>
    </div>
  );
};
