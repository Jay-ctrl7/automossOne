import { View, Alert, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList, Image, ActivityIndicator, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import { useLocation } from '../context/LocationContext';
import CheckBox from '@react-native-community/checkbox';
import LocationSearch from '../component/LocationSearch';
import RazorpayCheckout from 'react-native-razorpay';
import Config from 'react-native-config';

// Reusable Thumbnail Component with fallback
const Thumbnail = React.memo(({ uri, defaultIcon, iconSize = 30, iconColor = 'red', style }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (uri) {
      setError(false);
      setLoading(true);
    } else {
      setError(true);
      setLoading(false);
    }
  }, [uri]);

  const shouldShowImage = uri && !error && typeof uri === 'string' && uri.trim() !== '';

  if (shouldShowImage) {
    return (
      <View style={style}>
        {loading && (
          <View style={[styles.thumbnailLoading, style]}>
            <Icon name={defaultIcon} size={iconSize} color={iconColor} />
          </View>
        )}
        <Image
          source={{ uri }}
          style={[style, loading ? styles.hidden : styles.visible]}
          onError={() => {
            console.log('Image failed to load:', uri);
            setError(true);
            setLoading(false);
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', uri);
            setLoading(false);
          }}
          onLoadEnd={() => setLoading(false)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.defaultIconContainer, style]}>
      <Icon name={defaultIcon} size={iconSize} color={iconColor} />
    </View>
  );
});
const SearchHeader = ({ title, searchQuery, setSearchQuery, onClose }) => (
  <View style={styles.modalHeader}>
    <Text style={styles.modalTitle}>{title}</Text>
    <View style={styles.searchContainer}>
      <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
      <TextInput
        placeholder="Search..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity onPress={onClose}>
        <Icon name="close" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  </View>
);

const CheckOut = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedOnlyDate, setSelectedOnlyDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [promoVisible, setPromoVisible] = useState(false);
  const [promo, setPromo] = useState("");
  const [fetching, setFetching] = useState(false);
  const [customerData, setCustomerData] = useState({
    id: '',
    fname: '',
    mname: '',
    lname: '',
    phone: '',
    email: '',
    address: '',
    zip: ''
  });
  const [vehicleData, setVehicleData] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState({
    id: null,
    manufacturer: null,
    model: null
  });
  const [showManufacturers, setShowManufacturers] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [loadingManufacturers, setLoadingManufacturers] = useState(false);
  const [manufacturerError, setManufacturerError] = useState(null);
  const [savedVehicle, setSavedVehicle] = useState([]);
  const [loadingCarSizes, setLoadingCarSizes] = useState(false);
  const [carSizeData, setCarSizeData] = useState([]);
  const [carSizeError, setCarSizeError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [custAddress, setCustAddress] = useState("");
  const [briefDescription, setBriefDescription] = useState("");
  const [bookingId, setBookingId] = useState(null);
  const [isHomeService, setIsHomeService] = useState(false);
  const [selectedOption, setSelectedOption] = useState('online');
  const [selectedFuelType, setSelectedFuelType] = useState(null);
  const [fuelTypeData, setFuelTypeData] = useState([]);
  const [loadingFuelTypes, setLoadingFuelTypes] = useState(false);
  const [fuelTypeError, setFuelTypeError] = useState(null);
  const [showFuelTypes, setShowFuelTypes] = useState(false);
  const [razorpaySuccessKeyId, setRazorpaySuccessKeyId] = useState(Config.RAZORPAY_KEY_ID_TEST);


  const [searchQueryManufacturer, setSearchQueryManufacturer] = useState('');
  const [searchQueryModel, setSearchQueryModel] = useState('');
  const [searchQueryFuel, setSearchQueryFuel] = useState('');
  const [numColumns, setNumColumns] = useState(3);

  const token = useAuthStore(state => state.token);
  const route = useRoute();
  const navigation = useNavigation();
  const { details = {} } = route.params || {};
  const { location } = useLocation();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const filteredManufacturers = vehicleData.filter(item =>
    item.name.toLowerCase().includes(searchQueryManufacturer.toLowerCase())
  );

  const filteredModels = selectedVehicle.manufacturer?.models?.filter(item =>
    item.name.toLowerCase().includes(searchQueryModel.toLowerCase())
  ) || [];

  const filteredFuelTypes = fuelTypeData.filter(item =>
    item.name.toLowerCase().includes(searchQueryFuel.toLowerCase())
  );
  useEffect(() => {
    if (!selectedLocation) {
      setCoordinates(location?.coordinates || null);
      setCustAddress(location?.address || "");
    } else {
      setCoordinates(selectedLocation?.coordinates || null);
      setCustAddress(selectedLocation?.address || "");
    }
  }, [selectedLocation, location]);

  useEffect(() => {
    if (details && details.displayPrice) {
      const price = parseFloat(details.displayPrice) || 0;
      const calculatedTax = price * 0.18;
      setTaxAmount(calculatedTax);
      setTotalAmount(price + calculatedTax);
      console.log("Details:", details);
    }
  }, [details]);

  useEffect(() => {
    fetchManufacture();
    fetchCustomerInfo();
    fetchCarSize();
    fetchFuelType();
  }, []);

  useEffect(() => {
    if (customerData?.id) {
      fetchSavedCar();
    }
  }, [customerData.id]);

  useEffect(() => {
    if (details.id) {
      BookingIdCreate();
    }
  }, [details.id]);

  const paymentMethods = [
    {
      id: 'online',
      name: 'Online Payment',
      icon: 'credit-card',
      description: 'Pay with credit/debit card or UPI'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: 'cash',
      description: 'Pay when you receive your order'
    }
  ];

  const BookingIdCreate = async () => {
    try {
      if (!token) {
        Alert.alert("Error", "Please login again");
        return;
      }
      const pId = `${details.id}`;
      const response = await axios.post(ENDPOINTS.customer.createBookingId, {
        xid: `${pId}_6`
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (response.data?.status === 1) {
        setBookingId(response.data?.booking_id)
      } else {
        console.log("Error", response.data?.message || "Failed to create bookingID");
      }
    } catch (error) {
      console.log("Error", "Failed to create booking ID");
    }
  };

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
        setCustomerData({
          id: response.data.data?.id || '',
          fname: response.data.data?.fname || '',
          mname: response.data.data?.mname || '',
          lname: response.data.data?.lname || '',
          phone: response.data.data?.phone || '',
          email: response.data.data?.email || '',
          address: response.data.data?.address || '',
          zip: response.data.data?.zip || '',
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load customer data");
    } finally {
      setFetching(false);
    }
  };

  const fetchManufacture = async () => {
    try {
      setLoadingManufacturers(true);
      setManufacturerError(null);
      const response = await axios.get(ENDPOINTS.master.manufacture);

      if (response.data?.status !== 1) {
        throw new Error(response.data?.message || 'Unexpected API response');
      }

      const normalizedData = response.data.data.map(maker => ({
        ...maker,
        id: maker.id?.toString(),
        models: (maker.model || []).map(model => ({
          id: model.id?.toString(),
          name: model.name || 'Unknown Model',
          thumb: model.thumb || '',
          manufacturerId: maker.id
        }))
      }));

      setVehicleData(normalizedData);
    } catch (err) {
      setManufacturerError(err.message);
      setVehicleData([]);
    } finally {
      setLoadingManufacturers(false);
    }
  };

  const fetchCarSize = async () => {
    try {
      setLoadingCarSizes(true);
      setCarSizeError(null);
      const response = await axios.get(ENDPOINTS.master.carSize);

      if (response.data?.status !== 1) {
        throw new Error(response.data?.message || 'Unexpected API response');
      }

      const normalizedData = response.data.data.map(size => ({
        id: size.id?.toString(),
        name: size.name || 'Unknown Size',
      }));

      setCarSizeData(normalizedData);
    } catch (err) {
      setCarSizeError(err.message);
      setCarSizeData([]);
    } finally {
      setLoadingCarSizes(false);
    }
  };

  const fetchSavedCar = async () => {
    try {
      if (!customerData?.id) {
        throw new Error("Customer ID is missing");
      }
      if (!token) {
        throw new Error("Authorization token is missing");
      }
      const response = await axios.get(
        `${ENDPOINTS.car.savedCar}?customer_id=${customerData.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      if (response.data?.status === 1) {
        const enhancedVehicles = response.data.data.map(vehicle => {
          const manufacturer = vehicleData.find(m => m.id === vehicle.car_brand?.toString());
          const model = manufacturer?.models?.find(m => m.id === vehicle.car_model?.toString());
          const carSize = carSizeData.find(s => s.id === vehicle.car_size?.toString());
          return {
            ...vehicle,
            brandName: manufacturer?.name || 'Unknown Brand',
            modelName: model?.name || vehicle.name || 'Unknown Model',
            carSizeName: carSize?.name || 'Unknown Size',
          };
        });
        setSavedVehicle(enhancedVehicles);
      } else {
        throw new Error(response.data?.message || "Unknown API response format");
      }
    } catch (error) {
      console.error("Error fetching saved cars:", error);
    }
  };

  const fetchFuelType = async () => {
    try {
      setLoadingFuelTypes(true);
      setFuelTypeError(null);
      const response = await axios.get(ENDPOINTS.master.fuel);

      if (response.data?.status !== 1) {
        throw new Error(response.data?.message || 'Unexpected API response');
      }

      const normalizedData = response.data.data.map(type => ({
        id: type.id?.toString(),
        name: type.name || 'Unknown Fuel Type',
      }));

      setFuelTypeData(normalizedData);
    } catch (err) {
      setFuelTypeError(err.message);
      setFuelTypeData([]);
    } finally {
      setLoadingFuelTypes(false);
    }
  };

  const handleManufacturerSelect = (manufacturer) => {
    setSelectedVehicle(prev => ({
      ...prev,
      id: null,
      manufacturer: {
        id: manufacturer.id,
        name: manufacturer.name,
        thumb: manufacturer.thumb,
        models: manufacturer.models
      },
      model: null
    }));
    setShowManufacturers(false);

    if (manufacturer.models && manufacturer.models.length > 0) {
      setShowModels(true);
    } else {
      Alert.alert('No Models', 'This manufacturer has no models available');
    }
  };

  const handleModelSelect = (model) => {
    setSelectedVehicle(prev => ({
      ...prev,
      id: null,
      model: {
        id: model.id,
        name: model.name,
        thumb: model.thumb
      }
    }));
    setShowModels(false);
  };

  const handleSavedVehicleSelect = (vehicle) => {
    const manufacturer = vehicleData.find(v => v.id === vehicle.car_brand?.toString());
    const model = manufacturer?.models?.find(m => m.id === vehicle.car_model?.toString());
    const fuelType = fuelTypeData.find(f => f.id === vehicle.fuel_type?.toString());

    setSelectedVehicle({
      id: vehicle.id,
      manufacturer: manufacturer ? {
        id: manufacturer.id,
        name: manufacturer.name,
        thumb: manufacturer.thumb
      } : null,
      model: model ? {
        id: model.id,
        name: model.name,
        thumb: model.thumb
      } : {
        id: vehicle.car_model,
        name: vehicle.name,
        thumb: vehicle.thumb
      }
    });
    setSelectedFuelType(fuelType || null);
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date) => {
    const hours = date.getHours();
    if (hours < 6 || hours >= 22) {
      Alert.alert('Error', 'Please select time between 6 AM to 10 PM');
      return;
    }
    setSelectedDate(date);
    setSelectedTime(date.toLocaleTimeString('en-US'));
    setSelectedOnlyDate(date.toLocaleDateString('en-US'));
    hideDatePicker();
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleFuelTypeSelect = (fuelType) => {
    setSelectedFuelType(fuelType);
    setShowFuelTypes(false);
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

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  const initiateRazorpayPayment = async (data) => {
    const totalPrice = data?.order_details?.total_price;
    const testKey = Config.RAZORPAY_KEY_ID_TEST;
    const testKey1 = 'rzp_test_JOC0wRKpLH1cVW';
    console.log("Razorpay Key ID:", testKey);
    var options = {
      description: 'Service Payment',
      image: 'https://i.imgur.com/3g7nmJC.jpg',
      currency: 'INR',
      key: testKey, // Replace with your actual key
      amount: totalPrice * 100, // Convert to paise
      name: 'Auto Service',
      prefill: {
        email: customerData.email || '',
        contact: customerData.phone || '',
        name: `${customerData.fname} ${customerData.lname}`.trim()
      },
      theme: { color: '#53a20e' }
    };

    try {
      const data = await RazorpayCheckout.open(options);
      // Payment success
      Alert.alert(`Success: ${data.razorpay_payment_id}`);
      console.log('Payment successful:', data);
      setRazorpaySuccessKeyId(data.razorpay_payment_id);
      // Navigate to success screen or handle success
      navigation.navigate('SuccessMsg', {
        BookingResponse: {
          bookingId: bookingId,
          paymentId: data.razorpay_payment_id,
          userData: {
            carManufacturer: selectedVehicle.manufacturer?.name,
            carModel: selectedVehicle.model?.name,
            fuelType: selectedFuelType?.name,
            service: details?.name,
            garage: details?.garage,
            date: selectedOnlyDate,
            time: selectedTime,
            totalAmount: totalPrice
          }
        },
      });

    } catch (error) {
      // Payment failed
      Alert.alert(`Error: ${error.code} | ${error.description}`);
      setRazorpaySuccessKeyId(null);
      console.error('Payment failed:', error);
      // Handle payment failure
    }
  };

  const postServiceBooking = async () => {
    if (!token) {
      Alert.alert("Error", "Please login again");
      return;
    }
    try {
      const userObj = {
        carManufacturer: selectedVehicle.manufacturer?.name,
        carModel: selectedVehicle.model?.name,
        fuelType: selectedFuelType?.name,
        service: details?.name,
        garage: details?.garage,
        details: details,
      }
      const lat = coordinates?.latitude || 0;
      const lon = coordinates?.longitude || 0;
      const manufacturer = selectedVehicle.manufacturer?.id || 0;
      const model = selectedVehicle.model?.id || 0;
      const fuelType = selectedFuelType?.id || 0;
      const payment = selectedOption;
      const response = await axios.post(`${ENDPOINTS.customer.serviceBooking}/${bookingId}`, {
        booking_id: bookingId,
        apply_burning: true,
        is_homeservice: isHomeService,
        scedule_date: selectedOnlyDate,
        scedule_time: selectedTime,
        description: briefDescription,
        cust_address: custAddress,
        cust_lat: lat,
        cust_lon: lon,
        car_manufacturer_id: manufacturer,
        car_model_id: model,
        fuel_type_id: fuelType,
        payment_id: payment

      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (response.data?.status === 1) {
        // Booking successful
        console.log('Booking successful:', response.data);
        if (selectedOption === 'online') {
          // navigation.navigate('Online Payment', {
          //  BookingResponse: response.data,
          //  userData: userObj
          // });
          initiateRazorpayPayment(response.data);
        }
        else {
          navigation.navigate('Cash Payment', {
            BookingResponse: response.data,
            userData: userObj,

          });
        }
      } else {
        throw new Error(response.data?.message || 'Unexpected API response');
      }
    } catch (error) {
      console.error('Error booking service:', error);
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date and time');
      return;
    }
    if (!selectedVehicle.manufacturer || !selectedVehicle.model) {
      Alert.alert('Error', 'Please select your vehicle details');
      return;
    }
    if (!selectedFuelType) {
      Alert.alert('Error', 'Please select fuel type');
      return;
    }
    postServiceBooking();

    console.log('Payment Details:', {
      bookingId,
      serviceDetails: details,
      selectedDate: selectedOnlyDate,
      selectedTime,
      isHomeService,
      briefDescription,
      coordinates,
      vehicleDetails: selectedVehicle,
      fuelType: selectedFuelType,
      quantity,
      totalAmount,
      selectedVehicle
    });
  };

  const PromoModal = () => {
    const [localPromo, setLocalPromo] = useState(promo);

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={promoVisible}
        onRequestClose={() => setPromoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply Promo Code</Text>
              <TouchableOpacity onPress={() => setPromoVisible(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Icon name="local-offer" size={20} color="red" style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter promo code"
                  placeholderTextColor="#999"
                  value={localPromo}
                  onChangeText={setLocalPromo}
                  style={styles.inputField}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setPromo(localPromo);
                  setPromoVisible(false);
                }}
              >
                <Text style={styles.primaryButtonText}>APPLY PROMO</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Service Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Service Summary</Text>
          <View style={styles.serviceItem}>
            {/* <Thumbnail
              uri={details.thumb}
              defaultIcon="build"
              style={styles.serviceImage}
            /> */}
            <Image
              source={{ uri: details.thumb }}
              style={styles.serviceImage}
              resizeMode="cover"
            />
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{details.name}</Text>
            </View>
            {/* <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>  */}
            <Text style={styles.servicePrice}>{formatCurrency(details.displayPrice)}</Text>
          </View>
          <Text style={styles.serviceGarage}>Garage: {details.garage ? details.garage.charAt(0).toUpperCase() + details.garage.slice(1).toLowerCase() : ''}</Text>
        </View>

        {/* Date & Time Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={showDatePicker}
          >
            <Icon name="calendar-today" size={20} color="red" />
            <Text style={selectedDate ? styles.selectedText : styles.placeholderText}>
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
            accentColor="red"
          />
        </View>

        {/* Personal Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Icon name="person" size={20} color="red" />
              <Text style={styles.infoText}>
                {`${customerData.fname || 'First'} ${customerData.mname || ''} ${customerData.lname || 'Last'}`}
              </Text>
            </View>
            {customerData.address && (
              <View style={styles.infoRow}>
                <Icon name="location-on" size={20} color="red" />
                <Text style={styles.infoText}>{customerData.address}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color="red" />
              <Text style={styles.infoText}>{customerData.phone || 'Not provided'}</Text>
            </View>
            {customerData.email && (
              <View style={styles.infoRow}>
                <Icon name="email" size={20} color="red" />
                <Text style={styles.infoText}>{customerData.email}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Vehicle Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>

          {/* Saved Vehicles */}
          {savedVehicle.length > 0 && (
            <>
              <Text style={styles.subtitle}>Saved Vehicles</Text>
              <FlatList
                data={savedVehicle}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.savedCarItem,
                      selectedVehicle.id === item.id && styles.selectedVehicle
                    ]}
                    onPress={() => handleSavedVehicleSelect(item)}
                  >
                    <Thumbnail
                      uri={item.thumb}
                      defaultIcon="directions-car"
                      style={styles.savedVehicleThumb}
                    />
                    <View style={styles.vehicleDetails}>
                      <Text style={styles.vehicleName}>{item.name}</Text>
                      <Text style={styles.vehicleSpec}>
                        {item.brandName} • {item.modelName} • {item.carSizeName}
                      </Text>
                    </View>
                    <Icon
                      name={selectedVehicle.id === item.id ? "radio-button-checked" : "radio-button-unchecked"}
                      size={24}
                      color={selectedVehicle.id === item.id ? "red" : "#ccc"}
                    />
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {/* Vehicle Selection */}
          <Text style={styles.subtitle}>Select Vehicle</Text>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setShowManufacturers(true)}
          >
            <Thumbnail
              uri={selectedVehicle.manufacturer?.thumb}
              defaultIcon="directions-car"
              style={styles.vehicleThumb}
            />
            <Text style={selectedVehicle.manufacturer ? styles.selectedText : styles.placeholderText}>
              {selectedVehicle.manufacturer?.name || 'Select Manufacturer'}
            </Text>
            <Icon name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          {selectedVehicle.manufacturer && (
            <TouchableOpacity
              style={[styles.selectionButton, { marginTop: 10 }]}
              onPress={() => setShowModels(true)}
            >
              <Thumbnail
                uri={selectedVehicle.model?.thumb}
                defaultIcon="directions-car"
                style={styles.vehicleThumb}
              />
              <Text style={selectedVehicle.model ? styles.selectedText : styles.placeholderText}>
                {selectedVehicle.model?.name || 'Select Model'}
              </Text>
              <Icon name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>
          )}

          <Text style={[styles.subtitle, { marginTop: 10 }]}>Select Fuel Type</Text>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setShowFuelTypes(true)}
          >
            <Text style={selectedFuelType ? styles.selectedText : styles.placeholderText}>
              {selectedFuelType?.name || 'Select Fuel Type'}
            </Text>
            <Icon name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Brief Description */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Brief Description</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter brief description"
            placeholderTextColor="#999"
            value={briefDescription}
            onChangeText={setBriefDescription}
            multiline
          />
        </View>

        {/* Location Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Service Location</Text>
          <LocationSearch
            onLocationSelect={handleLocationSelect}
          />
          {selectedLocation ? (
            <View style={styles.locationInfo}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.locationText}>{selectedLocation.address}</Text>
            </View>
          ) : (
            location?.address && (
              <View style={styles.locationInfo}>
                <Icon name="my-location" size={20} color="red" />
                <Text style={styles.locationText}>Using current location: {location.address}</Text>
              </View>
            )
          )}
        </View>

        {/* Promo Code */}
        <TouchableOpacity
          style={styles.promoCard}
          onPress={() => setPromoVisible(true)}
        >
          <View style={styles.promoContent}>
            <View style={styles.promoIcon}>
              <Icon name="local-offer" size={24} color="red" />
            </View>
            <View style={styles.promoText}>
              <Text style={styles.promoTitle}>Apply Promo Code</Text>
              <Text style={styles.promoSubtitle}>Save on your service</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#999" />
          </View>
        </TouchableOpacity>

        {/* Home service checkbox */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Home Service</Text>
          <View style={styles.checkboxContainer}>
            <CheckBox
              value={isHomeService}
              onValueChange={setIsHomeService}
              tintColors={{ true: 'red', false: '#ccc' }}
            />
            <Text style={styles.checkboxLabel}>Request home service</Text>
          </View>
        </View>

        {/* Payment Mode */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setSelectedOption(method.id)}
              style={[
                styles.optionContainer,
                selectedOption === method.id && styles.selectedOption
              ]}
            >
              <View style={styles.radioButton}>
                {selectedOption === method.id && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>

              <View style={styles.methodInfo}>
                <View style={styles.methodHeader}>
                  <Icon1
                    name={method.icon}
                    size={22}
                    color={selectedOption === method.id ? 'red' : '#a79393ff'}
                  />
                  <Text style={[
                    styles.methodName,
                    selectedOption === method.id && styles.selectedText
                  ]}>
                    {method.name}
                  </Text>
                </View>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Summary */}
        {/* <View style={styles.card}>
          <Text style={styles.sectionTitle}>Price Summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Cost</Text>
            <Text style={styles.priceValue}>{formatCurrency(details.displayPrice)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax (18%)</Text>
            <Text style={styles.priceValue}>{formatCurrency(taxAmount)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={[styles.priceRow, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View> */}
      </ScrollView>

      {/* Fixed Proceed Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={handleProceedToPayment}
        >
          <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
          <Icon name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <PromoModal />

      {/* Manufacturer Selection Modal */}
      {/* Manufacturer Selection Modal - Grid Layout */}
      <Modal
        visible={showManufacturers}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowManufacturers(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fullModal}>
            <Text style={styles.modalHeaderTitle}>Select Manufacturer</Text>
            <SearchHeader
              // title="Select Manufacturer"
              searchQuery={searchQueryManufacturer}
              setSearchQuery={setSearchQueryManufacturer}
              onClose={() => setShowManufacturers(false)}
            />

            {loadingManufacturers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="red" />
              </View>
            ) : manufacturerError ? (
              <View style={styles.errorContainer}>
                <Icon name="error-outline" size={40} color="#f44336" />
                <Text style={styles.errorText}>Failed to load manufacturers</Text>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={fetchManufacture}
                >
                  <Text style={styles.secondaryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredManufacturers}
                keyExtractor={(item) => `manufacturer_${item.id}`}
                numColumns={numColumns}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={styles.gridContainer}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => handleManufacturerSelect(item)}
                  >
                    <Thumbnail
                      uri={item.thumb}
                      defaultIcon="directions-car"
                      style={styles.gridThumbnail}
                    />
                    <Text style={styles.gridItemText} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Icon name="search-off" size={40} color="#ccc" />
                    <Text style={styles.emptyStateText}>
                      {searchQueryManufacturer
                        ? `No manufacturers found for "${searchQueryManufacturer}"`
                        : "No manufacturers available"
                      }
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Model Selection Modal */}
      <Modal
        visible={showModels}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModels(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fullModal}>
            <Text style={styles.modalHeaderTitle}>Select Model</Text>
            <SearchHeader
              // title={`Select ${selectedVehicle.manufacturer?.name || ''} Model`}
              searchQuery={searchQueryModel}
              setSearchQuery={setSearchQueryModel}
              onClose={() => setShowModels(false)}
            />

            {filteredModels.length > 0 ? (
              <FlatList
                data={filteredModels}
                keyExtractor={(item) => `model_${item.id}`}
                numColumns={numColumns}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={styles.gridContainer}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => handleModelSelect(item)}
                  >
                    <Thumbnail
                      uri={item.thumb}
                      defaultIcon="directions-car"
                      style={styles.gridThumbnail}
                    />
                    <Text style={styles.gridItemText} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyState}>
                <Icon name="search-off" size={40} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  {searchQueryModel
                    ? `No models found for "${searchQueryModel}"`
                    : selectedVehicle.manufacturer
                      ? "No models available for this manufacturer"
                      : "Please select a manufacturer first"
                  }
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Fuel Type Selection Modal */}
      <Modal
        visible={showFuelTypes}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFuelTypes(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fullModal}>
            <Text style={styles.modalHeaderTitle}>Select Fuel Type</Text>
            <SearchHeader
              // title="Select Fuel Type"
              searchQuery={searchQueryFuel}
              setSearchQuery={setSearchQueryFuel}
              onClose={() => setShowFuelTypes(false)}
            />
            

            {loadingFuelTypes ? (
              <ActivityIndicator size="large" color="red" />
            ) : fuelTypeError ? (
              <View style={styles.emptyState}>
                <Icon name="error-outline" size={40} color="#ccc" />
                <Text style={styles.emptyStateText}>{fuelTypeError}</Text>
              </View>
            ) : (
              <FlatList
                data={filteredFuelTypes}
                keyExtractor={(item) => `fuelType_${item.id}`}
                numColumns={numColumns}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={styles.gridContainer}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => handleFuelTypeSelect(item)}
                  >
                    <Icon name="local-gas-station" size={30} color="#666" />
                    <Text style={styles.gridItemText} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Icon name="search-off" size={40} color="#ccc" />
                    <Text style={styles.emptyStateText}>
                      {searchQueryFuel
                        ? `No fuel types found for "${searchQueryFuel}"`
                        : "No fuel types available"
                      }
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  serviceImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  serviceGarage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginLeft: 15,
    fontWeight: '600',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#333',
  },
  quantityValue: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F8FA',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  selectedText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#999',
  },
  infoContainer: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  savedCarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F8FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedVehicle: {
    backgroundColor: '#F0F5FF',
    borderColor: 'red',
    borderWidth: 1,
  },
  savedVehicleThumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  vehicleSpec: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  vehicleThumb: {
    width: 34,
    height: 34,
    borderRadius: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F8FA',
    borderRadius: 8,
  },
  locationText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  promoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  promoSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F8F8FA',
    marginBottom: 8,
  },
  selectedOption: {
    borderColor: 'red',
    borderWidth: 1,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 15,
    color: '#666',
  },
  priceValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: 'red',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  proceedButton: {
    backgroundColor: 'red',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 24,
  },
  fullModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    height: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    marginTop: 8,

  },
  modalTitle: {
    
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    
  },
  modalContent: {
    paddingTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  primaryButton: {
    backgroundColor: 'red',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  listThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  hidden: {
    display: 'none',
  },
  visible: {
    display: 'flex',
  },
  thumbnailLoading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // New styles for grid layout and search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    flex: 1,
    marginLeft: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  gridContainer: {
    padding: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    width: (Dimensions.get('window').width - 64) / 3,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F8F8FA',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  gridThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginBottom: 8,
  },
  gridItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedGridItem: {
    backgroundColor: '#F0F5FF',
    borderColor: 'red',
    borderWidth: 1,
  },
});

export default CheckOut;