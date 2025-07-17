import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import { debounce } from 'lodash';
import DropDownPicker from 'react-native-dropdown-picker';
import CategoryDropdownCheckbox from './CategoryDropdownCheckbox';
import FilterModalCar from './FilterModalCar';
import { ENDPOINTS } from '../config/api';

const ServiceDetails = () => {
  /* ------------------ STATE ------------------ */
  const [details, setDetails] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});
  const [searchText, setSearchText] = useState('');
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [categories, setCategories] = useState([{ id: 'all', name: 'All' }]);
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState({
    id: 19,
    name: 'Bhubaneswar',
  });
  const [categoriesAndSubCategories, setCategoriesAndSubCategories] = useState([]);
  const [showFilterModal1, setShowFilterModal1] = useState(false);
  
  // Active filters state
  const [activeFilters, setActiveFilters] = useState({
    city: 19, // Default to Bhubaneswar
    distance: 50,
    price: [100, 10000],
    categories: [],
    subcategories: [],
    carSizes: ['small', 'medium', 'extra large', 'premium'],
    filterActive: false,
  });

  const route = useRoute();
  const { sId, sName } = route.params || {};
  const categoryScrollRef = useRef(null);

  /* ------------------ SCROLL TO CATEGORY ------------------ */
  const scrollToSelectedCategory = useCallback(() => {
    if (!selectedCategory || !categoryScrollRef.current) return;
    
    const index = categories.findIndex(cat => cat.name === selectedCategory);
    if (index === -1) return;

    const itemWidth = 100;
    const position = index * (itemWidth + 10);
    
    categoryScrollRef.current.scrollTo({
      x: position,
      animated: true,
    });
  }, [selectedCategory, categories]);

  useEffect(() => {
    scrollToSelectedCategory();
  }, [selectedCategory, scrollToSelectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToSelectedCategory();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  /* ------------------ API HELPERS ------------------ */
  const fetchAllServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post(
        ENDPOINTS.master.packageMaster.list,
        {
          city_id: activeFilters.city,
          min: activeFilters.price[0],
          max: activeFilters.price[1],
          car_size: activeFilters.carSizes,
          distance: activeFilters.distance,
        }
      );
      
      if (data.status === 1) {
        const serviceData = data.data || [];
        setDetails(serviceData);
        setFilteredDetails(serviceData);
        const initialExpandedState = {};
        serviceData.forEach(item => (initialExpandedState[item.id] = false));
        setExpandedCards(initialExpandedState);
      } else {
        setError(data.message || 'No services found for this area');
        setDetails([]);
        setFilteredDetails([]);
      }
    } catch (err) {
      console.error('Error fetching all services:', err);
      setError('Unable to load services. Please check your connection and try again.');
      setDetails([]);
      setFilteredDetails([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarServiceById = async (categoryId) => {
    if (!categoryId) return;
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post(
        ENDPOINTS.master.packageMaster.list,
        {
          city_id: activeFilters.city,
          category_id: categoryId,
          min: activeFilters.price[0],
          max: activeFilters.price[1],
          car_size: activeFilters.carSizes,
          distance: activeFilters.distance,
        }
      );
      
      if (data.status === 1) {
        const serviceData = data.data || [];
        setDetails(serviceData);
        setFilteredDetails(serviceData);
        const initialExpandedState = {};
        serviceData.forEach(item => (initialExpandedState[item.id] = false));
        setExpandedCards(initialExpandedState);
        
        if (serviceData.length === 0) {
          setError('No services available for this category in your area');
        }
      } else {
        setError(data.message || 'No services found for this category');
        setDetails([]);
        setFilteredDetails([]);
      }
    } catch (err) {
      console.log('Error fetching category services:', err);
      console.log(err.response?.data );
      setError('Unable to load services for this category. Please try again.');
      setDetails([]);
      setFilteredDetails([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarService = async () => {
    try {
      const { data } = await axios.get(ENDPOINTS.master.category);
      if (data.status === 1) {
        const transformed = [
          { id: 'all', name: 'All' },
          ...data.data.map(item => ({
            id: item.id,
            name: item.name,
            thumb: item.thumb,
          })),
        ];
        setCategories(transformed);
        setCategoriesAndSubCategories(
          data.data.map(c => ({
            ...c,
            isSubcategory: false,
            subcategories: c.child || [],
          }))
        );
        if (sName && sName !== 'All') {
          const exists = transformed.some(c => c.name === sName);
          setSelectedCategory(exists ? sName : 'All');
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchCities = async () => {
    try {
      const { data } = await axios.get(ENDPOINTS.master.city);
      if (data.status === 1) setCities(data.data);
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  };

  /* ------------------ EFFECTS ------------------ */
  useEffect(() => {
    fetchCarService();
    fetchCities();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredDetails(details);
    } else {
      const filtered = details.filter(item => {
        const searchLower = searchText.toLowerCase();
        return (
          (item.name && item.name.toLowerCase().includes(searchLower)) ||
          (item.info && item.info.toLowerCase().includes(searchLower)) ||
          (item.garage && item.garage.toLowerCase().includes(searchLower))
        );
      });
      setFilteredDetails(filtered);
    }
  }, [searchText, details]);

  // Fetch services when filters or category changes
  useEffect(() => {
    if (categories.length > 1) {
      if (sName && sName !== 'All' && sId) {
        const exists = categories.some(c => c.name === sName);
        exists ? fetchCarServiceById(sId) : fetchAllServices();
      } else {
        fetchAllServices();
      }
    }
  }, [categories, sId, sName, activeFilters]);

  /* ------------------ HANDLERS ------------------ */
  const handleCategoryPress = (categoryName) => {
    setSelectedCategory(categoryName);
    setError(null);
    const cat = categories.find(c => c.name === categoryName);
    
    // If category is selected in filters, clear it
    if (activeFilters.categories.length > 0) {
      setActiveFilters(prev => ({
        ...prev,
        categories: [],
        subcategories: [],
        filterActive: false
      }));
    }
    
    if (categoryName === 'All' || !cat || cat.id === 'all') {
      fetchAllServices();
    } else {
      fetchCarServiceById(cat.id);
    }
  };

  const toggleExpand = (id) =>
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));

  const handleFilterApply = (filters) => {
    setActiveFilters({
      ...filters,
      filterActive: true
    });
    setSelectedCategory(filters.categories.length > 0 ? 'Filtered' : 'All');
    setShowFilterModal1(false);
  };

  const handleResetFilters = () => {
    setActiveFilters({
      city: 19,
      distance: 50,
      price: [100, 10000],
      categories: [],
      subcategories: [],
      carSizes: ['small', 'medium', 'extra large', 'premium'],
      filterActive: false,
    });
    setSelectedCategory('All');
  };

  const handleRetry = () => {
    setError(null);
    if (selectedCategory === 'All') {
      fetchAllServices();
    } else {
      const cat = categories.find(c => c.name === selectedCategory);
      if (cat && cat.id !== 'all') {
        fetchCarServiceById(cat.id);
      } else {
        fetchAllServices();
      }
    }
  };

  /* ------------------ SUB-COMPONENTS ------------------ */
  const CategoryItem = ({ item, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.categoryItem, isSelected && styles.selectedCategory]}
      onPress={onPress}>
      <Text
        style={[styles.categoryText, isSelected && styles.selectedCategoryText]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const ServiceCard = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.serviceTag}>
        <Text style={styles.serviceTagText}>{item.garage || 'Service'}</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.leftContent}>
          <Text style={styles.serviceName}>{item.name || 'Service Name'}</Text>
          <Text
            style={styles.info}
            numberOfLines={expandedCards[item.id] ? undefined : 3}
            ellipsizeMode="tail">
            {item.info || 'No description available'}
          </Text>
          {item.info && item.info.length > 100 && (
            <TouchableOpacity onPress={() => toggleExpand(item.id)}>
              <Text style={styles.seeMoreText}>
                {expandedCards[item.id] ? 'See Less' : 'See More'}
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>₹{item.offer_price || '0'}</Text>
            <Text style={styles.originalPrice}>₹{item.mrp_price || '0'}</Text>
          </View>
        </View>
        <View style={styles.rightContent}>
          <View style={styles.imageContainer}>
            <Image
              source={
                item.thumb
                  ? { uri: item.thumb }
                  : require('../assets/icon/wheel.png')
              }
              style={styles.serviceImage}
            />
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>4.5⭐</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add +</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const EmptyStateMessage = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="search" size={50} color="#ccc" style={styles.emptyStateIcon} />
      <Text style={styles.emptyStateTitle}>
        {error || 'No services found'}
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {error ? 'Please try again or contact support if the problem persists.' : 
         'Try adjusting your search criteria or browse other categories'}
      </Text>
      {error && (
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#ff4444" />
      <Text style={styles.loadingText}>Loading services...</Text>
    </View>
  );

  /* ------------------ RENDER ------------------ */
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search services..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal1(true)}>
          <Icon name={activeFilters.filterActive ? 'filter-alt' : 'filter-alt-off'} 
                size={20} 
                color={activeFilters.filterActive ? '#ff4444' : '#888'} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoryContainer}>
        <ScrollView
          ref={categoryScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}>
          {categories.map(cat => (
            <CategoryItem
              key={cat.id}
              item={cat}
              isSelected={selectedCategory === cat.name}
              onPress={() => handleCategoryPress(cat.name)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.headerText}>
          {selectedCategory} ({loading ? '...' : filteredDetails.length} Results)
        </Text>
        {activeFilters.filterActive && (
          <TouchableOpacity onPress={handleResetFilters}>
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Services List */}
      <ScrollView
        style={styles.servicesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.servicesContentContainer}>
        {loading ? (
          <LoadingIndicator />
        ) : error || filteredDetails.length === 0 ? (
          <EmptyStateMessage />
        ) : (
          filteredDetails.map((item, idx) => (
            <ServiceCard key={`${item.id}-${idx}`} item={item} />
          ))
        )}
      </ScrollView>

      {/* Filter Modal */}
      <FilterModalCar
        visible={showFilterModal1}
        onClose={() => setShowFilterModal1(false)}
        onApplyFilters={handleFilterApply}
        initialFilters={activeFilters}
        onResetFilters={handleResetFilters}
        hasActiveFilters={activeFilters.filterActive}
      />
    </View>
  );
};

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchBar: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filterButton: { padding: 8, marginLeft: 8 },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryScrollContent: { paddingHorizontal: 16 },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    minWidth: 80,
  },
  selectedCategory: { backgroundColor: '#ff4444' },
  categoryText: { fontSize: 12, color: '#666', fontWeight: '500' },
  selectedCategoryText: { color: '#fff' },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  clearFiltersText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
  },
  servicesContainer: { flex: 1 },
  servicesContentContainer: { flexGrow: 1 },
  cardContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  serviceTag: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderBottomRightRadius: 8,
  },
  serviceTagText: { color: 'white', fontSize: 12, fontWeight: '500' },
  cardContent: { flexDirection: 'row', padding: 16 },
  leftContent: { flex: 1, paddingRight: 16 },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  seeMoreText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  priceContainer: { flexDirection: 'row', alignItems: 'center' },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  rightContent: { alignItems: 'center' },
  imageContainer: { position: 'relative', marginBottom: 12 },
  serviceImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  addButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  addButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default ServiceDetails;