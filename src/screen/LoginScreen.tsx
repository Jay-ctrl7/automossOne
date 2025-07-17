import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  TextInput
} from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { ENDPOINTS } from '../config/api'; // Adjust the import path as necessary

const { width, height } = Dimensions.get('window')

const Login = () => {
  const [email, setEmail] = useState('')
  const [showReferral, setShowReferral] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const navigation = useNavigation();


  // Function to handle login logic can be added here
  const handleLogin = async () => {
    
    try {
      const trimmedEmail = email.trim();
     const data = await axios.post(ENDPOINTS.auth.customerLogin, {
      uname: trimmedEmail,
      referralCode: showReferral ? referralCode.trim() : undefined,
    });
      if (data.status === 200) {
        // Handle successful login, e.g., navigate to the next screen or show a success message
        console.log('Login successful:', data.data);
        navigation.navigate('OtpVerification', {
          email: trimmedEmail,
        });
      } else {
        // Handle error response
        console.error('Login failed:', data);
      }
  }
    catch (error) {
      console.error('Login error:', error);
      // Handle error appropriately, e.g., show an alert or toast
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Red Section */}
      <View style={styles.topSection}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.gearIcon}>
            <View style={styles.innerGear}>
              <Image 
                style={styles.logo}
                source={require('../assets/whitelogo.webp')} // Replace with your gear image path
              />
            </View>
          </View>
        </View>
        
        {/* App Name */}
        <Text style={styles.appName}>AutoMoss</Text>
        <Text style={styles.subtitle}>Login to get started</Text>
      </View>

      {/* Bottom White Section */}
      <View style={styles.bottomSection}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <FeatherIcon name="user" size={20} color="#777" />
          </View>
          <TextInput
            placeholder="Email or Mobile Number"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
            style={styles.textInput}
            underlineColorAndroid="transparent"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Referral Code Section */}
        {showReferral && (
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Icon name="tag-outline" size={20} color="#777" />
            </View>
            <TextInput
              placeholder="Referral Code (Optional)"
              placeholderTextColor="#777"
              value={referralCode}
              onChangeText={setReferralCode}
              style={styles.textInput}
              underlineColorAndroid="transparent"
              autoCapitalize="none"
            />
          </View>
        )}

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleLogin}>
          <Text style={styles.continueButtonText}>
            {showReferral ? 'Continue with Referral' : 'Continue'}
          </Text>
        </TouchableOpacity>

        {/* Referral Toggle */}
        <TouchableOpacity 
          style={styles.referralToggle}
          onPress={() => setShowReferral(!showReferral)}
        >
          <Text style={styles.referralToggleText}>
            {showReferral ? 'Hide referral code' : 'Do you have a referral code?'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF0000',
  },
  topSection: {
    backgroundColor: '#FF0000',
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    minHeight: height * 0.45,
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  gearIcon: {
    width: 80,
    height: 80,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerGear: {
    width: 60,
    height: 60,
    borderColor: 'white',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  bottomSection: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 0,
    minHeight: height * 0.55,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 50,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 0,
  },
  continueButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#FF0000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  referralToggle: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  referralToggleText: {
    color: '#FF0000',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
})

export default Login