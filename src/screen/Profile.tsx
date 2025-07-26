import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { clearAuthData } from '../utils/AuthStore';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await clearAuthData();  // assuming this returns a Promise
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
