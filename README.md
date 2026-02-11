# ExpenseFlow

A sophisticated, local-first personal finance tracker built with Expo and React Native.

## 📱 Features

- **Local-First Architecture**: All data stored locally on your device using SQLite. Secure and private by default.
- **Smart Tracking**: Quick expense logging with categorized transactions.
- **Gamification**: Build healthy financial habits with streaks and achievements.
- **Visual Analytics**: Beautiful charts and insights into your spending habits.
- **Budget Goals**: Set monthly budgets and track your progress.
- **Secure Access**: PIN protection and local authentication.

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev) (SDK 54) + [React Native](https://reactnative.dev)
- **Language**: TypeScript
- **Database**: `expo-sqlite`
- **Routing**: `expo-router` v6 (File-based routing)
- **Styling**: `react-native` StyleSheet + Custom Design System
- **Animations**: React Native `Animated` API (Core)
- **Icons**: `lucide-react-native`
- **Fonts**: `@expo-google-fonts/plus-jakarta-sans`
- **Haptics**: `expo-haptics`

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/expenseflow.git
    cd expenseflow
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the app**
    ```bash
    npx expo start -c
    ```

## 📂 Project Structure

- `/app`: Expo Router screens and layouts
- `/components`: Reusable UI components
- `/constants`: Design tokens (Colors, Typography)
- `/lib`: Utilities (Database, Streak Logic, Achievements)
- `/types`: TypeScript interfaces

## 🎨 Design System

We follow a strict design system defined in `design-system.xml` and `constants/theme.ts`.
- **Primary Color**: Emerald (#10B981)
- **Typography**: Plus Jakarta Sans
- **Philosophy**: "Sophisticated Play" - Professional yet engaging.

## 🔒 Privacy

ExpenseFlow is designed to be completely private. No data is sent to external servers. Your financial data lives on your device.

## 📝 License

MIT
