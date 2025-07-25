import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import CheckBox from '@react-native-community/checkbox';

const FilterModalCar = ({ 
  visible, 
  onClose,
  onApplyFilters,
  initialFilters,
  onResetFilters,
  hasActiveFilters
}) => {
  // Initialize filters state with default values
  const [filters, setFilters] = useState({
    city: initialFilters?.city || null,
    distance: initialFilters?.distance || null,
    price: initialFilters?.price || null,
    categories: initialFilters?.categories || [],
    subcategories: initialFilters?.subcategories || [],
    carSizes: initialFilters?.carSizes || ['small', 'medium', 'extra large', 'premium'],
  });

  useEffect(() => {
    console.log("Filter modal", filters);
  }, [filters]);

  // Check if any filters are active (excluding defaults)
  const hasLocalActiveFilters = useMemo(() => {
    const defaults = {
      city: null,
      distance: null,
      price: null,
      categories: [],
      subcategories: [],
      carSizes: ['small', 'medium', 'extra large', 'premium'],
    };

    return (
      filters.city !== defaults.city ||
      filters.distance !== defaults.distance ||
      filters.price !== defaults.price ||
      filters.categories.length > 0 ||
      filters.subcategories.length > 0 ||
      JSON.stringify(filters.carSizes) !== JSON.stringify(defaults.carSizes)
    );
  }, [filters]);

  // Reset all filters
  const handleReset = () => {
    const defaultFilters = {
      city: null,
      distance: null,
      price: null,
      categories: [],
      subcategories: [],
      carSizes: ['small', 'medium', 'extra large', 'premium'],
    };
    
    setFilters(defaultFilters);
    onResetFilters();
  };

  // Apply filters handler
  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  // Memoize services with all relevant dependencies
  const services = useMemo(() => [
    {
      id: '1',
      name: 'Location',
      description: 'Filter by location and distance',
      icon: 'map-marker',
      component: (
        <LocationFilterSection
          key="location"
          selectedCity={filters.city}
          onCitySelect={(city) => setFilters(prev => ({ ...prev, city }))}
        />
      )
    },
    {
      id: '2',
      name: 'Garage Distance',
      description: 'Filter by nearby garages',
      icon: 'wrench',
      component: (
        <GarageFilterSection
          key="garage"
          selectedDistance={filters.distance}
          onDistanceSelect={(distance) => 
            setFilters(prev => ({ ...prev, distance }))
          }
        />
      )
    },
    {
      id: '3',
      name: 'Price Range',
      description: 'Set your preferred price range',
      icon: 'rupee',
      component: (
        <PriceFilterSection
          key="price"
          selectedPrice={filters.price}
          onPriceSelect={(price) => 
            setFilters(prev => ({ ...prev, price }))
          }
        />
      )
    },
    {
      id: '4',
      name: 'Services',
      description: 'Filter by service categories',
      icon: 'list',
      component: (
        <CategoryFilterSection
          key="category"
          selectedCategories={filters.categories}
          selectedSubcategories={filters.subcategories}
          onCategorySelect={(categoryId, isSelected) => {
            setFilters(prev => {
              const newCategories = isSelected
                ? [...prev.categories, categoryId]
                : prev.categories.filter(id => id !== categoryId);
              
              // If deselecting a category, deselect all its subcategories
              let newSubcategories = [...prev.subcategories];
              if (!isSelected) {
                // This would need access to the categories data - you might need to pass it
                // or handle this logic in the parent component
              }
              
              return {
                ...prev,
                categories: newCategories,
                subcategories: newSubcategories
              };
            });
          }}
          onSubcategorySelect={(subcategoryId, isSelected) => {
            setFilters(prev => ({
              ...prev,
              subcategories: isSelected
                ? [...prev.subcategories, subcategoryId]
                : prev.subcategories.filter(id => id !== subcategoryId)
            }));
          }}
        />
      )
    },
    {
      id: '5',
      name: 'Car Sizes',
      description: 'Filter by car sizes',
      icon: 'car',
      component: (
        <CarSizeFilterSection
          key="carSizes"
          selectedSizes={filters.carSizes}
          onSizeSelect={(size, isSelected) => {
            setFilters(prev => ({
              ...prev,
              carSizes: isSelected
                ? [...prev.carSizes, size]
                : prev.carSizes.filter(s => s !== size)
            }));
          }}
        />
      )
    }
  ], [filters]);

  const [selectedServiceId, setSelectedServiceId] = useState('1');

  const handleServicePress = (serviceId) => {
    setSelectedServiceId(serviceId);
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

          <View style={styles.mainContainer}>
            {/* Left Container */}
            <View style={styles.listContainer}>
              <FlatList
                data={services}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.serviceItem,
                      selectedServiceId === item.id && styles.selectedItem
                    ]}
                    onPress={() => handleServicePress(item.id)}
                  >
                    <Icon
                      name={item.icon}
                      size={16}
                      color={selectedServiceId === item.id ? '#007AFF' : '#666'}
                    />
                    <Text style={[
                      styles.serviceName,
                      selectedServiceId === item.id && styles.selectedText
                    ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            {/* Right container */}
            <View style={styles.detailsContainer}>
              <View style={styles.filterContentContainer}>
                {services.find(s => s.id === selectedServiceId)?.component}
              </View>
            </View>
          </View>

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
    </Modal>
  );
};

const LocationFilterSection = ({ selectedCity, onCitySelect }) => {
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
      <Text style={localStyles.sectionTitle}>Select City</Text>
      <FlatList
        data={cities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              localStyles.cityItem,
              selectedCity === item.id && localStyles.selectedCityItem
            ]}
            onPress={() => onCitySelect(item.id)}
          >
            <Text style={localStyles.cityText}>{item.name}</Text>
            {selectedCity === item.id && (
              <Icon name="check" size={16} color="#007AFF" />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const GarageFilterSection = ({ selectedDistance, onDistanceSelect }) => {
  const distanceOptions = [
    { id: '5', name: 'Within 5 km', value: 5 },
    { id: '10', name: 'Within 10 km', value: 10 },
    { id: '25', name: 'Within 25 km', value: 25 },
    { id: '50', name: 'Within 50 km', value: 50 },
    { id: 'any', name: 'Any distance', value: null },
  ];

  return (
    <View style={garageStyles.container}>
      <Text style={garageStyles.sectionTitle}>Maximum Distance</Text>
      {distanceOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            garageStyles.optionContainer,
            selectedDistance === option.value && garageStyles.selectedOption
          ]}
          onPress={() => onDistanceSelect(option.value)}
          activeOpacity={0.7}
        >
          <CheckBox
            value={selectedDistance === option.value}
            onValueChange={() => onDistanceSelect(option.value)}
            tintColors={{
              true: '#007AFF',
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

const PriceFilterSection = ({ selectedPrice, onPriceSelect }) => {
  const priceOptions = [
    { id: '1', name: '₹100 - ₹1000', value: [100, 1000] },
    { id: '2', name: '₹1000 - ₹3000', value: [1000, 3000] },
    { id: '3', name: '₹3000 - ₹7000', value: [3000, 7000] },
    { id: '4', name: '₹7000 - ₹15000', value: [7000, 15000] },
    { id: '5', name: '₹15000 - Above', value: [15000, 50000] },
    { id: 'any', name: 'Any price', value: null },
  ];

  const isPriceSelected = (priceValue) => {
    if (!selectedPrice && !priceValue) return true;
    if (!selectedPrice || !priceValue) return false;
    return (
      selectedPrice[0] === priceValue[0] && 
      selectedPrice[1] === priceValue[1]
    );
  };

  return (
    <View style={priceStyles.container}>
      <Text style={priceStyles.sectionTitle}>Price Range</Text>
      {priceOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            priceStyles.optionContainer,
            isPriceSelected(option.value) && priceStyles.selectedOption
          ]}
          onPress={() => onPriceSelect(option.value)}
          activeOpacity={0.7}
        >
          <CheckBox
            value={isPriceSelected(option.value)}
            onValueChange={() => onPriceSelect(option.value)}
            tintColors={{
              true: '#007AFF',
              false: '#A5A5A5'
            }}
            style={priceStyles.checkbox}
          />
          <Text style={priceStyles.optionText}>{option.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const CategoryFilterSection = ({ 
  selectedCategories, 
  selectedSubcategories,
  onCategorySelect,
  onSubcategorySelect
}) => {
  const [categories, setCategories] = useState([]);
  const [expandedParents, setExpandedParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ENDPOINTS.master.category);
      if (response.data.status === 1) {
        setCategories(response.data.data);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleParent = (parentId) => {
    setExpandedParents(prev =>
      prev.includes(parentId)
        ? prev.filter(id => id !== parentId)
        : [...prev, parentId]
    );
  };

  const isParentSelected = (parentId) => {
    return selectedCategories.includes(parentId);
  };

  const isChildSelected = (childId) => {
    return selectedSubcategories.includes(childId);
  };

  const handleParentSelect = (parentId) => {
    const isSelected = isParentSelected(parentId);
    onCategorySelect(parentId, !isSelected);
    
    // When selecting parent, select all its children
    if (!isSelected) {
      const parent = categories.find(cat => cat.id === parentId);
      if (parent && parent.child) {
        parent.child.forEach(child => {
          if (!isChildSelected(child.id)) {
            onSubcategorySelect(child.id, true);
          }
        });
      }
    }
    // When deselecting parent, deselect all its children
    else {
      const parent = categories.find(cat => cat.id === parentId);
      if (parent && parent.child) {
        parent.child.forEach(child => {
          if (isChildSelected(child.id)) {
            onSubcategorySelect(child.id, false);
          }
        });
      }
    }
  };

  const handleChildSelect = (childId, parentId) => {
    const isSelected = isChildSelected(childId);
    onSubcategorySelect(childId, !isSelected);
    
    // When selecting a child, select its parent if not already selected
    if (!isSelected && !isParentSelected(parentId)) {
      onCategorySelect(parentId, true);
    }
    
    // When deselecting last child, deselect parent
    if (isSelected) {
      const parent = categories.find(cat => cat.id === parentId);
      if (parent && parent.child) {
        const hasOtherSelectedChildren = parent.child.some(
          child => child.id !== childId && isChildSelected(child.id)
        );
        if (!hasOtherSelectedChildren) {
          onCategorySelect(parentId, false);
        }
      }
    }
  };

  const renderCategoryItem = (item, isChild = false) => (
    <TouchableOpacity
      style={[
        isChild ? categoryStyles.childItem : categoryStyles.parentItem,
        (isChild ? isChildSelected(item.id) : isParentSelected(item.id)) &&
        categoryStyles.selectedItem
      ]}
      onPress={() =>
        isChild
          ? handleChildSelect(item.id, item.parent_id)
          : handleParentSelect(item.id)
      }
    >
      <CheckBox
        value={isChild ? isChildSelected(item.id) : isParentSelected(item.id)}
        onValueChange={() =>
          isChild
            ? handleChildSelect(item.id, item.parent_id)
            : handleParentSelect(item.id)
        }
        tintColors={{ true: '#007AFF', false: '#A5A5A5' }}
      />
      <View style={categoryStyles.textContainer}>
        <Text style={categoryStyles.categoryText}>{item.name}</Text>
      </View>
      {!isChild && item.child && item.child.length > 0 && (
        <Icon
          name={expandedParents.includes(item.id) ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#666"
          onPress={() => toggleParent(item.id)}
        />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={categoryStyles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={categoryStyles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={categoryStyles.errorContainer}>
        <Text style={categoryStyles.errorText}>Error loading categories</Text>
        <TouchableOpacity onPress={fetchCategories}>
          <Text style={categoryStyles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={categoryStyles.container}>
      <Text style={categoryStyles.sectionTitle}>Select Services</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={categoryStyles.categoryContainer}>
            {renderCategoryItem(item)}

            {expandedParents.includes(item.id) && item.child && (
              <View style={categoryStyles.childrenContainer}>
                {item.child.map(child => (
                  <View key={child.id} style={categoryStyles.childWrapper}>
                    {renderCategoryItem(child, true)}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};

const CarSizeFilterSection = ({ selectedSizes, onSizeSelect }) => {
  const carSizes = [
    { id: 'small', name: 'Small' },
    { id: 'medium', name: 'Medium' },
    { id: 'extra large', name: 'Extra Large' },
    { id: 'premium', name: 'Premium' },
  ];

  return (
    <View style={carSizeStyles.container}>
      <Text style={carSizeStyles.sectionTitle}>Select Car Sizes</Text>
      {carSizes.map((size) => (
        <TouchableOpacity
          key={size.id}
          style={carSizeStyles.optionContainer}
          onPress={() => onSizeSelect(size.id, !selectedSizes.includes(size.id))}
          activeOpacity={0.7}
        >
          <CheckBox
            value={selectedSizes.includes(size.id)}
            onValueChange={() => onSizeSelect(size.id, !selectedSizes.includes(size.id))}
            tintColors={{
              true: '#007AFF',
              false: '#A5A5A5'
            }}
            style={carSizeStyles.checkbox}
          />
          <Text style={carSizeStyles.optionText}>{size.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Local styles for components
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

const garageStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginVertical: 4,
  },
  selectedOption: {
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
  },
  checkbox: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 15,
  },
});

const priceStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginVertical: 4,
  },
  selectedOption: {
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
  },
  checkbox: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 15,
  },
});

const categoryStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  retryText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  categoryContainer: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  parentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
  },
  childWrapper: {
    marginLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#ddd',
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 24,
    backgroundColor: '#f8f8f8',
  },
  selectedItem: {
    backgroundColor: '#e1f0ff',
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  childrenContainer: {
    marginTop: 4,
  },
});

const carSizeStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    marginRight: 8,
  },
  optionText: {
    fontSize: 15,
  },
});

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
    paddingLeft: 15,
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
});

export default FilterModalCar;