import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Linking, 
  Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const NetworkStatus: React.FC = () => {
  const { isConnected, netInfoAvailable } = useNetworkStatus();

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('App-Prefs:root=WIFI');
    } else {
      Linking.openSettings().catch(() => {
        Linking.openURL('settings:');
      });
    }
  };

  // Don't show anything if NetInfo is not available or we're connected
  if (!netInfoAvailable || isConnected) {
    return null;
  }

  return (
    <View style={styles.container} testID="network-status-bar">
      <Icon name="wifi-off" size={20} color="#FFF" />
      <Text style={styles.text}>No internet connection</Text>
      {/* <TouchableOpacity onPress={openSettings} testID="network-settings-button">
        <Text style={styles.settingsText}>Settings</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    zIndex: 9999,
  },
  text: {
    color: '#FFF',
    marginLeft: 8,
    marginRight: 15,
    fontSize: 14,
  },
  settingsText: {
    color: '#FFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default NetworkStatus;