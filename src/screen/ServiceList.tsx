import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';

import { ENDPOINTS } from '../config/api';
import FilterModalCar from '../component/FilterModalCar';
import { getAuthData } from '../utils/AuthStore';

const DEFAULT_CITY = 19; // fallback for Bhubaneswar
const DEFAULT_DISTANCE = 50;
const DEFAULT_PRICE = [100, 10000];
const DEFAULT_CAR_SIZES = ['small', 'medium', 'extra large', 'premium'];
const getDefaultFilters = () => ({
  city: DEFAULT_CITY,
  distance: DEFAULT_DISTANCE,
  price: DEFAULT_PRICE,
  categories: [],
  subcategories: [],
  carSizes: [...DEFAULT_CAR_SIZES],
  filterActive: false,
});

const ServiceList = () => {
  /* ------------------ STATE ------------------ */
  const [services, setServices] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});
  const [searchText, setSearchText] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', name: 'All' }]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerKycStatus,setCustomerKycStatus]=useState(false)

  // filters and cities
  const [activeFilters, setActiveFilters] = useState(getDefaultFilters());
  const [cities, setCities] = useState([]);
  const categoryScrollRef = useRef(null);

  const navigation = useNavigation();
  const route = useRoute();
  const { sId, sName } = route.params || {};

  const [initialCategorySet, setInitialCategorySet] = useState(false);

  /* ------------------ Category Scroll To Highlighted ------------------ */
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
    setTimeout(scrollToSelectedCategory, 5000);
  }, []);

  /* -------------------------- API HELPERS ------------------------ */
  const fetchAllServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(ENDPOINTS.master.packageMaster.list, {
        city_id: activeFilters.city,
        min: activeFilters.price[0],
        max: activeFilters.price[1],
        car_size: activeFilters.carSizes,
        distance: activeFilters.distance,
      });
      if (data.status === 1 && Array.isArray(data.data)) {
        // Group/merge service variants (by car size)
        const grouped = {};
        data.data.forEach(service => {
          if (!grouped[service.id]) {
            grouped[service.id] = {
              ...service,
              pricing: {},
              availableSizes: [],
            };
          }
          grouped[service.id].pricing[service.car_size] = {
            mrp_price: service.mrp_price,
            offer_price: service.offer_price,
          };
          if (!grouped[service.id].availableSizes.includes(service.car_size)) {
            grouped[service.id].availableSizes.push(service.car_size);
          }
        });
        const arr = Object.values(grouped).map(svc => ({
          ...svc,
          selectedSize: svc.availableSizes?.[0] ?? DEFAULT_CAR_SIZES[0],
          displayPrice: svc.pricing[svc.availableSizes?.[0]]?.offer_price ?? '0',
        }));
        setServices(arr);
        setFilteredServices(arr);
      } else {
        setServices([]);
        setFilteredServices([]);
      }
    } catch (err) {
      setError('Failed to load services');
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesWithFilters = async (categoryIds = []) => {
    setLoading(true);
    setError(null);
    try {
      const requestBody = {
        city_id: String(activeFilters.city),
        min: String(activeFilters.price[0]),
        max: String(activeFilters.price[1]),
        distance: String(activeFilters.distance),
        car_size: Array.isArray(activeFilters.carSizes)
          ? activeFilters.carSizes
          : DEFAULT_CAR_SIZES,
      };
      if (categoryIds.length > 0)
        requestBody.category_id = Array.isArray(categoryIds)
          ? categoryIds.join(',')
          : String(categoryIds);
      const response = await axios.post(
        ENDPOINTS.master.packageMaster.list,
        requestBody,
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );
      if (response.data?.status === 1 && response.data?.data) {
        // Group/merge service variants (by car size)
        const grouped = {};
        response.data.data.forEach(service => {
          if (!grouped[service.id]) {
            grouped[service.id] = {
              ...service,
              pricing: {},
              availableSizes: [],
            };
          }
          grouped[service.id].pricing[service.car_size] = {
            mrp_price: service.mrp_price,
            offer_price: service.offer_price,
          };
          if (!grouped[service.id].availableSizes.includes(service.car_size)) {
            grouped[service.id].availableSizes.push(service.car_size);
          }
        });
        const arr = Object.values(grouped).map(svc => ({
          ...svc,
          selectedSize: svc.availableSizes?.[0] ?? DEFAULT_CAR_SIZES[0],
          displayPrice: svc.pricing[svc.availableSizes?.[0]]?.offer_price ?? '0',
        }));
        setServices(arr);
        setFilteredServices(arr);
        if (arr.length === 0) setError('No services match your filters');
      } else {
        setError('No services match your filters');
        setServices([]);
        setFilteredServices([]);
      }
    } catch (error) {
      setError('Failed to apply filters');
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarCategories = async () => {
    try {
      const { data } = await axios.get(ENDPOINTS.master.category);
      if (data.status === 1) {
        const all = [{ id: 'all', name: 'All' }, ...data.data.map(item => ({
          id: item.id,
          name: item.name,
          thumb: item.thumb,
        }))];
        setCategories(all);
      }
    } catch (err) {
      // ignore error
    }
  };

  const fetchCities = async () => {
    try {
      const { data } = await axios.get(ENDPOINTS.master.city);
      if (data.status === 1) setCities(data.data);
    } catch (err) {
      // ignore error
    }
  };

  /* ------------------ EFFECTS ------------------ */

  // Initial fetch of categories and cities on mount
  useEffect(() => {
    fetchCarCategories();
    fetchCities();
  }, []);

  // Apply route param category filter only once after categories loaded
  useEffect(() => {
    if (categories.length > 1 && !initialCategorySet) {
      if (sName && sName !== 'All' && sId) {
        const exists = categories.some(c => c.name === sName);
        if (exists) {
          setSelectedCategory(sName);
          fetchServicesWithFilters([sId]);
        } else {
          fetchAllServices();
        }
      } else {
        fetchAllServices();
      }
      setInitialCategorySet(true);
    }
  }, [categories, sId, sName, initialCategorySet]);

  // After initial category is set, react only to user changes to selectedCategory or activeFilters
  useEffect(() => {
    if (!initialCategorySet) return; // Wait for initial category set

    if (activeFilters.filterActive && activeFilters.categories.length > 0) {
      fetchServicesWithFilters(activeFilters.categories);
    } else if (selectedCategory && selectedCategory !== 'All') {
      const cat = categories.find(c => c.name === selectedCategory);
      if (cat && cat.id !== 'all') {
        fetchServicesWithFilters([cat.id]);
      } else {
        fetchAllServices();
      }
    } else {
      fetchAllServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, activeFilters]);

  // Filter search text effect
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredServices(services);
    } else {
      const searchLower = searchText.toLowerCase();
      setFilteredServices(services.filter(item =>
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        (item.info && item.info.toLowerCase().includes(searchLower)) ||
        (item.garage && item.garage.toLowerCase().includes(searchLower))
      ));
    }
  }, [searchText, services]);

  /* ------------------ HANDLERS ------------------ */
  const handleCategoryPress = (categoryName) => {
    setSelectedCategory(categoryName);
    setError(null);
    // Clear filters if active when user selects category tab manually
    if (activeFilters.filterActive) {
      setActiveFilters(prev => ({
        ...getDefaultFilters(),
        city: prev.city, // preserve city if needed
      }));
    }
  };

  const toggleExpand = (id) =>
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));

  const handleFilterApply = (filters) => {
    setActiveFilters({
      ...filters,
      filterActive: (filters.categories && filters.categories.length > 0) ||
        (filters.subcategories && filters.subcategories.length > 0) ||
        !areArraysEqual(filters.price, DEFAULT_PRICE) ||
        !areArraysEqual(filters.carSizes, DEFAULT_CAR_SIZES) ||
        filters.distance !== DEFAULT_DISTANCE,
    });
    setSelectedCategory('Filtered Results');
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    setActiveFilters(getDefaultFilters());
    setSelectedCategory('All');
    setTimeout(() => fetchAllServices(), 100);
  };

  const handleRetry = () => {
    setError(null);
    if (activeFilters.filterActive) {
      fetchServicesWithFilters(activeFilters.categories);
    } else {
      fetchAllServices();
    }
  };

  const handleServiceDetails = (item) => {
    navigation.navigate('ServiceDetails', {
      itemId: item.id,
      activeFilters,
    });
  };

 const fetchCustomerInfo = async () => {
    try {
      const authData = await getAuthData();
      const token = authData?.token;
      if (!token) {
        Alert.alert("Error", "Please login again");
        return;
      }
      const response = await axios.post(ENDPOINTS.auth.customerinfo, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': `application/json`
        }
      })
      if (response.data?.data?.kyc_status === "1") {
        console.log("Kyc Data  ", response.data.data);
        setCustomerKycStatus(true);
      }
      else {
        setCustomerKycStatus(false);
        console.log("Kyc Data service List else", response.data.data);

        console.log("KYC not completed");
      }
    }
    catch (error) {
      console.log("Failed to fetch customer info", error);

    }
  }
  useEffect(() => {
    fetchCustomerInfo();
  }, [])

  const handleCheckout = (item) => {
    if (!customerKycStatus) {
      console.log("customer KYC page")
      navigation.navigate('CustomerKyc', {
        city: activeFilters.city
      })

    } else {
      console.log("customer checkout")

      navigation.navigate('Checkout', { details: item });

    }

  };

  /* ------------------ UTIL ------------------ */
  function areArraysEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
  }

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

  const ServiceCard = ({ item }) => {
    const handleSizeSelect = (size) => {
      const updated = services.map((service) => {
        if (service.id === item.id) {
          return {
            ...service,
            selectedSize: size,
            displayPrice: service.pricing[size]?.offer_price ?? '0',
          };
        }
        return service;
      });
      setServices(updated);
      setFilteredServices(updated);
    };

    const price = item.pricing[item.selectedSize]?.mrp_price || 0;
    const offer = item.displayPrice || 0;
    const percentOff =
      price > 0 ? Math.max(0, Math.round(100 * (1 - offer / price))) : 0;

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity onPress={() => handleServiceDetails(item)}>
          <View style={styles.serviceHeader}>
            <View style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{item.garage || 'Service'}</Text>
            </View>
            <View style={styles.wheelContainer}>
              <Text style={styles.wheelText}>20</Text>
              <LottieView
                source={require('../assets/lottie/wheel.json')}
                autoPlay
                speed={0.5}
                loop={true}
                style={{ width: 20, height: 20 }}
              />
            </View>
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
                <Text style={styles.originalPrice}>₹{price}</Text>
                <Text style={styles.currentPrice}> ₹{offer}</Text>
                <Text style={styles.percentOff}>{percentOff}% OFF</Text>
              </View>
              <View style={styles.vehicleSizeContainer}>
                {item.availableSizes.map((size) => {
                  const sizeLabels = {
                    small: "SM",
                    medium: "MD",
                    large: "LG",
                    "extra large": "XL",
                    premium: "PM",
                  };
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeButton,
                        item.selectedSize === size && styles.sizeButtonActive,
                      ]}
                      onPress={() => handleSizeSelect(size)}
                    >
                      <Text
                        style={[
                          styles.sizeButtonText,
                          item.selectedSize === size && styles.sizeButtonTextActive,
                        ]}
                      >
                        {sizeLabels[size] || size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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
                  onError={() => { /* could trigger placeholder */ }}
                />
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>4.5⭐</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleCheckout(item)} style={styles.addButton}>
                <Text style={styles.addButtonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

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
      <StatusBar
        backgroundColor="#ffffff"
        barStyle="dark-content"
      />
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
          onPress={() => setShowFilterModal(true)}>
          <Icon name={activeFilters.filterActive ? 'filter-alt' : 'filter-alt-off'}
            size={20}
            color={activeFilters.filterActive ? '#ff4444' : '#888'} />
        </TouchableOpacity>
        {activeFilters.filterActive && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetFilters}>
            <Text style={styles.resetButtonText}>Reset All</Text>
          </TouchableOpacity>
        )}
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
          {selectedCategory} ({loading ? '...' : filteredServices.length} Results)
        </Text>
        {activeFilters.filterActive && (
          <TouchableOpacity onPress={handleResetFilters}>
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Services List */}
      <FlatList
        style={styles.servicesContainer}
        contentContainerStyle={styles.servicesContentContainer}
        data={loading ? [] : filteredServices}
        keyExtractor={(item, idx) => `${item.id}-${idx}`}
        renderItem={({ item }) => <ServiceCard item={item} />}
        ListEmptyComponent={
          loading
            ? <LoadingIndicator />
            : <EmptyStateMessage />
        }
      />
      {/* Filter Modal */}
      <FilterModalCar
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleFilterApply}
        initialFilters={activeFilters}
        onResetFilters={handleResetFilters}
        hasActiveFilters={activeFilters.filterActive}
      />
    </View>
  );
};

/* ------------------ STYLES ------------------ */
// (Use your existing StyleSheet object exactly as before - omitted here for brevity)

const styles = StyleSheet.create({
  // ... (your existing styles here, unchanged)
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
  resetButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  resetButtonText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
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
  servicesContentContainer: { flexGrow: 1, paddingBottom: 20 },
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
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  serviceTag: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderBottomRightRadius: 8,
  },
  serviceTagText: { color: 'white', fontSize: 12, fontWeight: '500' },
  wheelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
    marginRight: 2,
    borderWidth: 1,
    borderColor: '#D0E8D0',
  },
  wheelText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  wheelIcon: {
    width: 16,
    height: 16,
    tintColor: '#2E7D32',
  },
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
    marginRight: 6,
  },
  percentOff: {
    color: '#ff4444',
    fontWeight: 'bold',
    fontSize: 11,
    marginLeft: 0,
  },
  vehicleSizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 5,
    backgroundColor: '#FFFFFF',
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButtonActive: {
    borderColor: '#3A7BD5',
    backgroundColor: '#E3F2FD',
  },
  sizeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  sizeButtonTextActive: {
    color: '#3A7BD5',
    fontWeight: '600',
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

export default ServiceList;
