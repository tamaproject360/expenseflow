import { openDatabase } from './db';
import { UserSettings } from '@/types/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export async function checkAndUpdateStreak() {
  const userId = await AsyncStorage.getItem('user_id');
  if (!userId) return;

  const db = await openDatabase();
  
  // Get current settings
  const settings = await db.getFirstAsync<UserSettings>(
    'SELECT * FROM user_settings WHERE user_id = ?', 
    [userId]
  );

  if (!settings) return;

  const today = new Date().toISOString().split('T')[0];
  const lastLogged = settings.last_logged_date;

  // If already logged today, do nothing
  if (lastLogged === today) return;

  // Calculate if yesterday was logged
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = 1;
  
  if (lastLogged === yesterdayStr) {
    // Continued streak
    newStreak = settings.current_streak + 1;
  } else if (!lastLogged) {
    // First time
    newStreak = 1;
  } else {
    // Streak broken (gap > 1 day)
    newStreak = 1;
  }

  // Update longest streak if needed
  const newLongest = Math.max(newStreak, settings.longest_streak);

  // Update DB
  await db.runAsync(
    'UPDATE user_settings SET current_streak = ?, longest_streak = ?, last_logged_date = ? WHERE user_id = ?',
    newStreak, newLongest, today, userId
  );

  // If streak increased, give feedback
  if (newStreak > 1 && newStreak > settings.current_streak) {
    // We could return a value here to trigger UI, but for now we just update DB
    // The UI will reflect this on next load
  }
}
