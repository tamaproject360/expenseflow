import * as SQLite from 'expo-sqlite';
import { type SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'expenseflow.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  return dbInstance;
}

export async function initDatabase() {
  const db = await openDatabase();
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY NOT NULL,
      pin_hash TEXT, -- Storing hashed PIN (simple hash for local offline)
      display_name TEXT DEFAULT 'User',
      currency TEXT DEFAULT 'IDR',
      daily_reminder_enabled INTEGER DEFAULT 0,
      daily_reminder_time TEXT,
      biometric_enabled INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_logged_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      color TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      amount REAL NOT NULL,
      note TEXT,
      expense_date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      category_id TEXT,
      amount REAL NOT NULL,
      month TEXT NOT NULL, -- Format: YYYY-MM
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS achievement_definitions (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      badge_icon TEXT NOT NULL,
      requirement_type TEXT NOT NULL,
      requirement_value INTEGER NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      achievement_id TEXT NOT NULL,
      earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
      progress INTEGER DEFAULT 0,
      FOREIGN KEY (achievement_id) REFERENCES achievement_definitions (id) ON DELETE CASCADE
    );
  `);

  // Seed default categories if empty
  const categoryCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
  if (categoryCount && categoryCount.count === 0) {
    await seedCategories(db);
  }
}

async function seedCategories(db: SQLiteDatabase) {
  const categories = [
    { id: '1', name: 'Food', emoji: '🍔', color: '#EF4444', sort_order: 1 },
    { id: '2', name: 'Transport', emoji: '🚗', color: '#3B82F6', sort_order: 2 },
    { id: '3', name: 'Shopping', emoji: '🛒', color: '#EC4899', sort_order: 3 },
    { id: '4', name: 'Entertainment', emoji: '🎮', color: '#8B5CF6', sort_order: 4 },
    { id: '5', name: 'Bills', emoji: '📱', color: '#F59E0B', sort_order: 5 },
    { id: '6', name: 'Health', emoji: '💊', color: '#10B981', sort_order: 6 },
    { id: '7', name: 'Education', emoji: '📚', color: '#6366F1', sort_order: 7 },
    { id: '8', name: 'Other', emoji: '✨', color: '#64748B', sort_order: 8 },
  ];

  for (const cat of categories) {
    await db.runAsync(
      'INSERT INTO categories (id, name, emoji, color, sort_order) VALUES (?, ?, ?, ?, ?)',
      cat.id, cat.name, cat.emoji, cat.color, cat.sort_order
    );
  }
}

// Helper to reset database (for development/debugging)
export async function resetDatabase() {
  const db = await openDatabase();
  await db.execAsync(`
    DROP TABLE IF EXISTS user_achievements;
    DROP TABLE IF EXISTS achievement_definitions;
    DROP TABLE IF EXISTS budgets;
    DROP TABLE IF EXISTS expenses;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS user_settings;
  `);
  await initDatabase();
}
