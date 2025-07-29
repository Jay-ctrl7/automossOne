import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, FlatList, StatusBar, Alert, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';

import { ENDPOINTS } from '../config/api';
import FilterModalCar from '../component/FilterModalCar';
import { getAuthData } from '../utils/AuthStore';
import SearchHeader from '../component/ServiceComponent/SearchHeader';
import CategoryTabs from '../component/ServiceComponent/CategoryTab';
import ResultsHeader from '../component/ServiceComponent/ResultHeader';
import ServiceCard from '../component/ServiceComponent/ServiceCard';
import EmptyState from '../component/ServiceComponent/EmptyState';
import LoadingIndicator from '../component/ServiceComponent/LoadingIndicatior';
import { useAuthStore } from '../stores/authStore';
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
  // State management
  const [services, setServices] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});
  const [searchText, setSearchText] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', name: 'All' }]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [customerKycStatus, setCustomerKycStatus] = useState(false);
  const [activeFilters, setActiveFilters] = useState(getDefaultFilters());
  const [cities, setCities] = useState([]);

  const customerKycStatus = useAuthStore(state => state.kycStatus);

  const categoryScrollRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { sId, sName } = route.params || {};
  const [initialCategorySet, setInitialCategorySet] = useState(false);

  // Helper functions
  const areArraysEqual = (a, b) => {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
  };

  // API functions
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
      if (categoryIds.length > 0) {
        requestBody.category_id = Array.isArray(categoryIds)
          ? categoryIds.join(',')
          : String(categoryIds);
      }
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
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchCities = async () => {
    try {
      const { data } = await axios.get(ENDPOINTS.master.city);
      if (data.status === 1) setCities(data.data);
    } catch (err) {
      console.error("Failed to fetch cities:", err);
    }
  };

  // const fetchCustomerInfo = async () => {  
  //   try {
  //     const authData = await getAuthData();
  //     const token = authData?.token;
  //     if (!token) {
  //       Alert.alert("Error", "Please login again");
  //       return;
  //     }
  //     const response = await axios.post(ENDPOINTS.auth.customerinfo, {}, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': `application/json`
  //       }
  //     });
  //     if (response.data?.data?.kyc_status === "1") {
  //       setCustomerKycStatus(true);
  //     } else {
  //       setCustomerKycStatus(false);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch customer info:", error);
  //   }
  // };

  // Handlers
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

  const toggleExpand = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }))
  };

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

  const handleCheckout = (item) => {
    if (!customerKycStatus) {
      console.log("customer kyc status:", customerKycStatus);

      navigation.navigate('CustomerKyc', {
        city: activeFilters.city,
        details: {
          ...item,
          selectedSize: item.selectedSize,
          displayPrice: item.displayPrice
        }
      });
    } else {
      console.log("customer kyc status:", customerKycStatus);

      navigation.navigate('Checkout', {
        details: {
          ...item,
          selectedSize: item.selectedSize,
          displayPrice: item.displayPrice
        }
      });
    }
  };

  const handleSizeSelect = (serviceId, size) => {
    const updated = services.map((service) => {
      if (service.id === serviceId) {
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

  // Effects
  useEffect(() => {
    fetchCarCategories();
    fetchCities();
    // fetchCustomerInfo();
  }, []);

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

  useEffect(() => {
    if (!initialCategorySet) return;

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
  }, [selectedCategory, activeFilters, initialCategorySet, categories]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredServices(services);
    } else {
      const searchLower = searchText.toLowerCase();
      setFilteredServices(services.filter(item =>
        (item.name && item.name.toLowerCase().includes(searchLower)) ||
        (item.info && item.info.toLowerCase().includes(searchLower)) ||
        (item.garage && item.garage.toLowerCase().includes(searchLower))
      ))
    }
  }, [searchText, services]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      <SearchHeader
        searchText={searchText}
        setSearchText={setSearchText}
        activeFilters={activeFilters}
        setShowFilterModal={setShowFilterModal}
        handleResetFilters={handleResetFilters}
      />

      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        handleCategoryPress={handleCategoryPress}
        scrollRef={categoryScrollRef}
      />

      <ResultsHeader
        selectedCategory={selectedCategory}
        loading={loading}
        filteredServices={filteredServices}
        activeFilters={activeFilters}
        handleResetFilters={handleResetFilters}
      />

      <FlatList
        style={styles.servicesContainer}
        contentContainerStyle={styles.servicesContentContainer}
        data={loading ? [] : filteredServices}
        keyExtractor={(item, idx) => `${item.id}-${idx}`}
        renderItem={({ item }) => (
          <ServiceCard
            item={item}
            expandedCards={expandedCards}
            toggleExpand={toggleExpand}
            handleServiceDetails={handleServiceDetails}
            handleSizeSelect={handleSizeSelect}
            handleCheckout={handleCheckout}
          />
        )}
        ListEmptyComponent={
          loading
            ? <LoadingIndicator />
            : <EmptyState error={error} handleRetry={handleRetry} />
        }
      />

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  servicesContainer: { flex: 1 },
  servicesContentContainer: { flexGrow: 1, paddingBottom: 20 },
});

export default ServiceList;