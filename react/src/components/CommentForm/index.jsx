import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createComment } from '../../api/comments';
import './CommentForm.css';

export const CommentForm = ({ postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    try {
      setLoading(true);
      const newComment = await createComment(postId, { content: content.trim() });
      setContent('');
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
    } catch (err) {
      console.error('Error creating comment:', err);
      alert('Не удалось добавить комментарий');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getInitials = () => {
    if (!user) return '';
    const firstInitial = user.first_name?.[0] || '';
    const lastInitial = user.last_name?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit} data-easytag="id9-src/components/CommentForm/index.jsx">
      <div className="comment-form-avatar">
        {getInitials()}
      </div>
      <div className="comment-form-input-wrapper">
        <input
          type="text"
          className="comment-form-input"
          placeholder="Напишите комментарий..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        {content.trim() && (
          <button
            type="submit"
            className="comment-form-submit"
            disabled={loading}
            title="Отправить"
          >
            ➤
          </button>
        )}
      </div>
    </form>
  );
};
