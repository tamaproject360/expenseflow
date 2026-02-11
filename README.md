<div align="center">

# ExpenseFlow 💎

### A sophisticated, local-first personal finance tracker

Built with Expo and React Native for iOS and Android

[![Status](https://img.shields.io/badge/Status-Feature%20Complete-success)](https://github.com/yourusername/expenseflow)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue)](#-platform-support)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-000020.svg?logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

[Features](#-features) • [Getting Started](#-getting-started) • [Build](#-building-for-production) • [Tech Stack](#-tech-stack) • [Project Structure](#-project-structure)

</div>

---

## 📱 Features

### 🏆 Core Capabilities
- **🔐 Local-First Architecture**: All data stored locally on your device using SQLite - zero cloud dependencies
- **⚡ Smart Tracking**: Quick expense logging with intelligent categorization
- **📊 Visual Analytics**: Beautiful donut charts and comprehensive spending insights
- **🎯 Real-time Budget Tracking**: Live monitoring with over-budget alerts

### ✨ Advanced Features
- **🎮 Gamification System**: Build healthy financial habits with streaks and achievements
- **📅 Budget Goals**: Set monthly budgets with visual progress tracking
- **📤 Data Export**: Export transaction history to CSV format
- **🔔 Smart Notifications**: Daily reminders to maintain your streak
- **🌍 Internationalization**: Native support for English and Indonesian (Bahasa Indonesia)
- **🌓 Dark Mode**: Automatic theme switching with system preferences

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **npm**: v9.x or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Expo CLI**: Will be installed with dependencies

For iOS development (macOS only):
- **Xcode**: 14.x or higher ([Download](https://developer.apple.com/xcode/))
- **CocoaPods**: Latest version (`sudo gem install cocoapods`)

For Android development:
- **Android Studio**: Latest version ([Download](https://developer.android.com/studio))
- **Android SDK**: API Level 33 or higher
- **JDK**: 17 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/expenseflow.git
   cd expenseflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```
   
   Or use the npm script:
   ```bash
   npm run dev
   ```

4. **Run on your device or simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan the QR code with Expo Go app for physical devices

### Development Commands

```bash
# Start development server
npm run dev

# Start with cache cleared
npx expo start -c

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for web
npm run build:web
```

---

## 📦 Building for Production

### Prerequisites for Building

#### iOS Requirements (macOS only)
- Xcode 14.x or higher
- Active Apple Developer Account ($99/year)
- Valid provisioning profiles and certificates

#### Android Requirements
- Android Studio with SDK Platform 33+
- Java Development Kit (JDK) 17+
- Valid keystore file for signing (for production builds)

### Option 1: Build with EAS (Expo Application Services) - Recommended

EAS Build is the recommended way to build production-ready apps. It provides cloud-based builds with minimal setup.

#### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

#### 2. Login to Expo Account

```bash
eas login
```

If you don't have an account, create one at [expo.dev](https://expo.dev).

#### 3. Configure EAS Build

```bash
eas build:configure
```

This will create `eas.json` in your project root.

#### 4. Build for Android

**Development Build (for testing):**
```bash
eas build --platform android --profile development
```

**Preview Build (internal testing):**
```bash
eas build --platform android --profile preview
```

**Production Build (release to Play Store):**
```bash
eas build --platform android --profile production
```

The APK/AAB file will be available in your Expo dashboard.

#### 5. Build for iOS

**Development Build:**
```bash
eas build --platform ios --profile development
```

**Preview Build (TestFlight):**
```bash
eas build --platform ios --profile preview
```

**Production Build (App Store):**
```bash
eas build --platform ios --profile production
```

#### 6. Build for Both Platforms

```bash
eas build --platform all --profile production
```

### Option 2: Local Builds (Advanced)

For developers who prefer local builds or need more control.

#### Local Android Build

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Prebuild native projects**
   ```bash
   npx expo prebuild --platform android
   ```

3. **Generate Android keystore (first time only)**
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore expenseflow.keystore -alias expenseflow -keyalg RSA -keysize 2048 -validity 10000
   ```

4. **Configure signing** (create `android/gradle.properties`):
   ```properties
   MYAPP_UPLOAD_STORE_FILE=expenseflow.keystore
   MYAPP_UPLOAD_KEY_ALIAS=expenseflow
   MYAPP_UPLOAD_STORE_PASSWORD=your_password
   MYAPP_UPLOAD_KEY_PASSWORD=your_password
   ```

5. **Build APK (for testing)**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   Output: `android/app/build/outputs/apk/release/app-release.apk`

6. **Build AAB (for Play Store)**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   Output: `android/app/build/outputs/bundle/release/app-release.aab`

#### Local iOS Build (macOS only)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Install CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

3. **Prebuild native projects**
   ```bash
   npx expo prebuild --platform ios
   ```

4. **Install iOS dependencies**
   ```bash
   cd ios
   pod install
   cd ..
   ```

5. **Open in Xcode**
   ```bash
   open ios/ExpenseFlow.xcworkspace
   ```

6. **Configure signing in Xcode**
   - Select your project in the navigator
   - Go to "Signing & Capabilities"
   - Select your Team
   - Ensure "Automatically manage signing" is checked

7. **Build Archive**
   - In Xcode: Product → Archive
   - Once complete, the Organizer window opens
   - Click "Distribute App" to upload to App Store or export IPA

### Alternative: Using `expo build` (Classic Build - Deprecated)

⚠️ **Note**: Classic builds are deprecated. Use EAS Build instead.

```bash
# For Android
expo build:android -t apk  # For APK
expo build:android -t app-bundle  # For AAB

# For iOS
expo build:ios -t archive  # For App Store
expo build:ios -t simulator  # For testing
```

### Submitting to App Stores

#### Submit to Google Play Store

```bash
# Using EAS Submit
eas submit --platform android

# Or manually upload the AAB file to Google Play Console
```

#### Submit to Apple App Store

```bash
# Using EAS Submit
eas submit --platform ios

# Or use Xcode's built-in submission process
```

### Environment-Specific Builds

Create different build profiles in `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildType": "release"
      }
    }
  }
}
```

---

## 🛠 Tech Stack

### Core Framework
- **[Expo](https://expo.dev)** (SDK 54) - Universal React Native framework
- **[React Native](https://reactnative.dev)** (0.81.5) - Cross-platform mobile development
- **[TypeScript](https://www.typescriptlang.org/)** (5.9) - Type-safe JavaScript

### Navigation & Routing
- **expo-router** (v6) - File-based routing system
- **react-navigation** - Navigation library

### Data & Storage
- **expo-sqlite** (v16) - Local SQLite database with singleton pattern
- **@react-native-async-storage/async-storage** - Async key-value storage
- **expo-secure-store** - Encrypted storage for sensitive data

### UI & Styling
- **React Native StyleSheet** - Native styling system
- **Custom Design System** - Consistent design tokens and components
- **expo-linear-gradient** - Gradient backgrounds
- **expo-blur** - Blur effects

### Features & Utilities
- **i18n-js** + **expo-localization** - Internationalization
- **expo-notifications** - Push notifications
- **expo-haptics** - Haptic feedback
- **lucide-react-native** - Icon library
- **react-native-svg** - SVG support for charts
- **expo-file-system** - File operations for CSV export
- **expo-sharing** - Share functionality

### Developer Experience
- **Expo Go** - Development client
- **TypeScript** - Static type checking
- **ESLint** - Code linting

---

## 📂 Project Structure

```
expenseflow/
├── app/                          # Expo Router screens (file-based routing)
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── index.tsx            # Home screen (expense list)
│   │   ├── stats.tsx            # Statistics & analytics
│   │   ├── goals.tsx            # Budget goals management
│   │   └── profile.tsx          # User profile & settings
│   ├── _layout.tsx              # Root layout
│   └── +not-found.tsx           # 404 screen
│
├── components/                   # Reusable UI components
│   ├── charts/                  # Chart components (DonutChart, etc.)
│   ├── modals/                  # Modal dialogs
│   ├── cards/                   # Card components
│   └── ui/                      # Basic UI elements
│
├── constants/                    # Design system & configuration
│   ├── Colors.ts                # Color palette
│   ├── Typography.ts            # Font styles
│   └── Layout.ts                # Layout constants
│
├── lib/                         # Business logic & utilities
│   ├── database.ts              # SQLite database singleton
│   ├── streaks.ts               # Streak calculation logic
│   ├── achievements.ts          # Achievement system
│   ├── i18n.ts                  # Internationalization setup
│   ├── notifications.ts         # Notification helpers
│   └── csvExport.ts             # CSV export functionality
│
├── context/                     # React Context providers
│   └── ThemeContext.tsx         # Theme state management
│
├── assets/                      # Static assets
│   ├── images/                  # Images & icons
│   └── fonts/                   # Custom fonts
│
├── docs/                        # Documentation
│   ├── design-system.xml        # Design system specification
│   ├── task.md                  # Task tracking
│   └── CHANGELOG.md             # Change log
│
├── app.json                     # Expo configuration
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── eas.json                     # EAS Build configuration (if using EAS)
└── README.md                    # This file
```

### Key Directories Explained

- **`/app`**: Contains all screens using Expo Router's file-based routing. Each file automatically becomes a route.
- **`/components`**: Reusable React components organized by category (charts, modals, cards, ui).
- **`/constants`**: Design tokens and configuration constants for consistent styling.
- **`/lib`**: Business logic, database operations, and utility functions.
- **`/context`**: React Context providers for global state management.
- **`/docs`**: Project documentation (stored separately from root as per guidelines).

---

## 🎨 Design System

ExpenseFlow follows a **"Sophisticated Play"** design philosophy, combining professional aesthetics with playful interactions.

### Color Palette

```typescript
Primary:   Emerald (#10B981)  // Main actions, success states
Accent:    Amber (#F59E0B)    // Highlights, warnings
Background: 
  Light:   #FFFFFF, #F9FAFB
  Dark:    #111827, #1F2937
Text:
  Light:   #111827, #4B5563
  Dark:    #F9FAFB, #9CA3AF
```

### Typography

- **Primary Font**: Plus Jakarta Sans
- **Weights**: Regular (400), Medium (500), SemiBold (600), Bold (700)
- **Scale**: 12px, 14px, 16px, 18px, 24px, 32px, 48px

### Components

All components follow consistent spacing (8px grid), border radius (8px, 16px, 24px), and shadow patterns.

See `/docs/design-system.xml` for complete specifications.

---

## 🌍 Platform Support

- **iOS**: 13.0 and above
- **Android**: API Level 23 (Android 6.0) and above
- **Devices**: iPhone, iPad, Android phones and tablets

---

## 🔒 Privacy & Security

- **100% Local-First**: All financial data is stored locally using SQLite
- **No Cloud Sync**: Zero data transmission to external servers
- **Encrypted Storage**: Sensitive settings stored using `expo-secure-store`
- **No Third-Party Analytics**: No tracking, no telemetry
- **Open Source**: Transparent codebase for security audits

Your financial data never leaves your device.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code follows existing style conventions
- TypeScript types are properly defined
- No linting errors (`npm run lint`)
- Type checking passes (`npm run typecheck`)

---

## 📄 License

MIT © 2025 tamadev

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

---

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- Icons by [Lucide](https://lucide.dev)
- Font: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)

---

<div align="center">

**[⬆ Back to Top](#expenseflow-)**

Made with ❤️ for better financial habits

</div>
