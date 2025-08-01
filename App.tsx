import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import StackNav from './src/navigation/stack/StackNav';
import { useAuthStore } from './src/stores/authStore';

// Optional: Suppress specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

function App() {
  const initialize = useAuthStore(state => state.initialize);

  useEffect(() => {
    initialize();  // hydrate auth store from AsyncStorage on app start
  }, [initialize]);

  return (
    <PaperProvider>
      <StackNav />
    </PaperProvider>
  );
}

export default App;