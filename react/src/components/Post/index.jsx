import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toggleLike, deletePost } from '../../api/posts';
import { getComments } from '../../api/comments';
import { Comment } from '../Comment';
import { CommentForm } from '../CommentForm';
import './Post.css';

export const Post = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  const isAuthor = user && post.author && user.id === post.author.id;

  const handleLike = async () => {
    if (loadingLike) return;

    try {
      setLoadingLike(true);
      const data = await toggleLike(post.id);
      setIsLiked(data.is_liked);
      setLikesCount(data.likes_count);
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот пост?')) {
      return;
    }

    try {
      await deletePost(post.id);
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Не удалось удалить пост');
    }
  };

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const data = await getComments(post.id);
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleCommentAdded = (newComment) => {
    setComments([...comments, newComment]);
    setCommentsCount(commentsCount + 1);
    setShowComments(true);
  };

  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter(c => c.id !== commentId));
    setCommentsCount(Math.max(0, commentsCount - 1));
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
    <div className="post" data-easytag="id7-src/components/Post/index.jsx">
      <div className="post-header">
        <Link to={`/profile/${post.author?.id}`} className="post-author-link">
          <div className="post-avatar">
            {getInitials(post.author)}
          </div>
        </Link>
        <div className="post-header-info">
          <Link to={`/profile/${post.author?.id}`} className="post-author-name">
            {post.author?.first_name} {post.author?.last_name}
          </Link>
          <div className="post-time">
            {formatTime(post.created_at)}
          </div>
        </div>
        {isAuthor && (
          <button className="post-delete-btn" onClick={handleDelete} title="Удалить пост">
            ✕
          </button>
        )}
      </div>

      <div className="post-content">
        {post.content}
      </div>

      <div className="post-stats">
        <div className="post-stats-left">
          {likesCount > 0 && (
            <span className="post-likes-count">
              ❤️ {likesCount}
            </span>
          )}
        </div>
        <div className="post-stats-right">
          {commentsCount > 0 && (
            <span className="post-comments-count">
              {commentsCount} {commentsCount === 1 ? 'комментарий' : 'комментариев'}
            </span>
          )}
        </div>
      </div>

      <div className="post-actions">
        <button
          className={`post-action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={loadingLike}
        >
          <span className="post-action-icon">{isLiked ? '❤️' : '🤍'}</span>
          <span className="post-action-text">Нравится</span>
        </button>
        <button
          className="post-action-btn"
          onClick={handleToggleComments}
        >
          <span className="post-action-icon">💬</span>
          <span className="post-action-text">Комментировать</span>
        </button>
      </div>

      {showComments && (
        <div className="post-comments-section">
          {loadingComments ? (
            <div className="post-comments-loading">Загрузка комментариев...</div>
          ) : (
            <div className="post-comments-list">
              {comments.map(comment => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  onCommentDeleted={handleCommentDeleted}
                />
              ))}
            </div>
          )}
          <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
        </div>
      )}
    </div>
  );
};
