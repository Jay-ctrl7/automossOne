import React from 'react';
import { LogBox } from 'react-native';
import SplashScreen from './src/screen/SplashScreen';
import LoginScreen from './src/screen/LoginScreen';
import StackNav from './src/navigation/stack/StackNav';

// Optional: Suppress specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

function App() {
  return (
    <StackNav />
  );
}

export default App;