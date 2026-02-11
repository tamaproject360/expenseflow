import { openDatabase } from './db';
import { AchievementDefinition, UserAchievement } from '@/types/database';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export const ACHIEVEMENT_KEYS = {
  FIRST_STEP: 'first_step',
  WEEK_WARRIOR: 'week_warrior',
  CONSISTENCY_KING: 'consistency_king',
  CENTURY_CLUB: 'century_club',
  BUDGET_MASTER: 'budget_master',
};

// Seed definitions if they don't exist
export async function seedAchievements() {
  const db = await openDatabase();
  const count = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM achievement_definitions');
  
  if (count && count.count === 0) {
    const definitions = [
      {
        id: ACHIEVEMENT_KEYS.FIRST_STEP,
        name: 'First Step',
        description: 'Log your very first expense',
        badge_icon: '🚀',
        requirement_type: 'transaction_count',
        requirement_value: 1,
        sort_order: 1
      },
      {
        id: ACHIEVEMENT_KEYS.WEEK_WARRIOR,
        name: 'Week Warrior',
        description: 'Reach a 7-day streak',
        badge_icon: '🔥',
        requirement_type: 'streak',
        requirement_value: 7,
        sort_order: 2
      },
      {
        id: ACHIEVEMENT_KEYS.CONSISTENCY_KING,
        name: 'Consistency King',
        description: 'Reach a 30-day streak',
        badge_icon: '👑',
        requirement_type: 'streak',
        requirement_value: 30,
        sort_order: 3
      },
      {
        id: ACHIEVEMENT_KEYS.CENTURY_CLUB,
        name: 'Century Club',
        description: 'Log 100 total expenses',
        badge_icon: '💯',
        requirement_type: 'transaction_count',
        requirement_value: 100,
        sort_order: 4
      },
      {
        id: ACHIEVEMENT_KEYS.BUDGET_MASTER,
        name: 'Budget Master',
        description: 'Stay under budget for a month',
        badge_icon: '🛡️',
        requirement_type: 'budget_success',
        requirement_value: 1,
        sort_order: 5
      }
    ];

    for (const def of definitions) {
      await db.runAsync(
        `INSERT INTO achievement_definitions (id, name, description, badge_icon, requirement_type, requirement_value, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        def.id, def.name, def.description, def.badge_icon, def.requirement_type, def.requirement_value, def.sort_order
      );
    }
  }
}

export async function checkAchievements() {
  const db = await openDatabase();
  const userId = await AsyncStorage.getItem('user_id');
  if (!userId) return [];

  const newUnlocks: string[] = [];
  const now = new Date().toISOString();

  // Get current stats
  const settings = await db.getFirstAsync<{ current_streak: number }>('SELECT current_streak FROM user_settings WHERE user_id = ?', [userId]);
  const expensesCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM expenses WHERE user_id = ?', [userId]);
  
  const currentStreak = settings?.current_streak || 0;
  const totalExpenses = expensesCount?.count || 0;

  // Get all definitions
  const definitions = await db.getAllAsync<AchievementDefinition>('SELECT * FROM achievement_definitions');
  
  // Get earned achievements
  const earned = await db.getAllAsync<UserAchievement>('SELECT * FROM user_achievements WHERE user_id = ?', [userId]);
  const earnedIds = new Set(earned.map(e => e.achievement_id));

  for (const def of definitions) {
    if (earnedIds.has(def.id)) continue;

    let unlocked = false;

    switch (def.requirement_type) {
      case 'streak':
        if (currentStreak >= def.requirement_value) unlocked = true;
        break;
      case 'transaction_count':
        if (totalExpenses >= def.requirement_value) unlocked = true;
        break;
      // 'budget_success' would need more complex logic checking past months
    }

    if (unlocked) {
      await db.runAsync(
        'INSERT INTO user_achievements (id, user_id, achievement_id, earned_at, progress) VALUES (?, ?, ?, ?, ?)',
        Crypto.randomUUID(), userId, def.id, now, 100
      );
      newUnlocks.push(def.name);
      
      // Success Haptics
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  return newUnlocks;
}