import instance from './axios';

/**
 * Get news feed posts
 * @returns {Promise} - Array of posts from friends and own posts
 */
export const getPosts = async () => {
  const response = await instance.get('/api/posts');
  return response.data;
};

/**
 * Create a new post
 * @param {Object} data - Post data
 * @param {string} data.content - Post content
 * @returns {Promise} - Created post data
 */
export const createPost = async (data) => {
  const response = await instance.post('/api/posts', data);
  return response.data;
};

/**
 * Get post by ID
 * @param {number} id - Post ID
 * @returns {Promise} - Post data
 */
export const getPost = async (id) => {
  const response = await instance.get(`/api/posts/${id}`);
  return response.data;
};

/**
 * Delete post by ID
 * @param {number} id - Post ID
 * @returns {Promise} - Delete response
 */
export const deletePost = async (id) => {
  const response = await instance.delete(`/api/posts/${id}`);
  return response.data;
};

/**
 * Toggle like on a post
 * @param {number} id - Post ID
 * @returns {Promise} - Like status and count
 */
export const toggleLike = async (id) => {
  const response = await instance.post(`/api/posts/${id}/like`);
  return response.data;
};
