import { TouchableOpacity, View, Text } from 'react-native';
import React from 'react';
import Main from './Main';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Notification from './Notification';
import Icon from 'react-native-vector-icons/Octicons';
import ServiceLiveBooking from './ServiceLiveBooking';
import ProductLiveBooking from './ProductLiveBooking';
import LocationService from './LocationService';
import { useLocation } from '../../context/LocationContext';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { location, loading } = useLocation();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerTitleStyle: { fontWeight: 'bold' },
        drawerActiveTintColor: '#e91e63',
        headerTitle: ({ children }) => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '400' }}>{children}</Text>
          </View>
        ),
      }}
    >
      <Drawer.Screen
        name="Main"
        component={Main}
        options={({ navigation }) => ({
          drawerIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
          title: location.city || 'My Location', // Using context city
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={{ marginRight: 15 }}
            >
              <Icon name="bell-fill" size={20} color="red" />
            </TouchableOpacity>
          )
        })}
      />

      {/* Notifications Screen */}
      <Drawer.Screen
        name="Notifications"
        component={Notification}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="bell" size={size} color={color} />
          ),
          title: 'Notifications'
        }}
      />

      {/* Service Bookings */}
      <Drawer.Screen
        name='ServiceLiveBooking'
        component={ServiceLiveBooking}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="tools" size={size} color={color} />
          ),
          title: 'Service Bookings'
        }}
      />

      {/* Product Bookings */}
      <Drawer.Screen
        name='ProductLiveBooking'
        component={ProductLiveBooking}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="package" size={size} color={color} />
          ),
          title: 'Product Bookings'
        }}
      />

      {/* Location Service */}
      {/* <Drawer.Screen
        name='LocationService'
        component={LocationService}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="location" size={size} color={color} />
          ),
          title: 'My Location'
        }}
      /> */}
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;