import instance from './axios';

/**
 * Search members by name or email
 * @param {string} search - Search query
 * @returns {Promise} - Array of members
 */
export const searchMembers = async (search = '') => {
  const response = await instance.get('/api/members', {
    params: search ? { search } : {},
  });
  return response.data;
};

/**
 * Get member profile by ID
 * @param {number} id - Member ID
 * @returns {Promise} - Member profile data
 */
export const getMember = async (id) => {
  const response = await instance.get(`/api/members/${id}`);
  return response.data;
};

/**
 * Update member profile
 * @param {number} id - Member ID
 * @param {Object} data - Update data
 * @param {string} data.first_name - First name
 * @param {string} data.last_name - Last name
 * @param {string} data.email - Email address
 * @returns {Promise} - Updated member data
 */
export const updateMember = async (id, data) => {
  const response = await instance.put(`/api/members/${id}`, data);
  return response.data;
};

/**
 * Toggle friendship with another member
 * @param {number} id - Member ID to add/remove as friend
 * @returns {Promise} - Friendship status
 */
export const toggleFriend = async (id) => {
  const response = await instance.post(`/api/members/${id}/friend`);
  return response.data;
};
