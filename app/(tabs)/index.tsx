import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useEffect, useState } from 'react';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/Card';
import { supabase } from '@/lib/supabase';
import { Expense, UserSettings } from '@/types/database';
import { TrendingDown, TrendingUp, Clock, Flame } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [todaySpent, setTodaySpent] = useState(0);
  const [weekSpent, setWeekSpent] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settings) {
        setUserSettings(settings);
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('expense_date', startOfMonth.toISOString().split('T')[0])
        .order('expense_date', { ascending: false })
        .limit(5);

      if (expensesData) {
        setExpenses(expensesData);

        const total = expensesData.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);
        setTotalSpent(total);

        const today = new Date().toISOString().split('T')[0];
        const todayTotal = expensesData
          .filter((exp) => exp.expense_date === today)
          .reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);
        setTodaySpent(todayTotal);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekTotal = expensesData
          .filter((exp) => new Date(exp.expense_date) >= weekAgo)
          .reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);
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
          <Animated.Text entering={FadeIn} style={styles.greeting}>
            {getGreeting()}, {userSettings?.display_name || 'User'} 👋
          </Animated.Text>
          <Text style={styles.month}>
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.metricsCard}>
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

        <Animated.View entering={FadeInDown.delay(200)} style={styles.quickStats}>
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
          <Animated.View entering={FadeInDown.delay(300)}>
            <TouchableOpacity activeOpacity={0.8}>
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

        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
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
                entering={FadeInDown.delay(500 + index * 50)}
                style={styles.transactionItem}
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
                  -{formatCurrency(parseFloat(expense.amount.toString()))}
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
