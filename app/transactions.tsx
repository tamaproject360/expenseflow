import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  SectionList,
  Alert,
  Animated,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { ArrowLeft, Search, Trash2, Filter, X } from 'lucide-react-native';
import { openDatabase } from '@/lib/db';
import { Expense, Category } from '@/types/database';
import * as Haptics from 'expo-haptics';

export default function TransactionsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Animation for entry
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const db = await openDatabase();
      
      // Load Categories
      const cats = await db.getAllAsync<Category>('SELECT * FROM categories ORDER BY sort_order');
      setCategories(cats);

      // Load Expenses
      // We load all for now, but in a real app we might paginate
      const result = await db.getAllAsync<Expense>(
        'SELECT * FROM expenses ORDER BY expense_date DESC, created_at DESC'
      );
      setExpenses(result);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to remove this expense?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const db = await openDatabase();
              await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
              
              // Remove from local state immediately
              setExpenses(prev => prev.filter(e => e.id !== id));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Failed to delete expense");
            }
          }
        }
      ]
    );
  };

  const getFilteredSections = () => {
    let filtered = expenses;

    // Apply Category Filter
    if (selectedCategory) {
      filtered = filtered.filter(e => e.category_id === selectedCategory);
    }

    // Apply Search Filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        (e.note && e.note.toLowerCase().includes(lowerQuery)) ||
        e.amount.toString().includes(lowerQuery)
      );
    }

    // Group by Date
    const grouped: { title: string; data: Expense[] }[] = [];
    
    filtered.forEach(expense => {
      const date = new Date(expense.expense_date);
      const title = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      const existingSection = grouped.find(section => section.title === title);
      if (existingSection) {
        existingSection.data.push(expense);
      } else {
        grouped.push({ title, data: [expense] });
      }
    });

    return grouped;
  };

  const getCategoryEmoji = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.emoji : '💰';
  };
  
  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Expense';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onLongPress={() => deleteExpense(item.id)}
      style={styles.transactionItem}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.emoji}>{getCategoryEmoji(item.category_id)}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.note} numberOfLines={1}>
          {item.note || getCategoryName(item.category_id)}
        </Text>
        <Text style={styles.categoryLabel}>{getCategoryName(item.category_id)}</Text>
      </View>
      <Text style={styles.amount}>-{formatCurrency(item.amount)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft color={Colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Transactions</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color={Colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes or amounts..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X color={Colors.textSecondary} size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          data={[{ id: 'all', name: 'All', emoji: '🔍' }, ...categories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id || (item.id === 'all' && selectedCategory === null);
            return (
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive
                ]}
                onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedCategory(item.id === 'all' ? null : item.id);
                }}
              >
                <Text style={[
                  styles.categoryPillText,
                  isSelected && styles.categoryPillTextActive
                ]}>
                  {item.emoji} {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <SectionList
                sections={getFilteredSections()}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>{title}</Text>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Filter color={Colors.textSecondary} size={48} />
                        <Text style={styles.emptyText}>No transactions found</Text>
                        <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                    </View>
                }
                stickySectionHeadersEnabled={false}
            />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  filtersContainer: {
    marginBottom: Spacing.md,
  },
  categoriesList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    ...Typography.caption,
    fontFamily: 'PlusJakartaSans-Medium',
    color: Colors.textSecondary,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sectionHeader: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionHeaderText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  emoji: {
    fontSize: 20,
  },
  detailsContainer: {
    flex: 1,
  },
  note: {
    ...Typography.body,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: Colors.textPrimary,
  },
  categoryLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  amount: {
    ...Typography.body,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: Colors.danger,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    ...Typography.h2,
    marginTop: Spacing.md,
    color: Colors.textPrimary,
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
