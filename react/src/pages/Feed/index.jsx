import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { CreatePost } from '../../components/CreatePost';
import { Post } from '../../components/Post';
import { getPosts } from '../../api/posts';
import './Feed.css';

export const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getPosts();
      setPosts(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить посты');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => post.id === updatedPost.id ? updatedPost : post));
  };

  return (
    <Layout>
      <div className="feed-container" data-easytag="id5-src/pages/Feed/index.jsx">
        <div className="feed-sidebar-left"></div>
        <div className="feed-content">
          <CreatePost onPostCreated={handlePostCreated} />
          
          {loading && <div className="feed-loading">Загрузка...</div>}
          {error && <div className="feed-error">{error}</div>}
          
          <div className="feed-posts">
            {posts.map(post => (
              <Post
                key={post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
              />
            ))}
            {!loading && posts.length === 0 && (
              <div className="feed-empty">Пока нет постов в ленте</div>
            )}
          </div>
        </div>
        <div className="feed-sidebar-right"></div>
      </div>
    </Layout>
  );
};
