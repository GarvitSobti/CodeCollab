# Controllers Directory

Controllers handle HTTP requests and coordinate between routes, services, and models.

## Structure

```
controllers/
├── authController.js        # Authentication logic
├── userController.js        # User management
├── hackathonController.js   # Hackathon operations
├── matchingController.js    # Matching algorithm
├── reviewController.js      # Peer review logic
└── messageController.js     # Messaging operations
```

## Controller Pattern

Each controller should:
1. Receive request data
2. Validate input (using middleware or validator)
3. Call appropriate service/model methods
4. Return formatted response

## Example: `userController.js`

```javascript
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: ['skills', 'reviews']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { bio, github, linkedin, skills } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ bio, github, linkedin });

    // Update skills if provided
    if (skills) {
      await user.setSkills(skills);
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user by ID (public profile)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'email'] },
      include: ['skills', 'reviews']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

## Error Handling

Always wrap async operations in try-catch blocks and return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
