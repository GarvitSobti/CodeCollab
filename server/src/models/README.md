# Models Directory

Database models using Sequelize ORM.

## Structure

```
models/
├── index.js           # Model associations and exports
├── User.js            # User model
├── Skill.js           # Skill model
├── Hackathon.js       # Hackathon model
├── Match.js           # Match model
├── Review.js          # Review model
├── Message.js         # Message model
└── Conversation.js    # Conversation model
```

## Model Pattern

### Example: `User.js`

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firebaseUid: {
    type: DataTypes.STRING(128),
    unique: true,
    allowNull: true,
    field: 'firebase_uid'
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name'
  },
  university: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  yearOfStudy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 4
    },
    field: 'year_of_study'
  },
  major: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  profilePicture: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'profile_picture'
  },
  githubUsername: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'github_username'
  },
  linkedinUsername: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'linkedin_username'
  },
  portfolioUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'portfolio_url'
  },
  experienceLevel: {
    type: DataTypes.STRING(20),
    defaultValue: 'beginner',
    validate: {
      isIn: [['beginner', 'intermediate', 'advanced']]
    },
    field: 'experience_level'
  }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;
```

### Example: `index.js` (Model Associations)

```javascript
const User = require('./User');
const Skill = require('./Skill');
const Hackathon = require('./Hackathon');
const Review = require('./Review');
const Match = require('./Match');

// User <-> Skills (Many-to-Many)
User.belongsToMany(Skill, { 
  through: 'user_skills',
  as: 'skills',
  foreignKey: 'user_id'
});
Skill.belongsToMany(User, { 
  through: 'user_skills',
  foreignKey: 'skill_id'
});

// User <-> Reviews
User.hasMany(Review, { 
  as: 'reviewsGiven',
  foreignKey: 'reviewer_id'
});
User.hasMany(Review, { 
  as: 'reviewsReceived',
  foreignKey: 'reviewee_id'
});
Review.belongsTo(User, { 
  as: 'reviewer',
  foreignKey: 'reviewer_id'
});
Review.belongsTo(User, { 
  as: 'reviewee',
  foreignKey: 'reviewee_id'
});

// User <-> Matches
User.belongsToMany(User, {
  through: Match,
  as: 'matches',
  foreignKey: 'user_1_id',
  otherKey: 'user_2_id'
});

module.exports = {
  User,
  Skill,
  Hackathon,
  Review,
  Match
};
```

## Best Practices

- Use camelCase in models, snake_case in database
- Define all constraints and validations
- Use associations for related data
- Keep models focused on data structure, not business logic
