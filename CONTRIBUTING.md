# Contributing to ExpenseFlow

Thank you for your interest in contributing to ExpenseFlow! This document provides guidelines and instructions for contributing.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

---

## Getting Started

### 1. Fork & Clone

```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/expenseflow.git
cd expenseflow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a Branch

```bash
# For new features
git checkout -b feature/amazing-feature

# For bug fixes
git checkout -b fix/bug-description

# For documentation
git checkout -b docs/what-you-are-documenting
```

### 4. Make Your Changes

See [Code Standards](#code-standards) below.

---

## Development Workflow

### Running the App

```bash
# Start development server
npm run dev

# Run on specific platform
npm run ios
npm run android
npm run web
```

### Before Committing

Always run these checks:

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Test on both iOS and Android if possible
```

### Testing Your Changes

1. Test on at least one platform (iOS or Android)
2. Verify dark mode if UI changes were made
3. Test both English and Indonesian languages if text was changed
4. Ensure no console errors or warnings
5. Test with different screen sizes if possible

---

## Code Standards

### TypeScript

- **Use TypeScript for all files** (`.ts`, `.tsx`)
- **Define types explicitly** - avoid `any`
- **Use interfaces for objects**, types for unions/primitives

**Good**:
```typescript
interface Expense {
  id: number;
  amount: number;
  category: string;
  date: string;
}

const addExpense = (expense: Expense): void => {
  // implementation
};
```

**Bad**:
```typescript
const addExpense = (expense: any) => {  // ❌ No any
  // implementation
};
```

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use semicolons
- **Line length**: Max 100 characters (soft limit)

### Naming Conventions

```typescript
// Components: PascalCase
const ExpenseCard = () => { };

// Functions/Variables: camelCase
const calculateTotal = () => { };
const isActive = true;

// Constants: UPPER_SNAKE_CASE
const MAX_BUDGET = 10000;

// Files:
// - Components: PascalCase (ExpenseCard.tsx)
// - Utilities: camelCase (database.ts)
// - Screens: camelCase (index.tsx)
```

### Component Structure

```typescript
// 1. Imports
import { View, Text } from 'react-native';
import { useState } from 'react';

// 2. Types/Interfaces
interface ExpenseCardProps {
  amount: number;
  category: string;
}

// 3. Component
export default function ExpenseCard({ amount, category }: ExpenseCardProps) {
  // 4. Hooks
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 5. Functions
  const handlePress = () => {
    setIsExpanded(!isExpanded);
  };
  
  // 6. Render
  return (
    <View>
      <Text>{amount}</Text>
    </View>
  );
}

// 7. Styles
const styles = StyleSheet.create({
  container: {
    // styles
  },
});
```

### Clean Code Principles

#### 1. Single Responsibility
Each function should do ONE thing well.

**Good**:
```typescript
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};
```

**Bad**:
```typescript
const validateUser = (email: string, password: string, name: string) => {
  // Does too many things
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 8;
  const nameValid = name.length > 0;
  return emailValid && passwordValid && nameValid;
};
```

#### 2. DRY (Don't Repeat Yourself)

**Good**:
```typescript
const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

// Use it everywhere
<Text>{formatCurrency(expense.amount)}</Text>
```

**Bad**:
```typescript
// Repeating the same logic
<Text>Rp {expense1.amount.toLocaleString('id-ID')}</Text>
<Text>Rp {expense2.amount.toLocaleString('id-ID')}</Text>
<Text>Rp {expense3.amount.toLocaleString('id-ID')}</Text>
```

#### 3. Meaningful Names

**Good**:
```typescript
const calculateMonthlyBudgetPercentage = (spent: number, budget: number): number => {
  return (spent / budget) * 100;
};
```

**Bad**:
```typescript
const calc = (a: number, b: number): number => {
  return (a / b) * 100;
};
```

#### 4. Error Handling

Always handle errors properly:

```typescript
const deleteExpense = async (id: number): Promise<void> => {
  try {
    await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
  } catch (error) {
    console.error('Failed to delete expense:', error);
    throw new Error('Failed to delete expense');
  }
};
```

#### 5. Comments

- Comment WHY, not WHAT
- Remove commented-out code
- Use JSDoc for exported functions

**Good**:
```typescript
// Calculate percentage to determine if budget is exceeded
// Uses 80% threshold as warning level
const isOverBudget = (spent: number, budget: number): boolean => {
  return (spent / budget) > 0.8;
};
```

**Bad**:
```typescript
// This function calculates if over budget
const isOverBudget = (spent: number, budget: number): boolean => {
  // Divide spent by budget
  return (spent / budget) > 0.8;  // Return true if over 80%
};
```

### Design System Compliance

Follow the design system defined in `docs/design-system.xml`:

- **Colors**: Use constants from `constants/Colors.ts`
- **Typography**: Use constants from `constants/Typography.ts`
- **Spacing**: Use 8px grid (8, 16, 24, 32, etc.)
- **Border Radius**: 8px, 16px, or 24px

```typescript
// Good
import { Colors } from '@/constants/Colors';

<View style={{ backgroundColor: Colors.light.primary }}>

// Bad
<View style={{ backgroundColor: '#10B981' }}>  // ❌ Hardcoded color
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(expenses): add CSV export functionality"

# Bug fix
git commit -m "fix(stats): correct donut chart percentage calculation"

# Documentation
git commit -m "docs(readme): add build instructions for iOS"

# Refactoring
git commit -m "refactor(database): extract query logic to separate functions"
```

### Good Commit Messages

- Use present tense: "add feature" not "added feature"
- Use imperative mood: "fix bug" not "fixes bug"
- Keep subject line under 50 characters
- Reference issues: `fix(auth): resolve login issue (#123)`

---

## Pull Request Process

### 1. Update Your Branch

```bash
# Get latest changes from main
git checkout main
git pull upstream main

# Merge into your branch
git checkout feature/amazing-feature
git merge main
```

### 2. Push Your Changes

```bash
git push origin feature/amazing-feature
```

### 3. Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] No console errors
- [ ] Passes type checking
- [ ] Passes linting

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
```

### 4. Wait for Review

- Address feedback from reviewers
- Make requested changes
- Push updates to the same branch

### 5. After Merge

```bash
# Delete your local branch
git branch -d feature/amazing-feature

# Delete remote branch
git push origin --delete feature/amazing-feature
```

---

## Project Structure

```
expenseflow/
├── app/              # Screens (file-based routing)
├── components/       # Reusable components
├── constants/        # Design tokens
├── lib/              # Business logic
├── context/          # React Context
├── assets/           # Images, fonts
└── docs/             # Documentation
```

### Where to Add New Code

- **New screen**: `app/` directory
- **Reusable component**: `components/` directory
- **Business logic**: `lib/` directory
- **Types**: `types/` directory (create if needed)
- **Constants**: `constants/` directory

---

## Questions?

- **General Questions**: Open a [Discussion](https://github.com/yourusername/expenseflow/discussions)
- **Bug Reports**: Open an [Issue](https://github.com/yourusername/expenseflow/issues)
- **Feature Requests**: Open an [Issue](https://github.com/yourusername/expenseflow/issues) with `enhancement` label

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to ExpenseFlow! 🎉**
