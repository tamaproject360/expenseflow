import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { Card } from '@/components/Card';
import { DonutChart } from '@/components/DonutChart';
import { openDatabase } from '@/lib/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, Expense } from '@/types/database';

const { width } = Dimensions.get('window');

type TimeRange = 'week' | 'month' | 'year';

export default function StatsScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [chartData, setChartData] = useState<{ key: string; value: number; color: string }[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<(Category & { total: number; percentage: number })[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      loadStats();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, [timeRange])
  );

  const loadStats = async () => {
    try {
      const db = await openDatabase();
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) return;

      // Calculate Date Range
      const now = new Date();
      let startDate = new Date();
      
      if (timeRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setDate(1); // First day of current month
      } else {
        startDate.setFullYear(now.getFullYear(), 0, 1); // Jan 1st
      }
      
      const startDateStr = startDate.toISOString().split('T')[0];

      // Get Expenses with Categories
      const query = `
        SELECT e.amount, c.name, c.color, c.emoji, c.id
        FROM expenses e
        JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = ? AND e.expense_date >= ?
      `;
      
      const results = await db.getAllAsync<{ amount: number; name: string; color: string; emoji: string; id: string }>(
        query, 
        [userId, startDateStr]
      );

      // Process Data
      const categoryMap = new Map<string, { total: number; color: string; emoji: string; name: string }>();
      let total = 0;

      results.forEach(item => {
        const current = categoryMap.get(item.id) || { total: 0, color: item.color, emoji: item.emoji, name: item.name };
        current.total += item.amount;
        categoryMap.set(item.id, current);
        total += item.amount;
      });

      setTotalSpent(total);

      // Format for Chart
      const chart = Array.from(categoryMap.entries()).map(([key, val]) => ({
        key,
        value: val.total,
        color: val.color
      })).sort((a, b) => b.value - a.value);

      setChartData(chart);

      // Format for List
      const breakdown = Array.from(categoryMap.entries()).map(([id, val]) => ({
        id,
        name: val.name,
        emoji: val.emoji,
        color: val.color,
        sort_order: 0, // not needed here
        created_at: '',
        total: val.total,
        percentage: total > 0 ? (val.total / total) * 100 : 0
      })).sort((a, b) => b.total - a.total);

      setCategoryBreakdown(breakdown);

    } catch (e) {
      console.error('Error loading stats', e);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Statistics</Text>
        </View>

        {/* Time Filter Segmented Control */}
        <View style={styles.filterContainer}>
          {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.filterButton, timeRange === range && styles.filterButtonActive]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[styles.filterText, timeRange === range && styles.filterTextActive]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Donut Chart Section */}
        <Animated.View style={[styles.chartContainer, { opacity: fadeAnim }]}>
           <DonutChart data={chartData} size={width * 0.6} />
        </Animated.View>

        {/* Category Breakdown */}
        <View style={styles.breakdownContainer}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          
          {categoryBreakdown.length === 0 ? (
             <Card style={styles.emptyState}>
                 <Text style={styles.emptyText}>No expenses for this period</Text>
             </Card>
          ) : (
            categoryBreakdown.map((item, index) => (
                <Animated.View 
                    key={item.id} 
                    style={[styles.breakdownItem, { opacity: fadeAnim }]}
                >
                <View style={styles.breakdownRow}>
                    <View style={styles.catInfo}>
                        <View style={[styles.iconPlaceholder, { backgroundColor: item.color + '20' }]}>
                            <Text>{item.emoji}</Text>
                        </View>
                        <Text style={styles.catName}>{item.name}</Text>
                    </View>
                    <View style={styles.amountInfo}>
                        <Text style={styles.amountText}>{formatCurrency(item.total)}</Text>
                        <Text style={styles.percentText}>{item.percentage.toFixed(1)}%</Text>
                    </View>
                </View>
                {/* Progress Bar */}
                <View style={styles.progressBarBg}>
                    <View 
                        style={[
                            styles.progressBarFill, 
                            { width: `${item.percentage}%`, backgroundColor: item.color }
                        ]} 
                    />
                </View>
                </Animated.View>
            ))
          )}
        </View>

        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 4,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    ...Typography.caption,
    fontFamily: 'PlusJakartaSans-Medium',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFF',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: 24,
    ...Shadow.sm,
  },
  breakdownContainer: {
    flex: 1,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 18,
    marginBottom: Spacing.md,
    color: Colors.textPrimary,
  },
  breakdownItem: {
    marginBottom: Spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  catName: {
    ...Typography.body,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  amountInfo: {
    alignItems: 'flex-end',
  },
  amountText: {
    ...Typography.body,
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
  },
  percentText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  }
});
