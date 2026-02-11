import { View, Text, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    emoji: '📱',
    title: 'Track Every Penny',
    description: 'Log expenses in under 5 seconds. Fast, simple, satisfying.',
  },
  {
    id: 2,
    emoji: '📊',
    title: 'See Where It Goes',
    description: 'Beautiful insights that make your spending crystal clear.',
  },
  {
    id: 3,
    emoji: '🏆',
    title: 'Build Money Habits',
    description: 'Earn streaks and achievements. Consistency has never been this fun.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleGetStarted = () => {
    router.replace('/auth');
  };

  const handleSkip = () => {
    router.replace('/auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      >
        {slides.map((slide, index) => (
          <SlideItem key={slide.id} slide={slide} index={index} scrollX={scrollX} />
        ))}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => {
            const dotStyle = useAnimatedStyle(() => {
              const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
              const dotWidth = interpolate(scrollX.value, inputRange, [8, 24, 8]);
              const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3]);

              return {
                width: dotWidth,
                opacity,
              };
            });

            return (
              <Animated.View
                key={index}
                style={[styles.dot, dotStyle, index === currentIndex && styles.activeDot]}
              />
            );
          })}
        </View>

        {currentIndex === slides.length - 1 && (
          <TouchableOpacity style={styles.button} onPress={handleGetStarted} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Get Started →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function SlideItem({
  slide,
  index,
  scrollX,
}: {
  slide: typeof slides[0];
  index: number;
  scrollX: Animated.SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const translateY = interpolate(scrollX.value, inputRange, [100, 0, 100]);
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0]);

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{slide.emoji}</Text>
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.lg,
    zIndex: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 100,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    ...Typography.h1,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: Spacing.md,
    color: Colors.textPrimary,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    height: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.primary,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    ...Typography.button,
    color: Colors.surface,
  },
});
