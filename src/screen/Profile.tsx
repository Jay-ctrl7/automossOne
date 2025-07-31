import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ENDPOINTS } from '../config/api';
import axios from 'axios';

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const navigation = useNavigation();
  const logout = useAuthStore(state => state.logout);
  const token = useAuthStore(state => state.token);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            }
            catch (error) {
              console.error("Logout failed", error);
              Alert.alert('Error', 'Failed to logout. Please try again.')
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handlePersonalDetails = () => {
    navigation.navigate('PersonalDetails');
  };

  const fetchCustomerInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(ENDPOINTS.auth.customerinfo, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.data?.status === 1) {
        setCustomerData(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Failed to fetch customer info:", error);
      setError(error.message || 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerInfo();
  }, []);

  const handleRetry = () => {
    fetchCustomerInfo();
  };

  const ProfileButton = ({ icon, title, onPress, iconType = 'material' }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        {icon ? (
          iconType === 'material' ? (
            <Icon name={icon} size={20} color="#e74c3c" style={styles.icon} />
          ) : (
            <MCIcon name={icon} size={20} color="#e74c3c" style={styles.icon} />
          )
        ) : null}
        <Text style={styles.buttonText}>{title}</Text>
      </View>
      <Icon name="chevron-right" size={20} color="#95a5a6" />
    </TouchableOpacity>
  );

  const EssentialItem = ({ image, text }) => (
    <TouchableOpacity style={styles.essentialItem}>
      <View style={styles.essentialIconContainer}>
        <Image source={image} style={styles.essentialIcon} />
      </View>
      <Text style={styles.essentialText}>{text}</Text>
    </TouchableOpacity>
  );

  if (isLoading && !customerData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !customerData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>
                Hello, <Text style={styles.welcomeUser}>{customerData?.fname || 'User'}</Text>
              </Text>
              <View style={styles.emailInfo}>
                <Icon name="mail" size={20} color="#e74c3c" />
                <Text style={styles.emailText}>{customerData?.email || ''}</Text>
              </View>
            </View>
            <Image
              source={{ uri: customerData?.thumb || 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
              onError={() => console.log("Image failed to load")}
            />
          </View>

          {/* Quick Access Icons */}
          <View style={styles.essentialContainer}>
            <View style={styles.essentialRow}>
              <EssentialItem
                image={require('../assets/image/myOrder.png')}
                text="My Orders"
              />
              <EssentialItem
                image={require('../assets/image/vehicle.png')}
                text="My Vehicle"
              />
              <EssentialItem
                image={require('../assets/image/serviceBook.png')}
                text="Services"
              />
              <EssentialItem
                image={require('../assets/image/helpSupport.png')}
                text="Support"
              />
            </View>
          </View>

          {/* Wheels Reward Card */}
          <View style={styles.rewardContainer}>
            <View style={styles.rewardCard}>
              <View style={styles.rewardContent}>
                <Image
                  source={require('../assets/icon/wheel1.png')}
                  style={styles.wheelIcon}
                />
                <View style={styles.rewardTextContainer}>
                  <Text style={styles.rewardTitle}>Available Wheels</Text>
                  <Text style={styles.rewardCount}>100</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.rewardButton}>
                <Text style={styles.rewardButtonText}>Redeem</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Referral Card */}
          <View style={styles.referralContainer}>
            <View style={styles.referralTextContainer}>
              <Text style={styles.referralTitle}>Invite friends & earn rewards!</Text>
              <Text style={styles.referralSubtitle}>Get 50 Wheels for each successful referral</Text>
              <TouchableOpacity style={styles.referralButton}>
                <Text style={styles.referralButtonText}>Share Now</Text>
                <Icon name="share" size={16} color="white" style={styles.shareIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.referralImageContainer}>
              <Image
                source={require('../assets/image/reward.png')}
                style={styles.referralImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Profile Actions */}
          <View style={styles.buttonsContainer}>
            <ProfileButton
              icon="person"
              title="Personal Details"
              onPress={handlePersonalDetails}
            />
            {/* <ProfileButton
              icon="history"
              title="Service History"
              onPress={() => ""}
            /> */}
            <ProfileButton
              icon="map-marker-outline"
              title="Saved Addresses"
              onPress={() => ""}
              iconType="community"
            />
            <ProfileButton
              icon="shopping-cart"
              title="Add to Cart"
              onPress={() => ""}
            />

            <ProfileButton
              icon="notifications"
              title="Notification"
              onPress={() => ""}
            />
            <ProfileButton
              icon="payment"
              title="Payment Methods"
              onPress={() => ""}
            />
            <ProfileButton
              icon="logout"
              title="Logout"
              onPress={handleLogout}
            />

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  userInfo: {
    flex: 1,
    marginRight: 15,
  },
  welcomeText: {
    fontSize: 22,
    color: '#2c3e50',
    marginBottom: 5,
    fontWeight: '500',
  },
  welcomeUser: {
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  emailInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  emailText: {
    marginLeft: 8,
    color: '#7f8c8d',
    fontSize: 14,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#e74c3c',
  },
  essentialContainer: {
    marginVertical: 1,
    marginBottom: 20,
  },
  essentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  essentialItem: {
    width: '23%',
    alignItems: 'center',
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  essentialIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  essentialIcon: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  essentialText: {
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 5,
  },
  buttonsContainer: {
    marginTop: 15,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  buttonText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '500',
  },
  rewardContainer: {
    marginVertical: 10,
  },
  rewardCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wheelIcon: {
    width: 45,
    height: 45,
    marginRight: 15,
  },
  rewardTextContainer: {
    justifyContent: 'center',
  },
  rewardTitle: {
    fontSize: 15,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  rewardCount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  rewardButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  rewardButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  referralContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  referralTextContainer: {
    flex: 1,
    paddingRight: 15,
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
    lineHeight: 22,
  },
  referralSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
    lineHeight: 20,
  },
  referralButton: {
    width: '65%',
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  referralButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  shareIcon: {
    marginLeft: 8,
  },
  referralImageContainer: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  referralImage: {
    width: '100%',
    height: '100%',
  },
});

export default Profile;