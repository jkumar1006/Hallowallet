# Contributing to HalloWallet

First off, thank you for considering contributing to HalloWallet! 🎉👻

It's people like you that make HalloWallet such a great tool for personal finance management.

## Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (screenshots, code snippets)
- **Describe the behavior you observed** and what you expected
- **Include your environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any similar features** in other applications

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/your-username/hallowallet.git
cd hallowallet

# Add upstream remote
git remote add upstream https://github.com/original-owner/hallowallet.git

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Start development server
npm run dev
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary
- Use strict type checking

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper prop typing

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### File Naming

- Components: `PascalCase.tsx` (e.g., `ExpenseTracker.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatCurrency.ts`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_ENDPOINTS`)

## Testing

### Running Tests

```bash
npm test
```

### Writing Tests

- Write tests for new features
- Ensure existing tests pass
- Test edge cases
- Test error handling

## Commit Messages

Follow the conventional commits specification:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(voice): add support for Spanish language
fix(expenses): correct date parsing for ordinal numbers
docs(readme): update installation instructions
```

## Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

## Pull Request Process

1. **Update the README.md** with details of changes if applicable
2. **Update documentation** for any new features
3. **Ensure all tests pass** and add new tests if needed
4. **Update the CHANGELOG.md** with your changes
5. **Request review** from maintainers
6. **Address review comments** promptly

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── contexts/         # React contexts
├── i18n/            # Internationalization
├── lib/             # Utilities and helpers
└── types/           # TypeScript types
```

## Key Areas for Contribution

### High Priority

- 🐛 Bug fixes
- 📝 Documentation improvements
- 🌍 Translation additions
- ♿ Accessibility improvements
- 🎨 UI/UX enhancements

### Feature Ideas

- 📱 Mobile app development
- 🏦 Bank integration
- 📊 Advanced analytics
- 🤖 ML-powered insights
- 📧 Email notifications
- 📤 Export features

## Getting Help

- 💬 [GitHub Discussions](https://github.com/yourusername/hallowallet/discussions)
- 🐛 [GitHub Issues](https://github.com/yourusername/hallowallet/issues)
- 📖 [Documentation](https://github.com/yourusername/hallowallet/wiki)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (if applicable)

## License

By contributing to HalloWallet, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to HalloWallet! 🎃✨
