# Quick Start Guide

Get ExpenseFlow running on your machine in 5 minutes or less.

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] **Node.js** 18.x or higher → [Download](https://nodejs.org/)
- [ ] **Git** → [Download](https://git-scm.com/)
- [ ] **Code Editor** (VS Code recommended) → [Download](https://code.visualstudio.com/)

### Platform-Specific (Optional for Development)

**For iOS Development (macOS only):**
- [ ] Xcode 14+ from App Store
- [ ] Xcode Command Line Tools: `xcode-select --install`

**For Android Development:**
- [ ] Android Studio → [Download](https://developer.android.com/studio)
- [ ] Android SDK (install via Android Studio)

---

## Installation Steps

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/expenseflow.git
cd expenseflow

# Install dependencies
npm install
```

**Expected output**: Dependencies installed successfully (may take 2-3 minutes)

### 2. Start Development Server

```bash
npm run dev
```

**Expected output**: 
```
Metro waiting on exp://192.168.x.x:8081
```

### 3. Run on Your Device

You have three options:

#### Option A: Physical Device (Easiest)
1. Install **Expo Go** on your phone:
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Scan the QR code from the terminal with your camera (iOS) or Expo Go app (Android)

#### Option B: iOS Simulator (macOS only)
```bash
# Press 'i' in the terminal
# Or run:
npm run ios
```

#### Option C: Android Emulator
```bash
# Start Android Studio → AVD Manager → Start emulator
# Then press 'a' in the terminal
# Or run:
npm run android
```

---

## Verification

You should see the ExpenseFlow home screen with:
- ✅ "Welcome to ExpenseFlow" header
- ✅ Emerald green accent colors
- ✅ Bottom tab navigation
- ✅ "Add Expense" button

---

## Common First-Time Issues

### Issue: Metro bundler won't start
**Solution**:
```bash
npx expo start -c
```

### Issue: "Cannot find module"
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: iOS simulator not opening
**Solution**:
```bash
# Verify Xcode installation
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

### Issue: Android emulator not detected
**Solution**:
1. Open Android Studio
2. Tools → AVD Manager
3. Create a new virtual device if none exists
4. Start the emulator
5. Wait for it to fully boot (may take 2-3 minutes first time)

---

## Next Steps

Now that ExpenseFlow is running:

1. **Explore the app**:
   - Add your first expense
   - Navigate through tabs (Home, Stats, Goals, Profile)
   - Try switching between light/dark mode

2. **Make your first change**:
   - Open `app/(tabs)/index.tsx`
   - Change line 50: `"Welcome to ExpenseFlow"` → `"My ExpenseFlow"`
   - Save the file (app will auto-reload)

3. **Learn the codebase**:
   - Read the [Project Structure](../README.md#-project-structure)
   - Review the [Design System](./design-system.xml)
   - Check the [Tech Stack](../README.md#-tech-stack)

4. **Start developing**:
   - Create a new feature branch: `git checkout -b feature/my-feature`
   - Make your changes
   - Test on both iOS and Android
   - Commit and push

---

## Development Workflow

### Recommended Development Setup

**VS Code Extensions**:
- ESLint
- Prettier
- React Native Tools
- TypeScript

**Terminal Commands**:
```bash
# Start dev server
npm run dev

# Type checking (in another terminal)
npm run typecheck

# Linting
npm run lint
```

### File Watching

Metro bundler automatically:
- ✅ Reloads when you save files
- ✅ Shows errors in the terminal
- ✅ Displays warnings in the app

### Hot Reload Shortcuts

In the Expo Go app:
- **Shake device** (or Cmd+D / Cmd+M) → Open developer menu
- **r** → Reload app
- **m** → Toggle element inspector

---

## Debugging Tips

### View Logs

**In Terminal**:
```bash
# Metro bundler shows console.log output
npm run dev
```

**In Browser**:
```bash
# Open React Native Debugger
# Press 'j' in terminal
```

### Debug Tools

```javascript
// Add to any component
console.log('Debug:', someVariable);
console.warn('Warning message');
console.error('Error message');
```

### Network Debugging

Use React Native Debugger or Flipper for advanced debugging.

---

## Project Commands Reference

```bash
# Development
npm run dev              # Start with no telemetry
npm start                # Start normally
npm run start:clear      # Start with cleared cache

# Platform-specific
npm run android          # Open in Android
npm run ios              # Open in iOS
npm run web              # Open in browser

# Quality checks
npm run typecheck        # TypeScript validation
npm run lint             # ESLint check

# Build (see README for full guide)
npm run build:web        # Web production build
```

---

## Getting Help

- **Documentation**: Read the full [README](../README.md)
- **Troubleshooting**: See [BUILD_TROUBLESHOOTING.md](./BUILD_TROUBLESHOOTING.md)
- **Issues**: Create a GitHub issue
- **Expo Docs**: https://docs.expo.dev

---

## Ready to Build for Production?

Once you're comfortable with development, check out the [Building for Production](../README.md#-building-for-production) section in the README.

---

**Happy Coding! 🚀**
