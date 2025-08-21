import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// Try to import NetInfo with error handling
let NetInfo: any;
let netInfoAvailable = false;

try {
  NetInfo = require('@react-native-community/netinfo');
  netInfoAvailable = true;
} catch (error) {
  console.warn('NetInfo module not available:', error);
}

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [netInfoModuleAvailable, setNetInfoModuleAvailable] = useState<boolean>(netInfoAvailable);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener('change', setAppState);

    return () => {
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!netInfoModuleAvailable) {
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const setupNetInfo = async () => {
      try {
        // Check initial state
        const state = await NetInfo.fetch();
        setIsConnected(state.isConnected);

        // Subscribe to changes
        unsubscribe = NetInfo.addEventListener((state: any) => {
          setIsConnected(state.isConnected);
        });
      } catch (error) {
        console.error('Error setting up NetInfo:', error);
        setNetInfoModuleAvailable(false);
      }
    };

    setupNetInfo();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [netInfoModuleAvailable, appState]);

  return {
    isConnected,
    netInfoAvailable: netInfoModuleAvailable
  };
};