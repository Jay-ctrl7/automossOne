import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
// import { clearAuthData } from '../utils/AuthStore';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';

const Profile = () => {
  const navigation = useNavigation();
  const logout=useAuthStore(state=>state.logout)

  const handleLogout = async () => {
    try {
      // await clearAuthData();  // assuming this returns a Promise
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;
