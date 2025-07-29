import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import OTPTextInput from 'react-native-otp-textinput';
// import { storeAuthData } from '../utils/AuthStore';
import { ENDPOINTS } from '../config/api'; // Adjust the import path as necessary
import {useAuthStore} from '../stores/authStore';
const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();
    const { email } = route.params;

  const navigation = useNavigation();

    const storeAuthData = useAuthStore(state => state.storeAuthData);

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(
        ENDPOINTS.auth.customerVerifyOtp,
        {
          uname: email,
          otp: otp
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );

      // Check for token in response (common success indicator)
      if (response.data.token) {
        Alert.alert('Success', 'Login successful!');
        await storeAuthData(response.data);
        navigation.replace('DrawerNav'); // Navigate after successful verification
      } else {
        // Handle case where token is missing but API returned 200
        Alert.alert('Error', response.data.message || 'Verification failed');
      }
    } catch (error) {
      // Handle different error scenarios
      let errorMessage = 'An error occurred during verification';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error - please check your connection';
      }
      
      Alert.alert('Error', errorMessage);
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP sent to {email}</Text>
      
      <OTPTextInput
        handleTextChange={setOtp}
        inputCount={6}
        tintColor="#FF0000"
        offTintColor="#DDD"
        containerStyle={styles.otpContainer}
        textInputStyle={styles.otpInput}
        keyboardType="numeric"
        autoFocus
      />

      <TouchableOpacity 
        style={[styles.submitButton, isLoading && styles.disabledButton]}
        onPress={verifyOtp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Verify OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  otpContainer: {
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OtpVerification;