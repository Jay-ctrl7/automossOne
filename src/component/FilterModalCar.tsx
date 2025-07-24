import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import CheckBox from '@react-native-community/checkbox';

const FilterModalCar = ({ visible, onClose }) => {
  const [filters, setFilters] = useState({
    cityId: null,
    garage: null,
    priceRange: [100, 10000],
    categories: [],
    rating: 0
  });

  // Memoize services to prevent unnecessary recreations
  const services = useMemo(() => [
    {
      id: '1',
      name: 'Location',
      description: 'Filter by location and distance',
      icon: 'map-marker',
      component: (
        <LocationFilterSection
          key="location"
          selectedCityId={filters.cityId}
          onCitySelect={(cityId) => setFilters(prev => ({ ...prev, cityId }))}
        />
      )
    },
    {
      id: '2',
      name: 'Garage Nearby',
      description: 'Filter by nearby garages and facilities',
      icon: 'wrench',
      component: <GarageFilterSection
        garageDistance={filters.garageDistance}
        onDistanceSelect={(distance) =>
          setFilters(prev => ({ ...prev, garageDistance: distance }))} />
    },
    {
      id: '3',
      name: 'Price Range',
      description: 'Set your preferred price range',
      icon: 'dollar',
      component: <PriceFilterSection key="price" />
    },
    {
      id: '4',
      name: 'Category',
      description: 'Filter by service categories',
      icon: 'list',
      component: <CategoryFilterSection key="category" />
    },
    {
      id: '5',
      name: 'Customer Ratings',
      description: 'Filter by minimum customer ratings',
      icon: 'star',
      component: <RatingFilterSection key="ratings" />
    }
  ], [filters.cityId]); // Only recreate when cityId changes

  const [selectedService, setSelectedService] = useState(services[0]);

  const handleServicePress = (service) => {
    setSelectedService(service);
  };

  const handleResetFilters = () => {
    setFilters({
      cityId: null,
      garage: null,
      priceRange: [100, 10000],
      categories: [],
      rating: 0
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="times" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.mainContainer}>
            <View style={styles.listContainer}>
              <FlatList
                data={services}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.serviceItem,
                      selectedService.id === item.id && styles.selectedItem
                    ]}
                    onPress={() => handleServicePress(item)}
                  >
                    <Icon
                      name={item.icon}
                      size={16}
                      color={selectedService.id === item.id ? '#007AFF' : '#666'}
                    />
                    <Text style={[
                      styles.serviceName,
                      selectedService.id === item.id && styles.selectedText
                    ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.filterContentContainer}>
                {services.find(s => s.id === selectedService.id)?.component}
              </View>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={handleResetFilters}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.applyButton]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, styles.applyButtonText]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const LocationFilterSection = ({ selectedCityId, onCitySelect }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ENDPOINTS.master.city);
      if (response.data.status === 1) {
        setCities(response.data.data);
      }
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch cities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  if (loading) {
    return (
      <View style={localStyles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={localStyles.loadingText}>Loading cities...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={localStyles.errorContainer}>
        <Text style={localStyles.errorText}>Error loading cities</Text>
        <TouchableOpacity onPress={fetchCities}>
          <Text style={localStyles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      <Text style={localStyles.sectionTitle}>Available Cities</Text>
      <FlatList
        data={cities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              localStyles.cityItem,
              selectedCityId === item.id && localStyles.selectedCityItem
            ]}
            onPress={() => onCitySelect(item.id)}
          >
            <Text style={localStyles.cityText}>{item.name}</Text>
            {selectedCityId === item.id && (
              <Icon name="check" size={16} color="#007AFF" />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
// Local styles for LocationFilterSection
const localStyles = StyleSheet.create({
  container: { flex: 1, paddingTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  cityItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCityItem: { backgroundColor: '#f0f7ff' },
  cityText: { fontSize: 15 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', marginBottom: 10 },
  retryText: { color: '#007AFF' },
});

// Other filter sections remain unchanged
const GarageFilterSection = ({ onDistanceChange }) => {
  const garageOptions = [
    { id: '1', name: 'Within 5 km', value: 5 },
    { id: '2', name: 'Within 10 km', value: 10 },
    { id: '3', name: 'Within 25 km', value: 25 },
    { id: '4', name: 'Any distance', value: null },
  ];

  const [selectedDistance, setSelectedDistance] = useState(null);

  const handleSelection = (value) => {
    setSelectedDistance(value);
    if (onDistanceChange) {
      onDistanceChange(value);
    }
  };

  return (
    <View style={garageStyles.container}>
      <Text style={garageStyles.sectionTitle}>Maximum Distance</Text>
      {garageOptions.map((option) => (
        <TouchableOpacity 
          key={option.id}
          style={garageStyles.optionContainer}
          onPress={() => handleSelection(option.value)}
          activeOpacity={0.7}
        >
          <CheckBox
            value={selectedDistance === option.value}
            onValueChange={() => handleSelection(option.value)}
            tintColors={{
              true: '#4630EB',
              false: '#A5A5A5'
            }}
            style={garageStyles.checkbox}
          />
          <Text style={garageStyles.optionText}>{option.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const garageStyles = {
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  checkbox: {
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
  },
};





const PriceFilterSection = () => <View><Text>Price filter content</Text></View>;
const CategoryFilterSection = () => <View><Text>Category filter content</Text></View>;
const RatingFilterSection = () => <View><Text>Rating filter content</Text></View>;







// Main styles
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  listContainer: {
    width: '35%',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingRight: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedItem: {
    backgroundColor: '#f0f7ff',
  },
  serviceName: {
    fontSize: 15,
    color: '#666',
    paddingLeft: 4,
  },
  selectedText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  detailsContainer: {
    flex: 1,
    paddingLeft: 20,
  },
  filterContentContainer: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: 'white',
  },
});

export default FilterModalCar;