import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import Main from './Main';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Main2 from './Main2';
import Notification from './Notification';
import Icon from 'react-native-vector-icons/Octicons';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator>
      {/* Main Screen */}
      <Drawer.Screen 
        name="Main Screen" 
        component={Main}
        options={({ navigation }) => ({
          headerShown: true,
          title: 'Home',
          headerTitleStyle: {
            display: 'none'
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={{marginRight: 15}}>
              <Icon name="bell-fill" size={20} color="#000"/>
            </TouchableOpacity>
          )
        })}
      />
      
      {/* Main2 Screen */}
      <Drawer.Screen 
        name="Main" 
        component={Main2}
      />
      
      {/* Notifications Screen - Correct placement */}
      <Drawer.Screen
        name="Notifications"
        component={Notification}
        options={{
          title: 'Notifications',
          headerShown: true
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;