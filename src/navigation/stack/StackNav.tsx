import { View, Text } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../screen/LoginScreen';
import SplashScreen from '../../screen/SplashScreen';
import OtpVerification from '../../screen/OtpVerification';
import TabNav from '../TabNavigation/TabNav';
import TopCarServices from '../../component/TopCarServices';
import ServiceList from '../../screen/ServiceList';
import Accessories from '../../component/Accessories';
import { StatusBar } from 'react-native';
import ServiceDetails from '../../screen/ServiceDetails';
import CustomerKyc from '../../component/CustomerKyc';
import CheckOut from '../../component/CheckOut';
import DrawerNavigator from '../drawer/DrawerNavigator';
import PersonalDetails from '../../screen/PersonalDetails';

const Stack = createNativeStackNavigator();

const StackNav = () => {
  return (


    <NavigationContainer>
          <StatusBar 
        backgroundColor="lightblue" 
        barStyle="dark-content"
      />
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
        name="DrawerNav"
        component={DrawerNavigator}
        options={{
          title:'Drawr Nav',
          headerShown:false,
          animation:'slide_from_right'
        }}/>
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
          name="ServiceList"
          component={ServiceList} // Replace with actual service detail component
          options={{
            title: 'Service List', // Custom header title
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
        <Stack.Screen 
        name='ServiceDetails'
        component={ServiceDetails}
        options={{title:"Service Details",
          headerShown:true,
          animation:'slide_from_right'
        }}
        />
        <Stack.Screen 
        name='CustomerKyc'
        component={CustomerKyc}
        options={{
          title:"Customer KYC",
          headerShown:false,
          animation:'slide_from_right'
        }}/>
        <Stack.Screen
        name='Checkout'
        component={CheckOut}
        options={{
          title:"Checkout",
          headerShown:true,
          animation:'slide_from_right'
        }}/>
        <Stack.Screen
        name='PersonalDetails'
        component={PersonalDetails}
        options={{
          title:"Personal details",
          headerShown:true,
          animation:'slide_from_left'
        }}/>
      </Stack.Navigator>
    </NavigationContainer>
 
  );
};

export default StackNav;