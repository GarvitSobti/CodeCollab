# Assets Directory

Static assets like images, icons, and fonts.

## Structure

```
assets/
├── images/
│   ├── logo.png
│   ├── hero-image.png
│   └── placeholder-avatar.png
├── icons/
│   ├── github.svg
│   ├── linkedin.svg
│   └── email.svg
└── fonts/
    └── (custom fonts if needed)
```

## Usage

```javascript
import logo from '../assets/images/logo.png';
import githubIcon from '../assets/icons/github.svg';

const Header = () => {
  return (
    <header>
      <img src={logo} alt="CodeCollab Logo" />
      <img src={githubIcon} alt="GitHub" />
    </header>
  );
};
```

## Asset Guidelines

- Use SVG for icons when possible (scalable, smaller file size)
- Optimize images before committing (use tools like TinyPNG)
- Use descriptive filenames: `hero-background.jpg` not `img1.jpg`
- Keep file sizes reasonable (< 500KB for images)
