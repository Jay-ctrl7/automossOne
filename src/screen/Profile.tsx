import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import Icon from 'react-native-vector-icons/MaterialIcons'; // or your preferred icon library

const Profile = () => {
  const navigation = useNavigation();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const buttons = [
    // {
    //   title: 'Edit Profile',
    //   icon: 'edit',
    //   onPress: () => console.log('Edit Profile'),
    //   color: '#3498db'
    // },
    // {
    //   title: 'Settings',
    //   icon: 'settings',
    //   onPress: () => console.log('Settings'),
    //   color: '#9b59b6'
    // },
    {
      title: 'Logout',
      icon: 'logout',
      onPress: handleLogout,
      color: '#e74c3c'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        
        {buttons.map((button, index) => (
          <TouchableOpacity 
            key={index}
            onPress={button.onPress} 
            style={[styles.button,
              //  { backgroundColor: button.color }
              ]}
            activeOpacity={0.7}
          >
            <View style={styles.buttonContent}>
              <Icon name={button.icon} size={20} color="red" style={styles.icon} />
              <Text style={styles.buttonText}>{button.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    // elevation: 3,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  buttonText: {
    color: 'red',
    fontSize: 16,
    fontWeight: '600',
  },
});