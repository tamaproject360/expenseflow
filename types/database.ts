export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  note?: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id?: string;
  amount: number;
  month: string;
  created_at: string;
  updated_at: string;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  requirement_type: 'streak' | 'transaction_count' | 'budget_success' | 'stats_view' | 'first_expense';
  requirement_value: number;
  sort_order: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress: number;
}

export interface UserSettings {
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  currency: string;
  daily_reminder_enabled: boolean; // stored as 0 or 1 in SQLite, converted to boolean in app
  daily_reminder_time: string;
  biometric_enabled: boolean; // stored as 0 or 1
  current_streak: number;
  longest_streak: number;
  last_logged_date?: string;
  created_at: string;
  updated_at: string;
}
