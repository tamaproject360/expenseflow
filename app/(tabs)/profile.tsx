import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, Switch, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { User, Bell, Shield, Moon, Download, LogOut, ChevronRight, Info, Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openDatabase, resetDatabase } from '@/lib/db';
import { UserSettings, Expense, Category } from '@/types/database';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ProfileScreen() {
  const router = useRouter();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    const db = await openDatabase();
    const userId = await AsyncStorage.getItem('user_id');
    if (userId) {
      const settings = await db.getFirstAsync<UserSettings>('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
      if (settings) setUserSettings(settings);
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      const db = await openDatabase();
      const userId = await AsyncStorage.getItem('user_id');
      
      // Get all data
      const expenses = await db.getAllAsync<Expense>('SELECT * FROM expenses WHERE user_id = ? ORDER BY expense_date DESC', [userId]);
      const categories = await db.getAllAsync<Category>('SELECT * FROM categories');
      const catMap = new Map(categories.map(c => [c.id, c.name]));

      // Create CSV Header
      let csv = 'Date,Category,Amount,Note,ID\n';

      // Add Rows
      expenses.forEach(exp => {
        const catName = catMap.get(exp.category_id) || 'Unknown';
        const cleanNote = exp.note ? exp.note.replace(/,/g, ' ') : ''; // Basic CSV escaping
        csv += `${exp.expense_date},${catName},${exp.amount},${cleanNote},${exp.id}\n`;
      });

      // Save to file
      const fileName = `ExpenseFlow_Export_${new Date().toISOString().split('T')[0]}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, csv, { encoding: FileSystem.EncodingType.UTF8 });

      // Share
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        Alert.alert('Success', `File saved to ${filePath}`);
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReminders = async (value: boolean) => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Enable notifications in settings to use this feature.');
        return;
      }

      if (value) {
        // Schedule daily notification
        await Notifications.cancelAllScheduledNotificationsAsync();
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "📝 Track your spending!",
            body: "Don't forget to log your expenses for today.",
          },
          trigger: {
            hour: 21, // 9 PM
            minute: 0,
            repeats: true,
          } as any,
        });
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }

      // Update DB
      const db = await openDatabase();
      const userId = await AsyncStorage.getItem('user_id');
      await db.runAsync(
        'UPDATE user_settings SET daily_reminder_enabled = ? WHERE user_id = ?',
        value ? 1 : 0,
        userId
      );
      
      // Update local state
      if (userSettings) {
        setUserSettings({ ...userSettings, daily_reminder_enabled: value });
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update reminder settings');
    }
  };


  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Sign Out', 
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('user_id');
          router.replace('/auth');
        }
      }
    ]);
  };

  const handleResetData = async () => {
    Alert.alert('Reset All Data', 'This will delete all your expenses, budgets, and achievements. This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Reset', 
        style: 'destructive',
        onPress: async () => {
          await resetDatabase();
          // Optionally re-login or reload
          Alert.alert('Success', 'Data has been reset.');
          loadProfile();
        }
      }
    ]);
  };

  const SettingItem = ({ icon: Icon, label, value, onPress, isDestructive = false, showChevron = true, trailing }: any) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={onPress} 
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.iconBox, isDestructive && styles.iconDestructive]}>
        <Icon size={20} color={isDestructive ? Colors.danger : Colors.primary} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemLabel, isDestructive && styles.textDestructive]}>{label}</Text>
        {value && <Text style={styles.itemValue}>{value}</Text>}
      </View>
      {trailing}
      {showChevron && !trailing && <ChevronRight size={20} color={Colors.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
             <Text style={styles.avatarText}>
                {userSettings?.display_name?.charAt(0).toUpperCase() || 'U'}
             </Text>
          </View>
          <View style={styles.profileInfo}>
             <Text style={styles.name}>{userSettings?.display_name || 'User'}</Text>
             <Text style={styles.email}>{userSettings?.user_id?.slice(0, 8)}... (Local User)</Text>
          </View>
        </View>

        {/* Settings Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PREFERENCES</Text>
          <View style={styles.card}>
            <SettingItem 
                icon={User} 
                label="Currency" 
                value={userSettings?.currency || 'IDR'} 
                onPress={() => Alert.alert('Info', 'Currency change coming soon!')}
            />
            <View style={styles.separator} />
            <SettingItem 
                icon={Bell} 
                label="Daily Reminder (9 PM)" 
                showChevron={false}
                trailing={
                    <Switch 
                        value={!!userSettings?.daily_reminder_enabled} 
                        onValueChange={handleToggleReminders}
                        trackColor={{ false: Colors.border, true: Colors.primary }}
                    />
                }
            />
            <View style={styles.separator} />
            <SettingItem 
                icon={Moon} 
                label="Dark Mode" 
                showChevron={false}
                trailing={
                    <Switch 
                        value={false} 
                        disabled 
                        trackColor={{ false: Colors.border, true: Colors.primary }}
                    />
                }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DATA</Text>
          <View style={styles.card}>
            <SettingItem icon={Download} label={loading ? "Exporting..." : "Export Data (CSV)"} onPress={handleExportData} disabled={loading} />
            <View style={styles.separator} />
            <SettingItem icon={Trash2} label="Reset Statistics" onPress={handleResetData} isDestructive />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>APP</Text>
          <View style={styles.card}>
            <SettingItem icon={Info} label="About ExpenseFlow" value="v1.0.0" onPress={() => Alert.alert('ExpenseFlow', 'Built by tamadev © 2025')} />
            <View style={styles.separator} />
            <SettingItem icon={Shield} label="Privacy Policy" onPress={() => Linking.openURL('https://example.com/privacy')} />
            <View style={styles.separator} />
            <SettingItem icon={LogOut} label="Sign Out" onPress={handleLogout} isDestructive />
          </View>
        </View>

        <View style={styles.footer}>
            <Text style={styles.footerText}>Made with ❤️ by tamadev © 2025</Text>
        </View>

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
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    ...Shadow.sm,
  },
  avatarText: {
    ...Typography.h2,
    color: '#FFF',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...Typography.h2,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  email: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    minHeight: 56,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconDestructive: {
    backgroundColor: '#FEF2F2',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  itemLabel: {
    ...Typography.body,
    fontFamily: 'PlusJakartaSans-Medium',
    color: Colors.textPrimary,
  },
  itemValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  textDestructive: {
    color: Colors.danger,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 56, // Icon width + margin + padding
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    opacity: 0.7,
  }
});
