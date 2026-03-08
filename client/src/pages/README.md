# Pages Directory

This directory contains page-level components that correspond to routes.

## Structure

```
pages/
├── Home/
│   ├── Home.jsx
│   └── Home.css
├── Auth/
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Auth.css
├── Dashboard/
│   ├── Dashboard.jsx
│   └── Dashboard.css
├── Profile/
│   ├── Profile.jsx
│   ├── EditProfile.jsx
│   └── Profile.css
├── Discover/
│   ├── Discover.jsx
│   └── Discover.css
├── Hackathons/
│   ├── HackathonList.jsx
│   ├── HackathonDetail.jsx
│   └── Hackathons.css
└── Messages/
    ├── Messages.jsx
    └── Messages.css
```

## Page Component Guidelines

- Each page should be in its own folder
- Include a main component file and associated styles
- Use descriptive names that match the route
- Import necessary components from `components/` directory

## Example Page Component

```jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import './PageName.css';

const PageName = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch data on mount
  }, []);

  return (
    <div className="page-name">
      <Header />
      <main>
        {/* Page content */}
      </main>
    </div>
  );
};

export default PageName;
```
