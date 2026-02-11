import { Tabs } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Home, BarChart3, Target, User } from 'lucide-react-native';
import { Colors, Shadow, Spacing } from '@/constants/theme';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';

export default function TabLayout() {
  const [showAddExpense, setShowAddExpense] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: {
            height: 64 + (Platform.OS === 'ios' ? 20 : 0),
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            backgroundColor: Colors.surface,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
          },
          tabBarLabelStyle: {
            fontFamily: 'PlusJakartaSans-Medium',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: 0.24,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarIcon: () => null,
            tabBarButton: () => (
              <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowAddExpense(true)}
                activeOpacity={0.8}
              >
                <Plus color={Colors.surface} size={24} strokeWidth={3} />
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: 'Goals',
            tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.fab,
  },
});
