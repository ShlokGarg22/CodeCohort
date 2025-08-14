/**
 * Utility functions for safely rendering commit data
 */

/**
 * Safely get commit author name
 * @param {Object} commit - Commit object
 * @returns {string} - Author name
 */
export const getCommitAuthorName = (commit) => {
  if (!commit || !commit.author) return 'Unknown';
  
  // Handle different possible structures
  if (typeof commit.author === 'string') return commit.author;
  if (typeof commit.author === 'object') {
    return commit.author.username || commit.author.name || 'Unknown';
  }
  
  return 'Unknown';
};

/**
 * Safely get commit author display text
 * @param {Object} commit - Commit object
 * @returns {string} - Author display text
 */
export const getCommitAuthorDisplay = (commit) => {
  if (!commit || !commit.author) return 'Unknown';
  
  // Handle different possible structures
  if (typeof commit.author === 'string') return commit.author;
  if (typeof commit.author === 'object') {
    const username = commit.author.username;
    const name = commit.author.name;
    
    // Prefer username, fallback to name
    if (username && name && username !== name) {
      return `${name} (${username})`;
    }
    return username || name || 'Unknown';
  }
  
  return 'Unknown';
};

/**
 * Safely get commit message
 * @param {Object} commit - Commit object
 * @returns {string} - Commit message
 */
export const getCommitMessage = (commit) => {
  if (!commit) return 'No commit message';
  
  return commit.shortMessage || commit.message || 'No commit message';
};

/**
 * Safely get commit date
 * @param {Object} commit - Commit object
 * @returns {Date} - Commit date
 */
export const getCommitDate = (commit) => {
  if (!commit) return new Date();
  
  const dateStr = commit.author?.date || commit.timestamp;
  if (!dateStr) return new Date();
  
  return new Date(dateStr);
};

/**
 * Safely get commit author avatar
 * @param {Object} commit - Commit object
 * @returns {string} - Avatar URL
 */
export const getCommitAuthorAvatar = (commit) => {
  if (!commit || !commit.author) return '';
  
  if (typeof commit.author === 'object' && commit.author.avatar) {
    return commit.author.avatar;
  }
  
  // Generate a default avatar based on email or name
  const email = commit.author?.email || '';
  const name = commit.author?.name || commit.author?.username || 'unknown';
  
  if (email) {
    return `https://github.com/identicons/${email}.png`;
  }
  
  return `https://github.com/identicons/${name}.png`;
};

/**
 * Safely get commit author initials
 * @param {Object} commit - Commit object
 * @returns {string} - Author initials
 */
export const getCommitAuthorInitials = (commit) => {
  const name = getCommitAuthorName(commit);
  
  if (!name || name === 'Unknown') return 'U';
  
  return name.charAt(0).toUpperCase();
};
