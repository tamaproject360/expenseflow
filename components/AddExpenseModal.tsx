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
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { X, Calendar, Delete } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { openDatabase } from '@/lib/db';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '@/types/database';

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
        })
      ]).start();
      setAmount('0');
      setNote('');
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
    if (!selectedCategory || amount === '0') return;
    
    setLoading(true);
    Vibration.vibrate(20); // Medium haptic for success
    
    try {
      const db = await openDatabase();
      const userId = await AsyncStorage.getItem('user_id');
      
      if (!userId) throw new Error('No user found');

      const now = new Date().toISOString();
      
      await db.runAsync(
        `INSERT INTO expenses (id, user_id, category_id, amount, note, expense_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        Crypto.randomUUID(),
        userId,
        selectedCategory,
        parseFloat(amount),
        note,
        now.split('T')[0], // YYYY-MM-DD
        now,
        now
      );

      // Update streak if needed (simplified logic)
      const today = now.split('T')[0];
      await db.runAsync(
        `UPDATE user_settings 
         SET last_logged_date = ?, 
             current_streak = CASE WHEN last_logged_date = date(?, '-1 day') THEN current_streak + 1 ELSE current_streak END
         WHERE user_id = ?`,
        today, today, userId
      );

      // Reset and close
      onSave();
      onClose();
      
    } catch (e) {
      console.error('Failed to save expense', e);
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.title}>New Expense</Text>
          <View style={{ width: 40 }} /> 
        </View>

        {/* Amount Display */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>Rp</Text>
          <Text style={styles.amountText}>
            {new Intl.NumberFormat('id-ID').format(parseInt(amount))}
          </Text>
        </View>

        {/* Category Selector */}
        <View style={styles.categoryContainer}>
          <Text style={styles.sectionLabel}>CATEGORY</Text>
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
          />
        </View>

        {/* Numeric Keypad */}
        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.key}
              onPress={() => handleNumberPress(num.toString())}
            >
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.key} onPress={() => {/* Date picker logic */}}>
            <Calendar size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handleNumberPress('0')}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={handleDelete}>
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
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Expense'}
            </Text>
          </TouchableOpacity>
        </View>

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
