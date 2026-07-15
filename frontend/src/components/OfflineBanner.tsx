import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Network from 'expo-network';
import { SYNTRA_THEME } from '../../constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const OfflineBanner = () => {
  const [isConnected, setIsConnected] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkNetwork = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setIsConnected(networkState.isConnected ?? true);
    };

    checkNetwork();
    // In a real app we'd want to subscribe to changes.
    // expo-network doesn't have an event listener, so we'd typically poll or use @react-native-community/netinfo
    // but the spec suggests `expo-network` monitors connection state. We'll set an interval.
    const interval = setInterval(checkNetwork, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isConnected) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.text}>You are offline. Showing cached data.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: SYNTRA_THEME.colors.black,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: SYNTRA_THEME.colors.primary,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
});
