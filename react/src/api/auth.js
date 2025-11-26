import instance from './axios';

/**
 * Register a new member
 * @param {Object} data - Registration data
 * @param {string} data.email - Email address
 * @param {string} data.password - Password (min 8 characters)
 * @param {string} data.first_name - First name
 * @param {string} data.last_name - Last name
 * @returns {Promise} - Registration response
 */
export const register = async (data) => {
  const response = await instance.post('/api/auth/register', data);
  return response.data;
};

/**
 * Login member
 * @param {Object} data - Login credentials
 * @param {string} data.email - Email address
 * @param {string} data.password - Password
 * @returns {Promise} - Login response with user data
 */
export const login = async (data) => {
  const response = await instance.post('/api/auth/login', data);
  return response.data;
};

/**
 * Logout current member
 * @returns {Promise} - Logout response
 */
export const logout = async () => {
  const response = await instance.post('/api/auth/logout');
  return response.data;
};

/**
 * Get current authenticated member
 * @returns {Promise} - Current member data
 */
export const getMe = async () => {
  const response = await instance.get('/api/auth/me');
  return response.data;
};
