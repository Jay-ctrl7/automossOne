import { View, Alert, Text, ScrollView, StyleSheet, TouchableOpacity, Button, Platform, Modal, TextInput, FlatList, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Config from 'react-native-config';
import LocationSearch from '../component/LocationSearch';
import { useLocation } from '../context/LocationContext';

// Reusable Thumbnail Component with fallback
const Thumbnail = React.memo(({ uri, defaultIcon, iconSize = 24, iconColor = '#666', style }) => {
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

const CheckOut = () => {
  const [selectedDate, setSelectedDate] = useState(null);
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
  const [vehicle, setVehicle] = useState([]);
  const [loadingCarSizes, setLoadingCarSizes] = useState(false);
  const [carSizeData, setCarSizeData] = useState([]);
  const [carSizeError, setCarSizeError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState(null);

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

  useEffect(() => {
    if (details && details.displayPrice) {
      const price = parseFloat(details.displayPrice) || 0;
      const calculatedTax = price * 0.18;
      setTaxAmount(calculatedTax);
      setTotalAmount(price + calculatedTax);
    }
  }, [details]);

  useEffect(() => {
    fetchManufacture();
    fetchCustomerInfo();
    fetchCarSize();
  }, []);

  useEffect(() => {
    if (customerData?.id) {
      fetchSavedCar();
    }
  }, [customerData.id]);

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

      // Process the manufacturer data
      const normalizedData = response.data.data.map(maker => {
        console.log('Manufacturer:', maker.name, 'Models:', maker.model);

        // Ensure models is properly formatted
        const models = (maker.model || []).map(model => ({
          id: model.id?.toString(),
          name: model.name || 'Unknown Model',
          thumb: model.thumb || '',
          manufacturerId: maker.id
        }));

        return {
          ...maker,
          id: maker.id?.toString(),
          models: models
        };
      });

      setVehicleData(normalizedData);
      setVehicle(normalizedData);
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
      console.log('Car Size Response:', response.data);

      if (response.data?.status !== 1) {
        throw new Error(response.data?.message || 'Unexpected API response');
      }

      // Process the car size data
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
            // Add other details you want to display
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

  const handleManufacturerSelect = (manufacturer) => {
    console.log('Selected Manufacturer Models:', manufacturer.models);

    setSelectedVehicle(prev => ({
      ...prev,
      id: null,
      manufacturer: {
        id: manufacturer.id,
        name: manufacturer.name,
        thumb: manufacturer.thumb,
        models: manufacturer.models // Include models in manufacturer object
      },
      model: null
    }));
    setShowManufacturers(false);

    // Check if models exist
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

    setSelectedVehicle({
      id: vehicle.id,
      manufacturer: manufacturer ? {
        id: manufacturer.id,
        name: manufacturer.name,
        thumb: manufacturer.thumb
      } : null,
      model: model ? {
        id: model.id,
        name: model.name, // Use the model name from manufacturer data
        thumb: model.thumb
      } : {
        id: vehicle.car_model,
        name: vehicle.name, // Fallback to vehicle name if model not found
        thumb: vehicle.thumb
      }
    });
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
    hideDatePicker();
  };
  const handleLocationSelect = (location) => {
    console.log('Selected Location:', location);
    setSelectedLocation(location);
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
      Alert.alert('Error', 'Please select a date and time');
      return;
    }
    if (!selectedVehicle.manufacturer || !selectedVehicle.model) {
      Alert.alert('Error', 'Please select your vehicle details');
      return;
    }
    navigation.navigate('Payment', {
      serviceDetails: details,
      selectedDate,
      totalAmount,
      vehicleDetails: selectedVehicle
    });
  };
  const handleQuantityChange = (change) => {
    if (change < 0 && quantity <= 1) return; // Prevent going below 1
    setQuantity(prev => prev + change);
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
            <Image source={{ uri: details.thumb }} style={styles.serviceImage} />
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{details.name}</Text>
             
            </View>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={() => handleQuantityChange(-1)}
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
            </View>
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

        {/* Price Breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Cost</Text>
            <Text style={styles.priceValue}>{formatCurrency(details.displayPrice)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxes & Fees</Text>
            <Text style={styles.priceValue}>{formatCurrency(taxAmount)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={[styles.priceRow, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>
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
      <Modal
        visible={showManufacturers}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowManufacturers(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fullModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Manufacturer</Text>
              <TouchableOpacity onPress={() => setShowManufacturers(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {loadingManufacturers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
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
                data={vehicleData}
                keyExtractor={(item) => `manufacturer_${item.id}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => handleManufacturerSelect(item)}
                  >
                    <Thumbnail
                      uri={item.thumb}
                      defaultIcon="directions-car"
                      style={styles.listThumbnail}
                    />
                    <Text style={styles.listItemText}>{item.name}</Text>
                    <Icon name="chevron-right" size={20} color="#999" />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Icon name="error-outline" size={40} color="#ccc" />
                    <Text style={styles.emptyStateText}>No manufacturers available</Text>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Model</Text>
              <TouchableOpacity onPress={() => setShowModels(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {selectedVehicle.manufacturer?.models?.length > 0 ? (
              <FlatList
                data={selectedVehicle.manufacturer.models}
                keyExtractor={(item) => `model_${item.id}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => handleModelSelect(item)}
                  >
                    <Thumbnail
                      uri={item.thumb}
                      defaultIcon="directions-car"
                      style={styles.listThumbnail}
                    />
                    <Text style={styles.listItemText}>{item.name}</Text>
                    <Icon name="chevron-right" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyState}>
                <Icon name="error-outline" size={40} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  {selectedVehicle.manufacturer
                    ? "No models available for this manufacturer"
                    : "Please select a manufacturer first"}
                </Text>
              </View>
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  selectedText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    flex: 1,
    marginLeft: 12,
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
    borderColor: '#6C63FF',
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
    width: 24,
    height: 24,
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
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
    backgroundColor: '#6C63FF',
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
});

export default CheckOut;