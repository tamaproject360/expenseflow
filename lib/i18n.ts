import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

const i18n = new I18n({
  en: {
    welcome: 'Hello',
    greeting: 'Good %{time}',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    totalSpending: 'Total Spending This Month',
    budgetUsed: '%{percent}% of budget',
    today: 'Today',
    thisWeek: 'This Week',
    topCategory: 'Top Category',
    recentTransactions: 'Recent Transactions',
    seeAll: 'See All',
    noExpenses: 'No expenses yet',
    tapToStart: 'Tap + to start tracking!',
    streak: '%{days}-day streak! Keep it up!',
    longest: 'Longest: %{days} days',
    profile: {
      title: 'Profile',
      preferences: 'PREFERENCES',
      currency: 'Currency',
      dailyReminder: 'Daily Reminder',
      darkMode: 'Dark Mode',
      data: 'DATA',
      export: 'Export Data (CSV)',
      reset: 'Reset Statistics',
      app: 'APP',
      about: 'About ExpenseFlow',
      privacy: 'Privacy Policy',
      signOut: 'Sign Out'
    }
  },
  id: {
    welcome: 'Halo',
    greeting: 'Selamat %{time}',
    morning: 'pagi',
    afternoon: 'siang',
    evening: 'malam',
    totalSpending: 'Total Pengeluaran Bulan Ini',
    budgetUsed: '%{percent}% dari anggaran',
    today: 'Hari Ini',
    thisWeek: 'Minggu Ini',
    topCategory: 'Kategori Teratas',
    recentTransactions: 'Transaksi Terakhir',
    seeAll: 'Lihat Semua',
    noExpenses: 'Belum ada pengeluaran',
    tapToStart: 'Ketuk + untuk mulai mencatat!',
    streak: 'Streak %{days} hari! Pertahankan!',
    longest: 'Terlama: %{days} hari',
    profile: {
      title: 'Profil',
      preferences: 'PREFERENSI',
      currency: 'Mata Uang',
      dailyReminder: 'Pengingat Harian',
      darkMode: 'Mode Gelap',
      data: 'DATA',
      export: 'Ekspor Data (CSV)',
      reset: 'Reset Statistik',
      app: 'APLIKASI',
      about: 'Tentang ExpenseFlow',
      privacy: 'Kebijakan Privasi',
      signOut: 'Keluar'
    }
  }
});

// Set the locale once at the beginning of your app.
i18n.locale = getLocales()[0].languageCode ?? 'en';
i18n.enableFallback = true;

export default i18n;
