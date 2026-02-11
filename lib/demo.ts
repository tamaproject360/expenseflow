import { openDatabase } from './db';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '@/types/database';

export async function createDemoAccount() {
  const db = await openDatabase();
  const demoId = 'demo-user-id';
  const demoPin = '123456';
  
  // 1. Create or Reset User Settings
  const now = new Date().toISOString();
  
  // Check if demo user exists, if so, delete data to reset
  await db.runAsync('DELETE FROM expenses WHERE user_id = ?', demoId);
  await db.runAsync('DELETE FROM budgets WHERE user_id = ?', demoId);
  await db.runAsync('DELETE FROM user_achievements WHERE user_id = ?', demoId);
  await db.runAsync('DELETE FROM user_settings WHERE user_id = ?', demoId);

  // Insert Demo User
  await db.runAsync(
    `INSERT INTO user_settings (
      user_id, pin_hash, display_name, currency, 
      daily_reminder_enabled, daily_reminder_time, 
      biometric_enabled, current_streak, longest_streak, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    demoId,
    demoPin,
    'Demo User',
    'IDR',
    1,
    '21:00:00',
    0,
    5, // Fake streak for demo
    12,
    now
  );

  // 2. Seed Expenses (Random data for last 30 days)
  const categories = await db.getAllAsync<Category>('SELECT * FROM categories');
  
  const expensesToInsert = [];
  const notes = ['Lunch', 'Taxi', 'Groceries', 'Coffee', 'Movie', 'Utility Bill', 'Subscription', 'Pharmacy'];
  
  // Generate ~30 expenses
  for (let i = 0; i < 30; i++) {
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    const randomAmount = (Math.floor(Math.random() * 50) + 1) * 10000; // 10k to 500k
    
    // Random date within last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const dateStr = date.toISOString().split('T')[0];

    await db.runAsync(
      `INSERT INTO expenses (id, user_id, category_id, amount, note, expense_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      Crypto.randomUUID(),
      demoId,
      randomCat.id,
      randomAmount,
      randomNote,
      dateStr,
      now,
      now
    );
  }

  // 3. Seed Budgets
  const monthlyBudget = 5000000; // 5 Million
  await db.runAsync(
    `INSERT INTO budgets (id, user_id, amount, month) VALUES (?, ?, ?, ?)`,
    Crypto.randomUUID(), demoId, monthlyBudget, new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  // Category Budgets (Food & Transport)
  const foodCat = categories.find(c => c.name === 'Food');
  if (foodCat) {
    await db.runAsync(
      `INSERT INTO budgets (id, user_id, category_id, amount, month) VALUES (?, ?, ?, ?, ?)`,
      Crypto.randomUUID(), demoId, foodCat.id, 2000000, new Date().toISOString().slice(0, 7)
    );
  }

  // 4. Set Session
  await AsyncStorage.setItem('user_id', demoId);
  return true;
}
