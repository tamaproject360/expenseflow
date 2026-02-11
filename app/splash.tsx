import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Colors, Typography } from '@/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(1);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withSequence(
      withTiming(1, { duration: 600 }),
      withSpring(1.05, { damping: 10, stiffness: 100 })
    );

    const timeout = setTimeout(() => {
      router.replace('/onboarding');
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>💰</Text>
        </View>
        <Text style={styles.appName}>ExpenseFlow</Text>
      </Animated.View>
      <Text style={styles.credit}>Made with ❤️ by tamadev © 2025</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 48,
  },
  appName: {
    ...Typography.h1,
    fontSize: 32,
    color: Colors.surface,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  credit: {
    position: 'absolute',
    bottom: 40,
    ...Typography.caption,
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Medium',
    color: Colors.surface,
    opacity: 0.7,
  },
});
