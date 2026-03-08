# Services Directory

Business logic layer separating controllers from direct model access.

## Structure

```
services/
├── matchingService.js      # Matching algorithm logic
├── emailService.js         # Email notifications (SendGrid)
└── externalApiService.js   # Third-party API integrations
```

## Service Pattern

Services contain reusable business logic that can be called from multiple controllers.

### Example: `matchingService.js`

```javascript
const { User, Skill, Review } = require('../models');
const { Op } = require('sequelize');

/**
 * Calculate match score between two users
 * @param {Object} user1 - First user with skills
 * @param {Object} user2 - Second user with skills
 * @returns {number} - Match score (0-100)
 */
const calculateMatchScore = (user1, user2) => {
  let score = 0;

  // Skill complementarity (40 points)
  const user1Skills = new Set(user1.skills.map(s => s.id));
  const user2Skills = new Set(user2.skills.map(s => s.id));
  
  const complementarySkills = [...user2Skills].filter(s => !user1Skills.has(s));
  const skillScore = Math.min((complementarySkills.length / 5) * 40, 40);
  score += skillScore;

  // Experience level balance (20 points)
  const experienceLevels = { beginner: 1, intermediate: 2, advanced: 3 };
  const expDiff = Math.abs(
    experienceLevels[user1.experienceLevel] - 
    experienceLevels[user2.experienceLevel]
  );
  const expScore = expDiff === 1 ? 20 : expDiff === 0 ? 15 : 10;
  score += expScore;

  // Review score (40 points)
  const avgReviews = (user2.averageRating || 0) / 5 * 40;
  score += avgReviews;

  return Math.round(score);
};

/**
 * Find potential matches for a user
 * @param {number} userId - User ID
 * @param {Object} filters - Optional filters
 * @returns {Array} - Ranked list of potential matches
 */
const findMatches = async (userId, filters = {}) => {
  const currentUser = await User.findByPk(userId, {
    include: ['skills']
  });

  if (!currentUser) {
    throw new Error('User not found');
  }

  // Build query
  const where = {
    id: { [Op.ne]: userId } // Exclude current user
  };

  if (filters.university) {
    where.university = filters.university;
  }

  if (filters.experienceLevel) {
    where.experienceLevel = filters.experienceLevel;
  }

  // Fetch potential matches
  const users = await User.findAll({
    where,
    include: [
      'skills',
      {
        model: Review,
        as: 'reviewsReceived',
        attributes: []
      }
    ],
    attributes: {
      include: [
        [sequelize.fn('AVG', sequelize.col('reviewsReceived.rating')), 'averageRating']
      ]
    },
    group: ['User.id'],
    limit: filters.limit || 50
  });

  // Calculate match scores
  const matches = users.map(user => ({
    ...user.toJSON(),
    matchScore: calculateMatchScore(currentUser, user)
  }));

  // Sort by match score descending
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
};

module.exports = {
  calculateMatchScore,
  findMatches
};
```

### Example: `emailService.js`

```javascript
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject,
    html
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to CodeCollab!';
  const html = `
    <h1>Welcome, ${user.firstName}!</h1>
    <p>Thanks for joining CodeCollab. Start discovering your perfect hackathon teammates today!</p>
  `;
  await sendEmail(user.email, subject, html);
};

const sendMatchNotification = async (user, matchedUser) => {
  const subject = 'You have a new match!';
  const html = `
    <h1>New Match!</h1>
    <p>You matched with ${matchedUser.firstName} ${matchedUser.lastName}!</p>
    <p>Check out their profile and start collaborating.</p>
  `;
  await sendEmail(user.email, subject, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendMatchNotification
};
```

## Usage in Controllers

```javascript
const matchingService = require('../services/matchingService');

exports.getMatches = async (req, res) => {
  try {
    const matches = await matchingService.findMatches(req.user.id, req.query);
    res.json({ matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```
