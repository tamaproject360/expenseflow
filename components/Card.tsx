import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadow } from '@/constants/theme';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
    ...Shadow.card,
  },
});
