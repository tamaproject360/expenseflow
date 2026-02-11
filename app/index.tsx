import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      setHasUser(!!userId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.canvas }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Declarative redirect is more stable than imperative router.replace in useEffect
  return <Redirect href={hasUser ? "/(tabs)" : "/auth"} />;
}
