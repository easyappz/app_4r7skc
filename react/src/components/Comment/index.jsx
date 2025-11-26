import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deleteComment } from '../../api/comments';
import './Comment.css';

export const Comment = ({ comment, onCommentDeleted }) => {
  const { user } = useAuth();
  const isAuthor = user && comment.author && user.id === comment.author.id;

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      return;
    }

    try {
      await deleteComment(comment.id);
      if (onCommentDeleted) {
        onCommentDeleted(comment.id);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Не удалось удалить комментарий');
    }
  };

  const getInitials = (author) => {
    if (!author) return '??';
    const firstInitial = author.first_name?.[0] || '';
    const lastInitial = author.last_name?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин`;
    if (diffHours < 24) return `${diffHours} ч`;
    if (diffDays < 7) return `${diffDays} д`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="comment" data-easytag="id8-src/components/Comment/index.jsx">
      <Link to={`/profile/${comment.author?.id}`} className="comment-avatar-link">
        <div className="comment-avatar">
          {getInitials(comment.author)}
        </div>
      </Link>
      <div className="comment-body">
        <div className="comment-content">
          <Link to={`/profile/${comment.author?.id}`} className="comment-author">
            {comment.author?.first_name} {comment.author?.last_name}
          </Link>
          <div className="comment-text">
            {comment.content}
          </div>
        </div>
        <div className="comment-footer">
          <span className="comment-time">{formatTime(comment.created_at)}</span>
          {isAuthor && (
            <>
              <span className="comment-separator">·</span>
              <button className="comment-delete" onClick={handleDelete}>
                Удалить
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
