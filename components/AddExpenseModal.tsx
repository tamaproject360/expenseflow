import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Vibration,
  Platform,
  Animated,
  Alert
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { X, Calendar, Delete } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { openDatabase } from '@/lib/db';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '@/types/database';
import { checkAndUpdateStreak } from '@/lib/streaks';
import { checkAchievements } from '@/lib/achievements';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

const { width, height } = Dimensions.get('window');

export default function AddExpenseModal({ visible, onClose, onSave }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      loadCategories();
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 90,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          useNativeDriver: true,
        })
      ]).start();
      setAmount('0');
      setNote('');
      setDate(new Date());
      setSelectedCategory(null);
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const loadCategories = async () => {
    try {
      const db = await openDatabase();
      const cats = await db.getAllAsync<Category>('SELECT * FROM categories ORDER BY sort_order ASC');
      setCategories(cats);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const handleNumberPress = (num: string) => {
    Vibration.vibrate(10); // Light haptic
    if (amount === '0') {
      setAmount(num);
    } else if (amount.length < 9) {
      setAmount(amount + num);
    }
  };

  const handleDelete = () => {
    Vibration.vibrate(10);
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Shake animation could go here
      return;
    }

    try {
      setLoading(true);
      const db = await openDatabase();
      const userId = await AsyncStorage.getItem('user_id');
      
      if (!userId) {
        setLoading(false);
        return;
      }

      await db.runAsync(
        'INSERT INTO expenses (id, user_id, category_id, amount, note, expense_date) VALUES (?, ?, ?, ?, ?, ?)',
        Crypto.randomUUID(),
        userId,
        selectedCategory,
        parseFloat(amount),
        note,
        date.toISOString().split('T')[0] // Store as YYYY-MM-DD
      );

      // Update Streak
      await checkAndUpdateStreak();
      
      // Check Achievements
      const unlocked = await checkAchievements();
      if (unlocked.length > 0) {
        Alert.alert('Achievement Unlocked! 🏆', `You've earned: ${unlocked.join(', ')}`);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSave();
      onClose();
      
      // Reset form
      setAmount('');
      setNote('');
      setDate(new Date());
      setSelectedCategory(categories[0]?.id || '');
      
    } catch (error) {
      console.error(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />
        
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={onClose} 
            style={styles.closeButton}
            accessibilityLabel="Close modal"
            accessibilityRole="button"
            accessibilityHint="Closes the expense entry screen"
          >
            <X size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.title} accessibilityRole="header">New Expense</Text>
          <View style={{ width: 40 }} /> 
        </View>

        {/* Amount Display */}
        <View 
          style={styles.amountContainer}
          accessibilityLabel={`Current amount: ${amount} Rupiah`}
          accessibilityRole="adjustable"
        >
          <Text style={styles.currencySymbol}>Rp</Text>
          <Text style={styles.amountText}>
            {new Intl.NumberFormat('id-ID').format(parseInt(amount))}
          </Text>
        </View>

        {/* Category Selector */}
        <View style={styles.categoryContainer}>
          <Text style={styles.sectionLabel} accessibilityRole="header">CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && { backgroundColor: cat.color, borderColor: cat.color }
                ]}
                onPress={() => {
                  setSelectedCategory(cat.id);
                  Vibration.vibrate(5);
                }}
                accessibilityLabel={`${cat.name} category`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedCategory === cat.id }}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === cat.id && { color: '#FFF' }
                ]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Note Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note..."
            placeholderTextColor={Colors.textSecondary}
            value={note}
            onChangeText={setNote}
            accessibilityLabel="Expense note"
            accessibilityHint="Optional description for this expense"
          />
        </View>

        {/* Numeric Keypad */}
        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.key}
              onPress={() => handleNumberPress(num.toString())}
              accessibilityLabel={num.toString()}
              accessibilityRole="button"
            >
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={styles.key} 
            onPress={() => setShowDatePicker(true)}
            accessibilityLabel="Change date"
            accessibilityRole="button"
          >
            <Calendar size={24} color={Colors.textSecondary} />
            {date.toDateString() !== new Date().toDateString() && (
              <View style={styles.dateBadge} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.key} 
            onPress={() => handleNumberPress('0')}
            accessibilityLabel="0"
            accessibilityRole="button"
          >
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.key} 
            onPress={handleDelete}
            accessibilityLabel="Delete last digit"
            accessibilityRole="button"
          >
            <Delete size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedCategory || amount === '0' || loading) && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={!selectedCategory || amount === '0' || loading}
            accessibilityLabel="Save Expense"
            accessibilityRole="button"
            accessibilityState={{ disabled: !selectedCategory || amount === '0' || loading }}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : `Save for ${date.toLocaleDateString()}`}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.85,
    ...Shadow.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  amountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: Spacing.xl,
  },
  currencySymbol: {
    ...Typography.h2,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
    fontSize: 24,
  },
  amountText: {
    ...Typography.h1,
    fontSize: 48,
    color: Colors.textPrimary,
  },
  categoryContainer: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    ...Typography.caption,
    marginLeft: Spacing.lg,
    marginBottom: Spacing.sm,
    color: Colors.textSecondary,
  },
  categoryList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryName: {
    ...Typography.body,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Medium',
    color: Colors.textPrimary,
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  noteInput: {
    ...Typography.body,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    color: Colors.textPrimary,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
  },
  key: {
    width: '30%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  keyText: {
    ...Typography.h2,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    right: '30%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  footer: {
    padding: Spacing.lg,

    marginTop: 'auto',
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.primary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  saveButtonText: {
    ...Typography.button,
    color: '#FFF',
    fontSize: 16,
  },
});
