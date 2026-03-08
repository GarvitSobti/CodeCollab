# Contributing to CodeCollab

Thank you for your interest in contributing to CodeCollab! This document provides guidelines for contributing to the project.

## 🌟 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the problem
- Expected vs. actual behavior
- Screenshots (if applicable)
- Your environment (OS, browser, Node.js version)

### Suggesting Features

We welcome feature suggestions! Please:
- Check existing issues first to avoid duplicates
- Clearly describe the feature and its use case
- Explain how it aligns with CodeCollab's mission
- Include mockups or examples if possible

### Pull Requests

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow the code style**
   - Use ESLint and Prettier configurations
   - Write meaningful commit messages
   - Add comments for complex logic

3. **Test your changes**
   - Ensure all existing tests pass
   - Add tests for new features
   - Test on multiple browsers if frontend changes

4. **Update documentation**
   - Update README.md if needed
   - Add API documentation for new endpoints
   - Update relevant docs/ files

5. **Submit your PR**
   - Reference related issues
   - Describe what changed and why
   - Include screenshots for UI changes
   - Request review from maintainers

## 📝 Code Style Guidelines

### JavaScript/React
- Use functional components with hooks
- Follow ES6+ syntax
- Use meaningful variable and function names
- Keep components small and focused
- Use PropTypes or TypeScript for type safety

### Git Commit Messages
Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(matching): add skill-based filtering algorithm
fix(auth): resolve Firebase token expiration issue
docs(readme): update installation instructions
```

## 🏗️ Development Setup

1. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

2. **Set up environment variables**
   - Copy `.env.example` files to `.env`
   - Fill in your credentials

3. **Run the development servers**
   ```bash
   # Frontend (in client/)
   npm start

   # Backend (in server/)
   npm run dev
   ```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📏 Code Review Process

All submissions require review. We use GitHub pull requests for this purpose:

1. Maintainers will review your PR within 3-5 business days
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release!

## 🤝 Code of Conduct

Please note that this project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 💡 Need Help?

- Check [existing issues](https://github.com/yourusername/CodeCollab/issues)
- Read the [documentation](docs/)
- Ask questions in issues or discussions
- Reach out to the maintainers

## 🎯 Priority Areas

We're particularly interested in contributions for:
- Improving the matching algorithm
- UI/UX enhancements
- Performance optimizations
- Test coverage
- Documentation improvements
- Accessibility features

## 📜 License

By contributing to CodeCollab, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to CodeCollab! 🚀
