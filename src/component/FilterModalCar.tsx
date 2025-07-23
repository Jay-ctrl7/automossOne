import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import React, { useEffect, useState, useMemo } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import Slider from '@react-native-community/slider';
import CheckBox from '@react-native-community/checkbox';
import { ENDPOINTS } from '../config/api';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const FilterModalCar = ({ 
  visible, 
  onClose, 
  onApplyFilters, 
  initialFilters,
  onResetFilters,
  hasActiveFilters 
}) => {
  // State for all filters with proper initialization
  const [filters, setFilters] = useState({
    city: initialFilters.city || null,
    distance: initialFilters.distance || 50,
    price: initialFilters.price || [100, 10000],
    categories: initialFilters.categories || [],
    subcategories: initialFilters.subcategories || [],
    carSizes: initialFilters.carSizes || ['small', 'medium', 'extra large', 'premium'],
  });

  // Supporting state
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [showCityModal, setShowCityModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized selected city name for display
  const selectedCityName = useMemo(() => {
    return filters.city 
      ? cities.find(c => c.id === filters.city)?.name 
      : '';
  }, [filters.city, cities]);

  // Fetch cities data
  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ENDPOINTS.master.city);

      if (response.data.status === 1) {
        setCities(response.data.data);
        setFilteredCities(response.data.data);
      } else {
        setError('Failed to fetch cities');
      }
    } catch (error) {
      setError(error.message);
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories data
  const fetchCategories = async () => {
    try {
      const response = await axios.get(ENDPOINTS.master.category);
      if (response.data.status === 1) {
        setCategories(response.data.data);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Filter cities based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCities(cities);
    } else {
      const filtered = cities.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [searchQuery, cities]);

  // Initialize data
  useEffect(() => {
    fetchCities();
    fetchCategories();
  }, []);

  // Category expansion toggle
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Handle category selection
  const handleCategorySelect = (categoryId, isSelected) => {
    const newCategories = isSelected
      ? [...filters.categories, categoryId]
      : filters.categories.filter(id => id !== categoryId);

    // If deselecting a category, deselect all its subcategories
    let newSubcategories = [...filters.subcategories];
    if (!isSelected) {
      const category = categories.find(cat => cat.id === categoryId);
      if (category?.child) {
        newSubcategories = newSubcategories.filter(
          id => !category.child.some(sub => sub.id === id)
        );
      }
    }

    setFilters(prev => ({
      ...prev,
      categories: newCategories,
      subcategories: newSubcategories
    }));
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategoryId, isSelected) => {
    setFilters(prev => ({
      ...prev,
      subcategories: isSelected
        ? [...prev.subcategories, subcategoryId]
        : prev.subcategories.filter(id => id !== subcategoryId)
    }));
  };

  // City selection handler
  const selectCity = (city) => {
    setFilters(prev => ({ ...prev, city: city.id }));
    setShowCityModal(false);
    setSearchQuery('');
  };

  // Clear city selection
  const clearCitySelection = () => {
    setFilters(prev => ({ ...prev, city: null }));
  };

  // Apply filters handler
  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  // Reset all filters
  const handleReset = () => {
    const defaultFilters = {
      city: null,
      distance: 50,
      price: [100, 10000],
      categories: [],
      subcategories: [],
      carSizes: ['small', 'medium', 'extra large', 'premium'],
    };
    
    setFilters(defaultFilters);
    setExpandedCategories([]);
    onResetFilters();
  };

  // Check if any filters are active (excluding defaults)
  const hasLocalActiveFilters = useMemo(() => {
    const defaults = {
      city: null,
      distance: 50,
      price: [100, 10000],
      categories: [],
      subcategories: [],
      carSizes: ['small', 'medium', 'extra large', 'premium'],
    };

    return (
      filters.city !== defaults.city ||
      filters.distance !== defaults.distance ||
      filters.price[0] !== defaults.price[0] ||
      filters.price[1] !== defaults.price[1] ||
      filters.categories.length > 0 ||
      filters.subcategories.length > 0 ||
      JSON.stringify(filters.carSizes) !== JSON.stringify(defaults.carSizes)
    );
  }, [filters]);

  // City Modal Component
 const CitySelectionModal = ({ 
  visible, 
  onClose, 
  cities = [], 
  selectedCityId,
  onSelectCity
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState(cities);

  // Filter cities based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCities(cities);
    } else {
      const filtered = cities.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [searchQuery, cities]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={cityStyles.modalContainer}>
        <View style={cityStyles.modalContent}>
          <View style={cityStyles.modalHeader}>
            <Text style={cityStyles.modalTitle}>Select City</Text>
            <TouchableOpacity onPress={onClose} style={cityStyles.closeButton}>
              <Icon name="times" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Search Bar - Now fully controlled within this component */}
          <View style={cityStyles.searchContainer}>
            <Icon name="search" size={16} color="#999" style={cityStyles.searchIcon} />
            <TextInput
              style={cityStyles.searchInput}
              placeholder="Search for a city..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={cityStyles.clearSearchButton}
              >
                <Icon name="times-circle" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* City List */}
          <ScrollView style={cityStyles.cityListContainer}>
            {filteredCities.length === 0 ? (
              <View style={cityStyles.noResultsContainer}>
                <Icon name="exclamation-circle" size={24} color="#999" />
                <Text style={cityStyles.noResultsText}>
                  {searchQuery ? 'No matching cities found' : 'No cities available'}
                </Text>
              </View>
            ) : (
              filteredCities.map((city) => (
                <TouchableOpacity
                  key={city.id}
                  style={[
                    cityStyles.cityItem,
                    selectedCityId === city.id && cityStyles.selectedCityItem
                  ]}
                  onPress={() => {
                    onSelectCity(city);
                    onClose();
                  }}
                >
                  <Text style={cityStyles.cityName}>{city.name}</Text>
                  {selectedCityId === city.id && (
                    <Icon name="check" size={16} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
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
            <View style={styles.headerActions}>
              {(hasLocalActiveFilters || hasActiveFilters) && (
                <TouchableOpacity onPress={handleReset} style={styles.resetHeaderButton}>
                  <Text style={styles.resetHeaderText}>Reset</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose}>
                <Icon name="times" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.filterOptions}>
            {/* City Selection */}
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Location</Text>
                {filters.city && (
                  <TouchableOpacity onPress={clearCitySelection}>
                    <Text style={styles.clearSectionText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={[
                  styles.citySelectionButton,
                  filters.city && styles.activeFilterField
                ]}
                onPress={() => setShowCityModal(true)}
              >
                <Text style={[
                  selectedCityName ? styles.citySelectedText : styles.cityPlaceholderText,
                  filters.city && styles.activeFilterText
                ]}>
                  {selectedCityName || 'Select a city'}
                </Text>
                <Icon 
                  name="chevron-down" 
                  size={16} 
                  color={filters.city ? '#007AFF' : '#888'} 
                />
              </TouchableOpacity>
            </View>

            {/* Garage Distance Slider */}
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Garage Distance (km)</Text>
                {filters.distance !== 50 && (
                  <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, distance: 50 }))}>
                    <Text style={styles.clearSectionText}>Reset</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={filters.distance}
                onValueChange={(value) => setFilters(prev => ({ ...prev, distance: value }))}
                step={1}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#007AFF"
              />
              <Text style={styles.sliderValue}>{filters.distance} km</Text>
            </View>

            {/* Price Range Slider */}
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Price Range (₹)</Text>
                {(filters.price[0] !== 100 || filters.price[1] !== 10000) && (
                  <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, price: [100, 10000] }))}>
                    <Text style={styles.clearSectionText}>Reset</Text>
                  </TouchableOpacity>
                )}
              </View>
              <MultiSlider
                values={filters.price}
                sliderLength={350}
                containerStyle={{ marginLeft: 10 }}
                onValuesChange={(values) => setFilters(prev => ({ ...prev, price: values }))}
                min={0}
                max={99000}
                step={500}
                allowOverlap
                snapped
                minMarkerOverlapDistance={40}
                customMarker={() => (
                  <View style={styles.customMarker}>
                    <View style={styles.customMarkerInner} />
                  </View>
                )}
                selectedStyle={{ backgroundColor: '#007AFF' }}
                unselectedStyle={{ backgroundColor: '#d3d3d3' }}
              />
              <View style={styles.priceRangeValues}>
                <Text style={styles.sliderValue}>₹{filters.price[0]}</Text>
                <Text style={styles.sliderValue}>₹{filters.price[1]}</Text>
              </View>
            </View>

            {/* Category Selection */}
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Services</Text>
                {(filters.categories.length > 0 || filters.subcategories.length > 0) && (
                  <TouchableOpacity onPress={() => setFilters(prev => ({ 
                    ...prev, 
                    categories: [], 
                    subcategories: [] 
                  }))}>
                    <Text style={styles.clearSectionText}>Clear all</Text>
                  </TouchableOpacity>
                )}
              </View>
              {categories.map((category) => (
                <View key={category.id} style={[
                  styles.categoryContainer,
                  (filters.categories.includes(category.id) || 
                   category.child.some(sub => filters.subcategories.includes(sub.id))) && 
                  styles.activeCategoryContainer
                ]}>
                  <View style={styles.categoryHeader}>
                    <CheckBox
                      value={filters.categories.includes(category.id)}
                      onValueChange={(newValue) => handleCategorySelect(category.id, newValue)}
                      tintColors={{ true: '#007AFF', false: '#767577' }}
                    />
                    <TouchableOpacity
                      style={styles.categoryName}
                      onPress={() => toggleCategory(category.id)}
                    >
                      <Text style={[
                        styles.categoryText,
                        filters.categories.includes(category.id) && styles.activeCategoryText
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                    {category.child.length > 0 && (
                      <TouchableOpacity onPress={() => toggleCategory(category.id)}>
                        <Icon
                          name={expandedCategories.includes(category.id) ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color={filters.categories.includes(category.id) ? '#007AFF' : '#767577'}
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  {expandedCategories.includes(category.id) && category.child.length > 0 && (
                    <View style={styles.subcategoryContainer}>
                      {category.child.map((subcategory) => (
                        <View key={subcategory.id} style={styles.subcategoryItem}>
                          <CheckBox
                            value={filters.subcategories.includes(subcategory.id)}
                            onValueChange={(newValue) => handleSubcategorySelect(subcategory.id, newValue)}
                            tintColors={{ true: '#007AFF', false: '#767577' }}
                          />
                          <Text style={[
                            styles.subcategoryText,
                            filters.subcategories.includes(subcategory.id) && styles.activeSubcategoryText
                          ]}>
                            {subcategory.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={styles.buttonText}>Reset All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.applyButton, 
                     !hasLocalActiveFilters && styles.disabledButton]}
              onPress={handleApply}
              disabled={!hasLocalActiveFilters}
            >
              <Text style={[styles.buttonText, styles.applyButtonText]}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* City Selection Modal */}
      <CitySelectionModal
  visible={showCityModal}
  onClose={() => setShowCityModal(false)}
  cities={cities}
  selectedCityId={filters.city}
  onSelectCity={(city) => setFilters(prev => ({ ...prev, city: city.id }))}
/>
    </Modal>
  );
};

// Enhanced styles
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
    maxHeight: '80%',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetHeaderButton: {
    marginRight: 20,
  },
  resetHeaderText: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterOptions: {
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearSectionText: {
    color: '#007AFF',
    fontSize: 14,
  },
  citySelectionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  activeFilterField: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  activeFilterText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  cityPlaceholderText: {
    color: '#999',
  },
  citySelectedText: {
    color: '#333',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    color: '#666',
  },
  priceRangeValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  categoryContainer: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
  },
  activeCategoryContainer: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    flex: 1,
    marginLeft: 10,
  },
  categoryText: {
    fontSize: 15,
    color: '#333',
  },
  activeCategoryText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  subcategoryContainer: {
    marginTop: 10,
    marginLeft: 30,
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subcategoryText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  activeSubcategoryText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#eee',
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: 'white',
  },
  customMarker: {
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMarkerInner: {
    height: 15,
    width: 15,
    borderRadius: 7.5,
    backgroundColor: '#007AFF',
  },
});

// City modal styles (unchanged from your original)
const cityStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    maxHeight: '70%',
    overflow: 'hidden',
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
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  clearSearchButton: {
    padding: 8,
    marginLeft: 8,
  },
  cityListContainer: {
    maxHeight: 300,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedCityItem: {
    backgroundColor: '#f5f9ff',
  },
  cityName: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  noResultsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
});

export default FilterModalCar;