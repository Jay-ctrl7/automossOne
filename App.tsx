import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import StackNav from './src/navigation/stack/StackNav';
import { useAuthStore } from './src/stores/authStore';
import { LocationProvider } from './src/context/LocationContext';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://3f922d44910aa78f8be040ef0bd922c1@o4509864012546048.ingest.de.sentry.io/4509864015233104',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Optional: Suppress specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

function App() {
  const initialize = useAuthStore(state => state.initialize);

  useEffect(() => {
    initialize(); // hydrate auth store from AsyncStorage on app start
  }, [initialize]);

  return (
    <PaperProvider>
      <LocationProvider>
        <StackNav />
      </LocationProvider>
    </PaperProvider>
  );
}

export default Sentry.wrap(App);
