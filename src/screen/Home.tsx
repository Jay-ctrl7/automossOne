import { View, ScrollView, StyleSheet, Animated, TouchableOpacity, Image, Text } from 'react-native';
import React, { useState, useRef,useEffect } from 'react';
import TopCarServices from '../component/TopCarServices';
import Banner from '../component/Banner';
import Accessories from '../component/Accessories';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import LocationService from '../navigation/drawer/LocationService';

const Home = () => {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;


  useEffect(()=>{
//uselocation

  },[])

  const toggleMenu = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
    setExpanded(!expanded);
  };


  const handleServiceLiveBooking = () => {
    toggleMenu();
    navigation.navigate('ServiceLiveBooking');
  };

  const handleServiceProductBooking = () => {
    toggleMenu();
    navigation.navigate('ProductLiveBooking');
  };

  const liveBookingStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -90]
        })
      }
    ],
    opacity: animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1]
    })
  };

  const productBookingStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -180]
        })
      }
    ],
    opacity: animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1]
    })
  };

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg']
        })
      }
    ]
  };

  return (
    <View style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* <LocationService/> */}
        <Banner />
        <TopCarServices />
        <Accessories />
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        {/* Service Product Booking Button */}
        <Animated.View style={[styles.subFab, productBookingStyle]}>
          <TouchableOpacity onPress={handleServiceProductBooking} style={styles.subFabButton}>
            <Image
              source={require('../assets/image/logo.png')}
              style={styles.fabIcon}
            />
            <Text style={styles.subFabText}>Product Live Booking</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Service Live Booking Button */}
        <Animated.View style={[styles.subFab, liveBookingStyle]}>
          <TouchableOpacity onPress={handleServiceLiveBooking} style={styles.subFabButton}>
            <Image
              source={require('../assets/image/logo.png')}
              style={styles.fabIcon}
            />
            <Text style={styles.subFabText}>Service Live Booking</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Main Button */}
        <TouchableOpacity onPress={toggleMenu} activeOpacity={0.8}>
          <Animated.View style={[styles.mainFab, rotation]}>
            <Image 
              source={require('../assets/image/logo.png')}
              style={styles.mainFabIcon} 
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    alignItems: 'flex-end',
  },
  mainFab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  mainFabIcon: {
    width: 60,
    height: 60,
    // tintColor: 'white',
  },
  subFab: {
    width: 140,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  subFabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  subFabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  fabIcon: {
    width: 30,
    height: 30,
    // tintColor: '#6200ee',
  },
});

export default Home;