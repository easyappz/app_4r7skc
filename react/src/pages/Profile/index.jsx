import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMember } from '../../api/members';
import { getPosts } from '../../api/posts';
import { Layout } from '../../components/Layout';
import { Post } from '../../components/Post';
import { ProfileHeader } from './ProfileHeader';
import './Profile.css';

export const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [error, setError] = useState(null);

  const isOwnProfile = user && member && user.id === parseInt(id);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const memberData = await getMember(id);
      setMember(memberData);
      
      // Load posts for this user
      const allPosts = await getPosts();
      const userPosts = allPosts.filter(post => post.author?.id === parseInt(id));
      setPosts(userPosts);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const handleFriendshipChanged = (newMemberData) => {
    setMember(newMemberData);
  };

  if (loading) {
    return (
      <Layout>
        <div className="profile-loading" data-easytag="id10-src/pages/Profile/index.jsx">
          Загрузка профиля...
        </div>
      </Layout>
    );
  }

  if (error || !member) {
    return (
      <Layout>
        <div className="profile-error" data-easytag="id10-src/pages/Profile/index.jsx">
          {error || 'Профиль не найден'}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="profile" data-easytag="id10-src/pages/Profile/index.jsx">
        <ProfileHeader 
          member={member} 
          isOwnProfile={isOwnProfile}
          onFriendshipChanged={handleFriendshipChanged}
        />

        <div className="profile-body">
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Публикации
            </button>
            <button
              className={`profile-tab ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              О себе
            </button>
          </div>

          <div className="profile-content">
            {activeTab === 'posts' && (
              <div className="profile-posts">
                {posts.length === 0 ? (
                  <div className="profile-no-posts">
                    {isOwnProfile ? 'У вас пока нет публикаций' : 'Нет публикаций'}
                  </div>
                ) : (
                  posts.map(post => (
                    <Post
                      key={post.id}
                      post={post}
                      onPostDeleted={handlePostDeleted}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="profile-about">
                <div className="profile-about-card">
                  <h3 className="profile-about-title">Основная информация</h3>
                  <div className="profile-about-info">
                    <div className="profile-about-item">
                      <span className="profile-about-label">Имя:</span>
                      <span className="profile-about-value">
                        {member.first_name} {member.last_name}
                      </span>
                    </div>
                    <div className="profile-about-item">
                      <span className="profile-about-label">Email:</span>
                      <span className="profile-about-value">{member.email}</span>
                    </div>
                    {member.bio && (
                      <div className="profile-about-item">
                        <span className="profile-about-label">О себе:</span>
                        <span className="profile-about-value">{member.bio}</span>
                      </div>
                    )}
                    <div className="profile-about-item">
                      <span className="profile-about-label">Друзей:</span>
                      <span className="profile-about-value">{member.friends_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
