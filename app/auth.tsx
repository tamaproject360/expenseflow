import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Vibration,
  Alert,
  Animated,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { openDatabase } from '@/lib/db';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Delete } from 'lucide-react-native';

export default function AuthScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSetup, setIsSetup] = useState(false); // Mode: Setup vs Login
  const [step, setStep] = useState<'enter' | 'confirm'>('enter'); // Setup steps
  const [loading, setLoading] = useState(true);
  
  // Animated value for shake
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const db = await openDatabase();
      // Check if any user exists
      const user = await db.getFirstAsync<{ user_id: string }>('SELECT user_id FROM user_settings LIMIT 1');
      
      if (user) {
        setIsSetup(false); // Login mode
        await AsyncStorage.setItem('user_id', user.user_id); // Ensure ID is in session
      } else {
        setIsSetup(true); // Setup mode
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (num: string) => {
    Vibration.vibrate(5);
    const currentInput = step === 'enter' ? pin : confirmPin;
    if (currentInput.length < 6) {
      const newVal = currentInput + num;
      if (step === 'enter') setPin(newVal);
      else setConfirmPin(newVal);
      
      // Auto submit on 6th digit
      if (newVal.length === 6) {
        setTimeout(() => handleSubmit(newVal), 100);
      }
    }
  };

  const handleDelete = () => {
    Vibration.vibrate(5);
    if (step === 'enter') {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
    Vibration.vibrate([0, 100, 50, 100]); // Error haptic pattern
  };

  const handleSubmit = async (code: string) => {
    const db = await openDatabase();

    if (isSetup) {
      if (step === 'enter') {
        // First entry done, move to confirm
        setStep('confirm');
        setConfirmPin('');
      } else {
        // Confirm step
        if (code === pin) {
          // Success! Create User
          try {
            const userId = Crypto.randomUUID();
            const now = new Date().toISOString();
            await db.runAsync(
              `INSERT INTO user_settings (
                user_id, pin_hash, display_name, currency, 
                daily_reminder_enabled, daily_reminder_time, 
                biometric_enabled, current_streak, longest_streak, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              userId, code, 'User', 'IDR', 1, '21:00:00', 0, 0, 0, now
            );
            await AsyncStorage.setItem('user_id', userId);
            router.replace('/(tabs)');
          } catch (e) {
            Alert.alert('Error', 'Failed to create account');
          }
        } else {
          // Mismatch
          triggerShake();
          Alert.alert('Error', 'PINs do not match. Try again.');
          setPin('');
          setConfirmPin('');
          setStep('enter');
        }
      }
    } else {
      // Login Mode
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) return; // Should handle edge case

      const user = await db.getFirstAsync<{ pin_hash: string }>(
        'SELECT pin_hash FROM user_settings WHERE user_id = ?',
        [userId]
      );

      if (user && user.pin_hash === code) {
        router.replace('/(tabs)');
      } else {
        triggerShake();
        setPin('');
      }
    }
  };

  const handleDemo = async () => {
    try {
        const { createDemoAccount } = require('@/lib/demo');
        await createDemoAccount();
        router.replace('/(tabs)');
    } catch (e) {
        console.error(e);
    }
  };

  const getTitle = () => {
    if (isSetup) {
      return step === 'enter' ? 'Create a PIN' : 'Confirm your PIN';
    }
    return 'Enter PIN';
  };

  const getSubtitle = () => {
    if (isSetup) {
      return 'Secure your offline data with a 6-digit code';
    }
    return 'Welcome back! Unlock your finances.';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🔒</Text>
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.subtitle}>{getSubtitle()}</Text>
        </View>

        <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
          {[...Array(6)].map((_, i) => {
            const currentVal = step === 'enter' ? pin : confirmPin;
            const filled = i < currentVal.length;
            return (
              <View key={i} style={[styles.dot, filled && styles.dotFilled]} />
            );
          })}
        </Animated.View>

        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.key}
              onPress={() => handlePress(num.toString())}
            >
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.key} onPress={handleDemo}>
             <Text style={styles.demoText}>Demo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={handleDelete}>
            <Delete size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginVertical: Spacing.xl,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.textSecondary,
  },
  dotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  key: {
    width: '30%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderRadius: 40,
  },
  keyText: {
    ...Typography.h1,
    fontSize: 32,
    color: Colors.textPrimary,
  },
  demoText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: 'bold',
  }
});
