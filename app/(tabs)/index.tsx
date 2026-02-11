import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { openDatabase } from '@/lib/db';
import { Expense, UserSettings } from '@/types/database';
import { TrendingDown, TrendingUp, Clock, Flame } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [todaySpent, setTodaySpent] = useState(0);
  const [weekSpent, setWeekSpent] = useState(0);

  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useFocusEffect(
    useCallback(() => {
      loadData();
      // Start entry animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    }, [])
  );

  const loadData = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) return;

      const db = await openDatabase();

      // Fetch User Settings
      const settings = await db.getFirstAsync<UserSettings>(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [userId]
      );

      if (settings) {
        setUserSettings(settings);
      }

      // Calculate dates
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

      // Fetch Expenses
      const expensesData = await db.getAllAsync<Expense>(
        'SELECT * FROM expenses WHERE user_id = ? AND expense_date >= ? ORDER BY expense_date DESC LIMIT 5',
        [userId, startOfMonthStr]
      );

      const allMonthExpenses = await db.getAllAsync<Expense>(
         'SELECT amount, expense_date FROM expenses WHERE user_id = ? AND expense_date >= ?',
         [userId, startOfMonthStr]
      );

      if (allMonthExpenses) {
        setExpenses(expensesData);

        const total = allMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        setTotalSpent(total);

        const today = new Date().toISOString().split('T')[0];
        const todayTotal = allMonthExpenses
          .filter((exp) => exp.expense_date === today)
          .reduce((sum, exp) => sum + exp.amount, 0);
        setTodaySpent(todayTotal);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekTotal = allMonthExpenses
          .filter((exp) => new Date(exp.expense_date) >= weekAgo)
          .reduce((sum, exp) => sum + exp.amount, 0);
        setWeekSpent(weekTotal);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: userSettings?.currency || 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Animated.Text style={[styles.greeting, { opacity: fadeAnim }]}>
            {getGreeting()}, {userSettings?.display_name || 'User'} 👋
          </Animated.Text>
          <Text style={styles.month}>
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        <Animated.View style={[styles.metricsCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Card>
            <Text style={styles.metricLabel}>Total Spending This Month</Text>
            <Text style={styles.metricValue}>{formatCurrency(totalSpent)}</Text>
            <View style={styles.progressRing}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: '65%' }]} />
              </View>
              <Text style={styles.progressText}>65% of budget</Text>
            </View>
          </Card>
        </Animated.View>

        <Animated.View style={[styles.quickStats, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Card style={styles.statCard}>
            <Clock color={Colors.textSecondary} size={20} />
            <Text style={styles.statLabel}>Today</Text>
            <Text style={styles.statValue}>{formatCurrency(todaySpent)}</Text>
          </Card>
          <Card style={styles.statCard}>
            <TrendingUp color={Colors.textSecondary} size={20} />
            <Text style={styles.statLabel}>This Week</Text>
            <Text style={styles.statValue}>{formatCurrency(weekSpent)}</Text>
          </Card>
          <Card style={styles.statCard}>
            <TrendingDown color={Colors.textSecondary} size={20} />
            <Text style={styles.statLabel}>Top Category</Text>
            <Text style={styles.statValue}>Food</Text>
          </Card>
        </Animated.View>

        {userSettings && userSettings.current_streak > 0 && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => router.push('/achievements')}
            >
              <Card style={styles.streakCard}>
                <Flame color={Colors.accent} size={24} />
                <View style={styles.streakContent}>
                  <Text style={styles.streakText}>
                    {userSettings.current_streak}-day streak! Keep it up!
                  </Text>
                  <Text style={styles.streakSubtext}>
                    Longest: {userSettings.longest_streak} days
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {expenses.length === 0 ? (
            <Card style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No expenses yet</Text>
              <Text style={styles.emptyStateSubtext}>Tap + to start tracking!</Text>
            </Card>
          ) : (
            expenses.map((expense, index) => (
              <Animated.View
                key={expense.id}
                style={[
                    styles.transactionItem,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
              >
                <View style={styles.transactionIcon}>
                  <Text style={styles.categoryEmoji}>🛒</Text>
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionNote}>{expense.note || 'Expense'}</Text>
                  <Text style={styles.transactionDate}>
                    {new Date(expense.expense_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <Text style={styles.transactionAmount}>
                  -{formatCurrency(expense.amount)}
                </Text>
              </Animated.View>
            ))
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
  },
  greeting: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  month: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  metricsCard: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  metricLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  metricValue: {
    ...Typography.bodyLarge,
    fontSize: 32,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  progressRing: {
    marginTop: Spacing.sm,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statValue: {
    ...Typography.caption,
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  streakCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
  },
  streakContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  streakText: {
    ...Typography.body,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: Colors.textPrimary,
  },
  streakSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  seeAll: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...Typography.body,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  transactionNote: {
    ...Typography.body,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: Colors.textPrimary,
  },
  transactionDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    ...Typography.body,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: Colors.danger,
  },
});
