# Utils Directory

Server-side utility functions and helpers.

## Structure

```
utils/
├── validators.js   # Input validation helpers
└── helpers.js      # General helper functions
```

## Example: `validators.js`

```javascript
const validator = require('validator');

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
const isValidPassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

/**
 * Validate university name
 */
const isValidUniversity = (university) => {
  const allowedUniversities = ['SMU', 'NUS', 'NTU', 'SUTD', 'SIT', 'SUSS'];
  return allowedUniversities.includes(university);
};

/**
 * Sanitize user input
 */
const sanitizeInput = (input) => {
  return validator.escape(validator.trim(input));
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidUniversity,
  sanitizeInput
};
```

## Example: `helpers.js`

```javascript
/**
 * Generate a random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Paginate query results
 */
const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit, offset };
};

/**
 * Format pagination response
 */
const formatPaginationResponse = (data, page, limit, total) => {
  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  generateRandomString,
  paginate,
  formatPaginationResponse
};
```
