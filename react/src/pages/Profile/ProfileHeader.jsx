import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleFriend } from '../../api/members';
import './ProfileHeader.css';

export const ProfileHeader = ({ member, isOwnProfile, onFriendshipChanged }) => {
  const [loadingFriend, setLoadingFriend] = useState(false);
  const [isFriend, setIsFriend] = useState(member.is_friend);
  const [friendsCount, setFriendsCount] = useState(member.friends_count || 0);

  const handleToggleFriend = async () => {
    if (loadingFriend) return;

    try {
      setLoadingFriend(true);
      const data = await toggleFriend(member.id);
      setIsFriend(data.is_friend);
      
      // Update friends count
      if (data.is_friend) {
        setFriendsCount(friendsCount + 1);
      } else {
        setFriendsCount(Math.max(0, friendsCount - 1));
      }

      // Notify parent component
      if (onFriendshipChanged) {
        onFriendshipChanged({ ...member, is_friend: data.is_friend });
      }
    } catch (err) {
      console.error('Error toggling friend:', err);
      alert('Не удалось изменить статус дружбы');
    } finally {
      setLoadingFriend(false);
    }
  };

  const getInitials = () => {
    const firstInitial = member.first_name?.[0] || '';
    const lastInitial = member.last_name?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <div className="profile-header" data-easytag="id11-src/pages/Profile/ProfileHeader.jsx">
      <div className="profile-cover">
        <div className="profile-cover-gradient"></div>
      </div>

      <div className="profile-header-content">
        <div className="profile-header-top">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {getInitials()}
            </div>
          </div>
        </div>

        <div className="profile-header-info">
          <div className="profile-header-left">
            <h1 className="profile-name">
              {member.first_name} {member.last_name}
            </h1>
            {member.bio && (
              <p className="profile-bio">{member.bio}</p>
            )}
            <div className="profile-meta">
              <span className="profile-friends-count">
                {friendsCount} {friendsCount === 1 ? 'друг' : 'друзей'}
              </span>
            </div>
          </div>

          <div className="profile-header-actions">
            {isOwnProfile ? (
              <button className="profile-btn profile-btn-edit">
                ✏️ Редактировать профиль
              </button>
            ) : (
              <button
                className={`profile-btn ${isFriend ? 'profile-btn-unfriend' : 'profile-btn-friend'}`}
                onClick={handleToggleFriend}
                disabled={loadingFriend}
              >
                {loadingFriend ? (
                  'Загрузка...'
                ) : isFriend ? (
                  <>👤 Удалить из друзей</>
                ) : (
                  <>➕ Добавить в друзья</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
