import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Colors, Typography } from '@/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequence: Fade In -> Scale Up -> Navigate
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        friction: 4, // spring effect
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate after animation completes
      setTimeout(() => {
        router.replace('/index'); // Go to index to check auth
      }, 500);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>💰</Text>
        </View>
        <Text style={styles.title}>ExpenseFlow</Text>
      </Animated.View>
      
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>Made with ❤️ by tamadev © 2025</Text>
      </Animated.View>
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
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 50,
  },
  title: {
    ...Typography.h1,
    color: '#FFFFFF',
    fontSize: 32,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
});
