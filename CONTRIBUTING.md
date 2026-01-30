# Contributing to react-permissions-gate

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/react-permissions-gate.git
cd react-permissions-gate
```

2. Install dependencies:
```bash
npm install
```

3. Build the library:
```bash
npm run build
```

4. Watch mode for development:
```bash
npm run dev
```

## Project Structure

```
react-permissions-gate/
├── src/
│   ├── core/           # Core rule engine and types
│   ├── react/          # React components and hooks
│   ├── devtools/       # Dev panel implementation
│   └── index.ts        # Main export file
├── dist/               # Built files (generated)
├── example.tsx         # Usage examples
└── README.md
```

## Code Style

- Use TypeScript for all code
- Follow existing code formatting
- Add JSDoc comments for public APIs
- Keep functions pure when possible
- Write descriptive commit messages

## Adding Features

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes

3. Test your changes:
```bash
npm run build
# Test in a sample React app
```

4. Commit your changes:
```bash
git commit -m "feat: add your feature description"
```

5. Push and create a pull request

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Pull Request Process

1. Update README.md with details of changes if needed
2. Update example.tsx if adding new features
3. Ensure TypeScript compiles without errors
4. Update the CHANGELOG (if applicable)
5. Request review from maintainers

## Reporting Bugs

Please open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (React version, etc.)

## Feature Requests

Open an issue with:
- Clear description of the feature
- Use cases and examples
- Why this would be valuable

## Questions?

Feel free to open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
