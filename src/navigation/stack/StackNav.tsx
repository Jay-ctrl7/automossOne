import { View, Text } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../screen/LoginScreen';
import SplashScreen from '../../screen/SplashScreen';
import OtpVerification from '../../screen/OtpVerification';
import TabNav from '../TabNavigation/TabNav';
import TopCarServices from '../../component/TopCarServices';
import ServiceDetails from '../../component/ServiceDetails';
import Accessories from '../../component/Accessories';
const Stack = createNativeStackNavigator();

const StackNav = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"  // Explicit initial route
        screenOptions={{
          headerShown: false,     // Hide header by default
          animation: 'fade',      // Default animation
        }}
      >
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
          options={{ gestureEnabled: false }} // Disable back gesture on splash
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ 
            title: 'User Login',   // Custom header title
            headerShown: false    // Override default for this screen
          }} 
        />
        {/* Add more screens here as needed */}
        <Stack.Screen 
          name="OtpVerification"
          component={OtpVerification}
          options={{ 
            title: 'OTP Verification', // Custom header title
            headerShown: true,         // Show header for OTP verification
            animation: 'slide_from_right' // Custom animation for this screen
          }}
        />
        <Stack.Screen 
          name="TabNav"
          component={TabNav}
          options={{ 
            title: 'TabNav', // Custom header title
            headerShown: false,         // Show header for Home
            animation: 'slide_from_right' // Custom animation for this screen
          }}
        />
        <Stack.Screen
          name='TopCarServices'
          component={TopCarServices}
          options={{
            title: 'Top Car Services', // Custom header title
            headerShown: false,         // Show header for TopCarServices
            animation: 'slide_from_right' // Custom animation for this screen
          }}
        />
        <Stack.Screen
          name="ServiceDetails"
          component={ServiceDetails} // Replace with actual service detail component
          options={{
            title: 'Service Details', // Custom header title
            headerShown: true,         // Show header for ServiceDetails
            animation: 'slide_from_right' // Custom animation for this screen
          }}
        />
        <Stack.Screen
        name='Accessories'
        component={Accessories}
        options={{
          title: 'Accessories', // Custom header title
          headerShown: false,         // Show header for Accessories
          animation: 'slide_from_right' // Custom animation for this screen
        }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNav;