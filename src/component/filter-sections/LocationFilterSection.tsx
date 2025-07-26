import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import PropTypes from 'prop-types';
import { ENDPOINTS } from '../../config/api';

const LocationFilterSection = ({ selectedCity, onCitySelect }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchCities = async () => {
      try {
        setLoading(true);
        const response = await axios.get(ENDPOINTS.master.city, {
          signal: controller.signal
        });
        
        if (isMounted && response?.data?.status === 1) {
          setCities(response.data.data);
        }
      } catch (err) {
        if (isMounted && !axios.isCancel(err)) {
          setError('Failed to load cities. Please try again.');
          console.error('City fetch error:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCities();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // The useEffect will run again because error state changed
  };

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={handleRetry} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Select City</Text>
      <FlatList
        data={cities}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CityItem 
            item={item}
            isSelected={selectedCity === item.id}
            onSelect={onCitySelect}
          />
        )}
        ListEmptyComponent={<EmptyListView />}
      />
    </View>
  );
};

// Sub-components for better readability and reusability
const LoadingView = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="small" color="#007AFF" />
    <Text style={styles.loadingText}>Loading cities...</Text>
  </View>
);

const ErrorView = ({ error, onRetry }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity onPress={onRetry}>
      <Text style={styles.retryText}>Tap to retry</Text>
    </TouchableOpacity>
  </View>
);

const CityItem = ({ item, isSelected, onSelect }) => (
  <TouchableOpacity
    style={[styles.cityItem, isSelected && styles.selectedCityItem]}
    onPress={() => onSelect(item.id)}
  >
    <Text style={styles.cityText}>{item.name}</Text>
    {isSelected && <Icon name="check" size={16} color="#007AFF" />}
  </TouchableOpacity>
);

const EmptyListView = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>No cities available</Text>
  </View>
);

// Prop type validation
LocationFilterSection.propTypes = {
  selectedCity: PropTypes.number,
  onCitySelect: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 10 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 15 
  },
  cityItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCityItem: { 
    backgroundColor: '#f0f7ff' 
  },
  cityText: { 
    fontSize: 15 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: 10 
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  errorText: { 
    color: 'red', 
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryText: { 
    color: '#007AFF',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});

export default LocationFilterSection;