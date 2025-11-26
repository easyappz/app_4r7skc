import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createPost } from '../../api/posts';
import './CreatePost.css';

export const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Пожалуйста, введите текст поста');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newPost = await createPost({ content: content.trim() });
      setContent('');
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err) {
      setError('Не удалось создать пост');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!user) return '';
    const firstInitial = user.first_name?.[0] || '';
    const lastInitial = user.last_name?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <div className="create-post" data-easytag="id6-src/components/CreatePost/index.jsx">
      <div className="create-post-header">
        <div className="create-post-avatar">
          {getInitials()}
        </div>
        <textarea
          className="create-post-textarea"
          placeholder="О чем вы думаете?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          rows={3}
        />
      </div>
      {error && <div className="create-post-error">{error}</div>}
      <div className="create-post-footer">
        <button
          className="create-post-button"
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
        >
          {loading ? 'Публикация...' : 'Опубликовать'}
        </button>
      </div>
    </div>
  );
};
