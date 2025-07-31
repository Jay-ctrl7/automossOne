import { View, Alert, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Modal, Button, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';

const CheckOut = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [promoVisible, setPromoVisible] = useState(false);
  const [promo, setPromo] = useState("");
  const [fetching, setFetching] = useState(false);
  const [editing, setEditing] = useState(false);
  const [customerData, setCustomerData] = useState({
    fname: '',
    mname: '',
    lname: '',
    phone: '',
    email: '',
    address: '',
    zip: ''
  });

  const token = useAuthStore(state => state.token);
  const route = useRoute();
  const navigation = useNavigation();
  const { details = {} } = route.params || {};

  // Calculate taxes and total whenever details change
  useEffect(() => {
    if (details && details.displayPrice) {
      const price = parseFloat(details.displayPrice) || 0;
      const calculatedTax = price * 0.18; // 18% tax
      setTaxAmount(calculatedTax);
      setTotalAmount(price + calculatedTax);
    }
  }, [details]);

  useEffect(() => {
    fetchCustomerInfo();
  }, []);

  const fetchCustomerInfo = async () => {
    try {
      setFetching(true);
      if (!token) {
        Alert.alert("Error", "Please login again");
        return;
      }

      const response = await axios.post(ENDPOINTS.auth.customerinfo, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.data?.status === 1) {
        console.log(response.data.data)
        setCustomerData({
          fname: response.data.data?.fname || '',
          mname: response.data.data?.mname || '',
          lname: response.data.data?.lname || '',
          phone: response.data.data?.phone || '',
          email: response.data.data?.email || '',
          address: response.data.data?.address || '',
          zip: response.data.data?.zip || '',
        });
      } else {
        console.log("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Failed to fetch customer info:", error);
      Alert.alert("Error", "Failed to load customer data");
    } finally {
      setFetching(false);
    }
  };

  // const handleInputChange = (field, value) => {
  //   setCustomerData(prev => ({
  //     ...prev,
  //     [field]: value
  //   }));
  // };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    const hours = date.getHours();
    if (hours < 6 || hours >= 22) {
      alert('Please select time between 6 AM to 10 PM');
      setDatePickerVisibility(false);
      return;
    }
    setSelectedDate(date);
    hideDatePicker();
  };

  const formatDate = (date) => {
    if (!date) return 'Select Date & Time';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleProceedToPayment = () => {
    if (!selectedDate) {
      alert('Please select a date and time');
      return;
    }
    navigation.navigate('Payment', {
      serviceDetails: details,
      selectedDate,
      totalAmount
    });
  };

  // const toggleEditing = () => {
  //   setEditing(!editing);
  // };

  // const saveCustomerInfo = async () => {
  //   try {
  //     setFetching(true);
  //     const response = await axios.post(ENDPOINTS.auth.updatecustomer, customerData, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Accept': 'application/json',
  //       }
  //     });

  //     if (response.data?.status === 1) {
  //       Alert.alert("Success", "Profile updated successfully");
  //       setEditing(false);
  //     } else {
  //       Alert.alert("Error", response.data?.message || "Failed to update profile");
  //     }
  //   } catch (error) {
  //     console.error("Failed to update customer info:", error);
  //     Alert.alert("Error", "Failed to update profile");
  //   } finally {
  //     setFetching(false);
  //   }
  // };

  const PromoModal = () => {
    const [localPromo, setLocalPromo] = useState(promo);
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={promoVisible}
        onRequestClose={() => setPromoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available offers for you</Text>
              <TouchableOpacity onPress={() => setPromoVisible(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <TextInput
                placeholder="Enter Promocode"
                placeholderTextColor="#999"
                value={localPromo}
                onChangeText={setLocalPromo}
                style={styles.inputPromoCode}
                autoCapitalize="characters"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setPromo(localPromo);
                  setPromoVisible(false);
                }}
              >
                <Text style={styles.applyButtonText}>APPLY</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information: </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>
            {`${customerData.fname || 'First'} ${customerData.mname || ''} ${customerData.lname || 'Last'}`}
          </Text>
          {customerData.address ? <Text style={styles.infoText}>{customerData.address}</Text> : null}
          {customerData.zip ? <Text style={styles.infoText}>{customerData.zip}</Text> : null}
          <View style={styles.contactContainer}>
            {customerData.phone ? <Text style={styles.contactText}>{customerData.phone}</Text> : null}
            {customerData.email ? <Text style={[styles.contactText, styles.emailText]}>{customerData.email}</Text> : null}
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Details</Text>

      </View>

      {/* Rest of your existing components... */}
      <View style={styles.section}>
        <View style={[styles.checkboxContainer, styles.selectedService]}>
          <View style={styles.serviceHeader}>
            <Icon name="check-circle" size={24} color="#4CAF50" />
            <Text style={[styles.checkboxLabel, styles.selectedLabel]}>
              {details.garage ? details.garage.charAt(0).toUpperCase() + details.garage.slice(1).toLowerCase() : ''} Garage
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={showDatePicker}
          activeOpacity={0.7}
        >
          <View style={styles.iconCircle}>
            <Icon name="calendar-today" size={18} color="#555" />
          </View>
          <Text style={styles.checkboxLabel}>
            {formatDate(selectedDate)}
          </Text>
          <Icon name="chevron-right" size={20} color="#999" />
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          minimumDate={new Date()}
          minuteInterval={30}
          headerTextIOS="Select Date & Time"
          is24Hour={false}
          accentColor="#4CAF50"
        />

        <View style={styles.checkboxContainer}>
          <View style={styles.iconCircle}>
            <Icon name="build" size={18} color="#555" />
          </View>
          <Text style={styles.checkboxLabel}>{details.name}</Text>
          <Text style={styles.price}>₹{details.displayPrice}</Text>
        </View>
      </View>

      {/* Offers Section */}
      <TouchableOpacity
        style={styles.promoSection}
        activeOpacity={0.7}
        onPress={() => setPromoVisible(true)}
      >
        <View style={styles.offerContainer}>
          <View style={styles.promoIcon}>
            <Icon name="local-offer" size={20} color="#E91E63" />
          </View>
          <Text style={styles.offerPromoCode}>Offers & Promo Code</Text>
        </View>
        <View style={styles.viewOfferContainer}>
          <Text style={styles.viewOfferText}>View offers</Text>
          <Icon name="chevron-right" size={20} color="#999" />
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Item Total */}
      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Item Total</Text>
          <Text style={styles.totalValue}>₹{details.displayPrice}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Taxes & Fees</Text>
          <Text style={styles.totalValue}>₹{taxAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Total Amount</Text>
          <Text style={styles.grandTotalValue}>₹{totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Proceed Button */}
      <TouchableOpacity
        style={styles.proceedButton}
        onPress={handleProceedToPayment}
        activeOpacity={0.8}
      >
        <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
      </TouchableOpacity>
      <PromoModal />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
 section: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 15,
  },
  sectionHeader: {
    marginBottom: 10,
    
  },
  sectionTitle: {
    // fontFamily:'System',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#222',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
    marginBottom: 4,
  },
  contactContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  contactText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
 
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nameInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  firstNameInput: {
    flex: 0.45,
  },
  middleNameInput: {
    flex: 0.25,
  },
  lastNameInput: {
    flex: 0.25,
  },
  infoInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
 
  selectedService: {
    backgroundColor: '#F5F9F5',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    marginBottom: 8,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedLabel: {
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 8,
    backgroundColor: '#f8f8f8',
    marginVertical: 20,
  },
  promoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF6F9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  promoIcon: {
    backgroundColor: '#FFEBF1',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  offerPromoCode: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  offerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  viewOfferContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewOfferText: {
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  totalSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 15,
    color: '#666',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  proceedButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  inputPromoCode: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
 
  
 
});


export default CheckOut;