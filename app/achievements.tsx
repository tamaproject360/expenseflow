import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { openDatabase } from '@/lib/db';
import { AchievementDefinition, UserAchievement, UserSettings } from '@/types/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { seedAchievements, checkAchievements } from '@/lib/achievements';

const { width } = Dimensions.get('window');
const BADGE_SIZE = (width - (Spacing.lg * 2) - (Spacing.md * 2)) / 3;

interface AchievementWithStatus extends AchievementDefinition {
  earned: boolean;
  earned_at?: string;
}

export default function AchievementsScreen() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Animation for streak flame
  const flameAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(flameAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const db = await openDatabase();
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) return;

      // Ensure definitions exist and check for new unlocks
      await seedAchievements();
      await checkAchievements();

      // Fetch User Settings (Streak)
      const settings = await db.getFirstAsync<UserSettings>('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
      if (settings) setUserSettings(settings);

      // Fetch Achievements
      const defs = await db.getAllAsync<AchievementDefinition>('SELECT * FROM achievement_definitions ORDER BY sort_order ASC');
      const earned = await db.getAllAsync<UserAchievement>('SELECT * FROM user_achievements WHERE user_id = ?', [userId]);
      
      const earnedMap = new Map(earned.map(e => [e.achievement_id, e]));

      const merged = defs.map(def => ({
        ...def,
        earned: earnedMap.has(def.id),
        earned_at: earnedMap.get(def.id)?.earned_at
      }));

      setAchievements(merged);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={Colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Streak Hero Section */}
        <View style={styles.streakContainer}>
          <Animated.Text style={[styles.flameIcon, { transform: [{ scale: flameAnim }] }]}>🔥</Animated.Text>
          <Text style={styles.streakCount}>{userSettings?.current_streak || 0}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
          <View style={styles.streakFooter}>
            <Text style={styles.streakSubtext}>
              Longest: {userSettings?.longest_streak || 0} days
            </Text>
          </View>
        </View>

        {/* Badges Grid */}
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.grid}>
          {achievements.map((item, index) => (
            <View 
              key={item.id} 
              style={styles.badgeWrapper}
            >
              <TouchableOpacity 
                activeOpacity={0.8}
                style={[
                  styles.badge, 
                  !item.earned && styles.badgeLocked,
                  item.earned && styles.badgeEarned
                ]}
              >
                <Text style={[styles.badgeIcon, !item.earned && { opacity: 0.5 }]}>
                  {item.badge_icon}
                </Text>
                {!item.earned && (
                  <View style={styles.lockOverlay}>
                    <Lock size={16} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.badgeName}>{item.name}</Text>
              <Text style={styles.badgeDesc} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  streakContainer: {
    backgroundColor: '#FFF7ED', // Orange/Amber tint
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  flameIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  streakCount: {
    ...Typography.h1,
    fontSize: 56,
    color: Colors.accent,
    lineHeight: 64,
  },
  streakLabel: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  streakFooter: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
  },
  streakSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  badgeWrapper: {
    width: BADGE_SIZE,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    ...Shadow.sm,
  },
  badgeEarned: {
    backgroundColor: '#ECFDF5', // Emerald tint
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  badgeLocked: {
    backgroundColor: '#F1F5F9', // Slate 100
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeIcon: {
    fontSize: 32,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.textSecondary,
    padding: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  badgeName: {
    ...Typography.caption,
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
    marginBottom: 2,
    color: Colors.textPrimary,
  },
  badgeDesc: {
    ...Typography.caption,
    fontSize: 10,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
});
