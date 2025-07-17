import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../../screen/Home';
import Profile from '../../screen/Profile';
import Services from '../../screen/Services';
import Store from '../../screen/Store';
import Emergency from '../../screen/Emergency';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';


const Tab = createBottomTabNavigator();
const TabNav = () => {
  return (
   
        <Tab.Navigator
            screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              
              return <Entypo name="home" size={20} color={focused ? 'red' : 'black'} />;


            } else if (route.name === 'Services') {

              return <MaterialIcons name="miscellaneous-services" size={20} color={focused ? 'red' : 'black'} />;

            } 
            else if (route.name === 'Store') {
              
              return <Ionicons name="storefront" size={20} color={focused ? 'red' : 'black'} />;

            } else if (route.name === 'Emergency') {

              return <MaterialIcons name="emergency-share" size={20} color={focused ? 'red' : 'black'} />;

            } else if (route.name === 'Profile') {

              return <MaterialIcons name="person" size={20} color={focused ? 'red' : 'black'} />;
            }
          },
          tabBarActiveTintColor: 'black',
          tabBarInactiveTintColor: 'black',
          tabBarStyle: {
            backgroundColor: 'lightblue',
            paddingBottom: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 5,
          },
          headerShown: false,
        })}
      >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Services" component={Services} />
            <Tab.Screen name="Store" component={Store} />
            <Tab.Screen name="Emergency" component={Emergency} />
            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>

    
  )
}

export default TabNav