import { View, Text, Image, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import React, { useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { getAuthData } from '../utils/AuthStore';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SplashScreen = ({ onAnimationComplete }) => {
  // Animation values
  const carPosition = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const navigation=useNavigation();


  // Navigate to Login screen after 2000ms
  const navigateToLogin = async () =>{
      const authData=await getAuthData();
      console.log('Auth Data:', authData);
    setTimeout(async () => {
     if(authData.token){
      console.log('Token found:', authData);
       navigation.replace('TabNav');
     }else{
      console.log('No token found',authData);
       navigation.replace('Login');
     }
    }, 2500);
  }

  useEffect(() => {
    // Start all animations together
    Animated.parallel([
      // Car movement (left to right)
      Animated.timing(carPosition, {
        toValue: SCREEN_WIDTH,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      
      // Fade in logo and text
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      
      // Subtle scaling effect
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      })
    ]).start(() => {
      // Callback when animation completes
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
    // Navigate to Login screen after 2000ms
    navigateToLogin();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }]}>
        <Image
          source={require('../assets/whitelogo.webp')}
          style={styles.logo}
        />
        <Text style={styles.text}>AutoMoss</Text>
      </Animated.View>

      <View style={styles.animationContainer}>
        <Animated.View style={{
          transform: [{ translateX: carPosition }],
        }}>
          <LottieView
            source={require('../assets/lottie/carAnimation.json')}
            autoPlay
            style={styles.animation}
            loop={false}
          />
        </Animated.View>
      </View>
      
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.1,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 15,
    resizeMode: 'contain',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  animationContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.2,
    width: '100%',
    height: 100,
    overflow: 'hidden',
  },
  animation: {
    width: 200,
    height: 100,
  },
});