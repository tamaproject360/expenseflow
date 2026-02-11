# ExpenseFlow

**Track Smarter. Spend Better.**

ExpenseFlow is a premium personal finance mobile app built with Expo and React Native. Designed to make expense tracking fast, intuitive, and enjoyable through mature gamification mechanics.

## Features

### Core Functionality
- **Quick Expense Logging**: Add expenses in under 5 seconds
- **Smart Analytics**: Beautiful insights and spending breakdowns
- **Budget Tracking**: Set and monitor monthly budgets
- **Streak System**: Build consistent tracking habits with daily streaks
- **Achievement Badges**: Unlock rewards for financial milestones
- **Multi-Currency Support**: Track expenses in your preferred currency

### User Experience
- **Sophisticated Design**: Clean, modern UI with Plus Jakarta Sans typography
- **Smooth Animations**: React Native Reanimated for 60fps interactions
- **One-Handed Operation**: Optimized for mobile-first usage
- **Pull-to-Refresh**: Real-time data updates
- **Responsive Layout**: Adapts to all screen sizes

## Tech Stack

### Frontend
- **Framework**: Expo SDK 54 with React Native 0.81
- **Navigation**: Expo Router v6
- **Animations**: React Native Reanimated v4
- **Icons**: Lucide React Native
- **Fonts**: Plus Jakarta Sans (Google Fonts)
- **Language**: TypeScript

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Row Level Security (RLS) enabled

### Design System
- **Color Palette**:
  - Primary: Emerald (#10B981)
  - Accent: Amber (#F59E0B)
  - Canvas: Soft Off-White (#F8FAFB)
  - Surface: Pure White (#FFFFFF)
- **Typography**: Plus Jakarta Sans (Regular, Medium, SemiBold, Bold)
- **Spacing**: 8px base system
- **Border Radius**: 12-24px for modern feel

## Project Structure

```
expenseflow/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── _layout.tsx          # Tab bar layout with FAB
│   │   ├── index.tsx            # Home dashboard
│   │   ├── stats.tsx            # Statistics screen
│   │   ├── goals.tsx            # Budget goals screen
│   │   ├── add.tsx              # Add expense (placeholder)
│   │   └── profile.tsx          # Profile & settings
│   ├── _layout.tsx              # Root layout with font loading
│   ├── index.tsx                # Entry point with auth check
│   ├── splash.tsx               # Animated splash screen
│   ├── onboarding.tsx           # 3-slide onboarding flow
│   ├── auth.tsx                 # Login/signup screen
│   └── +not-found.tsx           # 404 screen
├── components/                   # Reusable components
│   └── Card.tsx                 # Card component with shadow
├── constants/                    # Design system constants
│   └── theme.ts                 # Colors, typography, spacing
├── lib/                         # Core utilities
│   └── supabase.ts              # Supabase client setup
├── types/                       # TypeScript definitions
│   └── database.ts              # Database schema types
├── hooks/                       # Custom React hooks
│   └── useFrameworkReady.ts     # Framework initialization
└── assets/                      # Static assets
    └── images/                  # App icons and images
```

## Database Schema

### Tables

**user_settings**
- User profiles and preferences
- Currency settings
- Daily reminder configuration
- Streak tracking (current & longest)

**categories**
- Expense categories with emojis
- Color-coded for visual distinction
- Sortable order

**expenses**
- Transaction records
- Amount, date, note
- Category association
- User ownership

**budgets**
- Monthly budget limits
- Category-specific budgets
- Period tracking

**achievement_definitions**
- Achievement templates
- Requirement types and values
- Badge icons and descriptions

**user_achievements**
- Unlocked achievements per user
- Progress tracking
- Earned timestamps

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account

### Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/expenseflow.git
cd expenseflow
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project
   - Run the database migrations (see Database Setup)
   - Add environment variables to `.env`

4. Start the development server:
```bash
npm run dev
```

### Database Setup

The database schema is already set up in your Supabase project with:
- Row Level Security (RLS) enabled on all tables
- Proper policies for authenticated users
- Default achievements pre-populated
- Indexes for optimal query performance

## Available Scripts

- `npm run dev` - Start Expo development server
- `npm run build:web` - Build for web deployment
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Design Philosophy

ExpenseFlow follows a "Sophisticated Play" design philosophy:

1. **Speed-First Input**: Primary actions completable in under 5 seconds
2. **Visual Motivation**: Beautiful data visualization that tells a story
3. **Frictionless Habit Formation**: Streak mechanics and achievements create positive feedback loops

### Key Principles
- No desktop-first logic
- Touch-optimized (44x44px minimum touch targets)
- One-handed operation (bottom 60% screen priority)
- Mature gamification (not childish)
- High contrast for accessibility (WCAG AA)

## User Flow

1. **Splash Screen** → Animated brand intro (1.5s)
2. **Onboarding** → 3 swipeable slides explaining core features
3. **Authentication** → Email/password signup/login
4. **Home Dashboard** → Spending overview, streaks, recent transactions
5. **Quick Add** → FAB opens bottom sheet for instant expense logging
6. **Analytics** → Visual breakdowns by category and time period
7. **Goals** → Budget tracking with progress indicators
8. **Profile** → Settings, currency, reminders, export data

## Security

- All data protected by Supabase Row Level Security (RLS)
- Users can only access their own data
- Secure authentication with Supabase Auth
- Environment variables for sensitive keys
- No client-side secrets exposure

## Performance

- 60fps animations with native thread execution
- Optimized list rendering with FlatList virtualization
- Lazy loading for images and data
- Pull-to-refresh for manual updates
- Efficient database queries with proper indexing

## Credits

**Made with ❤️ by tamadev © 2025**

## License

This project is proprietary software. All rights reserved.

## Support

For issues or questions, please contact support or open an issue on the repository.

---

**ExpenseFlow** - Track Smarter. Spend Better.
