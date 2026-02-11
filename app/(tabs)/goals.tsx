import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { Card } from '@/components/Card';
import { openDatabase } from '@/lib/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, Budget } from '@/types/database';
import { Plus, AlertTriangle, X } from 'lucide-react-native';
import * as Crypto from 'expo-crypto';

const { width } = Dimensions.get('window');

interface BudgetWithMeta extends Budget {
  category_name?: string;
  category_emoji?: string;
  category_color?: string;
  spent: number;
  percentage: number;
}

export default function GoalsScreen() {
  const [budgets, setBudgets] = useState<BudgetWithMeta[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
      loadCategories();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, [])
  );

  const loadCategories = async () => {
    const db = await openDatabase();
    const cats = await db.getAllAsync<Category>('SELECT * FROM categories');
    setCategories(cats);
  };

  const loadBudgets = async () => {
    try {
      const db = await openDatabase();
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) return;

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      const budgetsData = await db.getAllAsync<Budget>(
        'SELECT * FROM budgets WHERE user_id = ? AND month = ?',
        [userId, currentMonth]
      );

      const expensesData = await db.getAllAsync<{ category_id: string; total: number }>(
        `SELECT category_id, SUM(amount) as total 
         FROM expenses 
         WHERE user_id = ? AND expense_date LIKE ? 
         GROUP BY category_id`,
        [userId, `${currentMonth}%`]
      );

      const spendingMap = new Map<string, number>();
      let overallSpent = 0;
      expensesData.forEach(e => {
        spendingMap.set(e.category_id, e.total);
        overallSpent += e.total;
      });
      setTotalSpent(overallSpent);

      const cats = await db.getAllAsync<Category>('SELECT * FROM categories');
      const catMap = new Map(cats.map(c => [c.id, c]));

      let overallBudget = 0;
      
      const processedBudgets: BudgetWithMeta[] = budgetsData.map(b => {
        if (!b.category_id) {
            overallBudget += b.amount;
            return {
                ...b,
                spent: overallSpent,
                percentage: Math.min((overallSpent / b.amount) * 100, 100)
            };
        }

        const cat = catMap.get(b.category_id);
        const spent = spendingMap.get(b.category_id) || 0;
        
        return {
          ...b,
          category_name: cat?.name || 'Unknown',
          category_emoji: cat?.emoji || '❓',
          category_color: cat?.color || Colors.textSecondary,
          spent,
          percentage: Math.min((spent / b.amount) * 100, 100)
        };
      });

      const globalBudgetObj = processedBudgets.find(b => !b.category_id);
      
      if (globalBudgetObj) {
          setTotalBudget(globalBudgetObj.amount);
      } else {
          setTotalBudget(0);
      }

      setBudgets(processedBudgets.filter(b => b.category_id));

    } catch (e) {
      console.error('Error loading budgets', e);
    }
  };

  const handleSaveBudget = async () => {
    if (!newBudgetAmount || !selectedCategory) {
        Alert.alert('Error', 'Please select a category and enter an amount');
        return;
    }

    try {
        const db = await openDatabase();
        const userId = await AsyncStorage.getItem('user_id');
        const currentMonth = new Date().toISOString().slice(0, 7);

        const existing = await db.getFirstAsync(
            'SELECT id FROM budgets WHERE user_id = ? AND category_id = ? AND month = ?',
            [userId, selectedCategory, currentMonth]
        );

        if (existing) {
            await db.runAsync(
                'UPDATE budgets SET amount = ? WHERE user_id = ? AND category_id = ? AND month = ?',
                parseFloat(newBudgetAmount), userId, selectedCategory, currentMonth
            );
        } else {
            await db.runAsync(
                'INSERT INTO budgets (id, user_id, category_id, amount, month) VALUES (?, ?, ?, ?, ?)',
                Crypto.randomUUID(), userId, selectedCategory, parseFloat(newBudgetAmount), currentMonth
            );
        }

        setShowAddModal(false);
        setNewBudgetAmount('');
        setSelectedCategory(null);
        loadBudgets();
    } catch (e) {
        Alert.alert('Error', 'Failed to save budget');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return Colors.danger;
    if (percentage >= 80) return Colors.accent;
    return Colors.primary;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Budget Goals</Text>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
            <Card style={styles.heroCard}>
                <View style={styles.heroHeader}>
                    <Text style={styles.heroLabel}>Total Spending</Text>
                    <Text style={[styles.heroValue, { color: totalSpent > totalBudget && totalBudget > 0 ? Colors.danger : Colors.textPrimary }]}>
                        {formatCurrency(totalSpent)}
                        <Text style={styles.heroTarget}> / {totalBudget > 0 ? formatCurrency(totalBudget) : 'No limit'}</Text>
                    </Text>
                </View>
                
                {totalBudget > 0 && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBarBg}>
                            <View 
                                style={[
                                    styles.progressBarFill, 
                                    { 
                                        width: `${Math.min((totalSpent/totalBudget)*100, 100)}%`,
                                        backgroundColor: getProgressColor((totalSpent/totalBudget)*100)
                                    }
                                ]} 
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {((totalSpent/totalBudget)*100).toFixed(0)}% used
                        </Text>
                    </View>
                )}

                {totalSpent > totalBudget && totalBudget > 0 && (
                    <View style={styles.warningBox}>
                        <AlertTriangle size={16} color={Colors.danger} />
                        <Text style={styles.warningText}>You've exceeded your monthly budget!</Text>
                    </View>
                )}
            </Card>
        </Animated.View>

        <View style={styles.listContainer}>
            <View style={styles.listHeader}>
                <Text style={styles.sectionTitle}>Category Budgets</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
                    <Plus size={20} color={Colors.primary} />
                    <Text style={styles.addButtonText}>Set Budget</Text>
                </TouchableOpacity>
            </View>

            {budgets.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No category budgets set yet.</Text>
                </View>
            ) : (
                budgets.map((budget, index) => (
                    <Animated.View key={budget.id} style={{ opacity: fadeAnim }}>
                        <Card style={styles.budgetCard}>
                            <View style={styles.budgetHeader}>
                                <View style={styles.catInfo}>
                                    <View style={[styles.emojiBg, { backgroundColor: budget.category_color + '20' }]}>
                                        <Text>{budget.category_emoji}</Text>
                                    </View>
                                    <Text style={styles.catName}>{budget.category_name}</Text>
                                </View>
                                <Text style={styles.budgetValues}>
                                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                                </Text>
                            </View>
                            <View style={styles.miniProgressBg}>
                                <View 
                                    style={[
                                        styles.miniProgressFill, 
                                        { 
                                            width: `${budget.percentage}%`,
                                            backgroundColor: getProgressColor(budget.percentage)
                                        }
                                    ]} 
                                />
                            </View>
                        </Card>
                    </Animated.View>
                ))
            )}
        </View>

        <View style={{height: 100}} />
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
              <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Set Category Budget</Text>
                      <TouchableOpacity onPress={() => setShowAddModal(false)}>
                          <X color={Colors.textSecondary} />
                      </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.label}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                      {categories.map(cat => (
                          <TouchableOpacity 
                            key={cat.id}
                            style={[
                                styles.catChip,
                                selectedCategory === cat.id && { backgroundColor: cat.color, borderColor: cat.color }
                            ]}
                            onPress={() => setSelectedCategory(cat.id)}
                          >
                              <Text>{cat.emoji} {cat.name}</Text>
                          </TouchableOpacity>
                      ))}
                  </ScrollView>

                  <Text style={styles.label}>Monthly Limit</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="e.g. 1000000"
                    keyboardType="numeric"
                    value={newBudgetAmount}
                    onChangeText={setNewBudgetAmount}
                  />

                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveBudget}>
                      <Text style={styles.saveButtonText}>Save Goal</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

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
  heroCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  heroHeader: {
    marginBottom: Spacing.md,
  },
  heroLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  heroValue: {
    ...Typography.h2,
    fontSize: 28,
  },
  heroTarget: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: Spacing.sm,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    ...Typography.caption,
    textAlign: 'right',
    marginTop: 4,
    color: Colors.textSecondary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    backgroundColor: '#FEF2F2',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: 8,
  },
  warningText: {
    ...Typography.caption,
    color: Colors.danger,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    ...Typography.button,
    color: Colors.primary,
    fontSize: 14,
  },
  budgetCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  catInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emojiBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    ...Typography.body,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  budgetValues: {
    ...Typography.caption,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  miniProgressBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h3,
  },
  label: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
    color: Colors.textSecondary,
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    height: 50,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    height: 40,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    marginBottom: Spacing.xl,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontFamily: 'PlusJakartaSans-Bold',
  }
});
