import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  useWindowDimensions,
  FlatList,
  TouchableOpacity, Alert
} from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ENDPOINTS } from '../config/api';
import axios from 'axios';
import LottieView from 'lottie-react-native';
import { getAuthData } from '../utils/AuthStore';

const ServiceDetails = () => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [customerKycStatus, setCustomerKycStatus] = useState(false);

  const route = useRoute();
  const { itemId, activeFilters } = route.params;
  const flatListRef = useRef();
  const { width: windowWidth } = useWindowDimensions();
  const scrollInterval = useRef();

  const navigation = useNavigation();

  useEffect(() => {
    fetchServiceDetails();
    return () => {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    };
  }, [itemId, activeFilters]);

  // Auto-scroll effect
  useEffect(() => {
    if (!autoScrollEnabled || !details) return;

    const images = getCarouselImages();
    if (images.length <= 1) return;

    scrollInterval.current = setInterval(() => {
      const nextIndex = (currentImageIndex + 1) % images.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentImageIndex(nextIndex);
    }, 3000);

    return () => {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    };
  }, [currentImageIndex, details, autoScrollEnabled]);


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
        console.log("Kyc Data service List", response.data.data);
        setCustomerKycStatus(true);
      }
      else {
        setCustomerKycStatus(false);
        console.log("Kyc Data service List else", response.data.data);

        console.log("Not able to get the data");
      }
    }
    catch (error) {
      console.log("Failed to fetch customer info", error);

    }
  }
  useEffect(() => {
    fetchCustomerInfo();
  }, [])

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(ENDPOINTS.master.packageMaster.list, {
        city_id: activeFilters.city,
        min: activeFilters.price[0],
        max: activeFilters.price[1],
        car_size: activeFilters.carSizes,
        distance: activeFilters.distance,
      });

      if (data.status === 1) {
        const matchingServices = data.data.filter(service => service.id === itemId);
        if (matchingServices.length === 0) {
          setDetails(null);
          return;
        }

        const groupedService = { pricing: {}, availableSizes: [] };
        Object.assign(groupedService, matchingServices[0]);

        matchingServices.forEach((service) => {
          groupedService.pricing[service.car_size] = {
            mrp_price: service.mrp_price,
            offer_price: service.offer_price,
          };
          if (!groupedService.availableSizes.includes(service.car_size)) {
            groupedService.availableSizes.push(service.car_size);
          }
        });

        groupedService.selectedSize = groupedService.availableSizes[0];
        groupedService.displayPrice =
          groupedService.pricing[groupedService.availableSizes[0]].offer_price;

        console.log("Service details loaded:", groupedService); // Single log
        setDetails(groupedService);
        setAutoScrollEnabled(true);
      }
    } catch (err) {
      console.error("Error fetching service details:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCarouselImages = useCallback(() => {
    if (!details) return [];

    const images = [];
    for (let i = 1; i <= 4; i++) {
      const pic = details[`pic${i}`];
      if (pic) images.push(pic);
    }
    return images;
  }, [details]);

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / windowWidth);
    setCurrentImageIndex(index);

    setAutoScrollEnabled(false);
    if (scrollInterval.current) clearInterval(scrollInterval.current);

    const timeout = setTimeout(() => {
      setAutoScrollEnabled(true);
    }, 5000);

    return () => clearTimeout(timeout);
  };

  const handleSizeSelect = (size) => {
    setDetails(prev => ({
      ...prev,
      selectedSize: size,
      displayPrice: prev.pricing[size].offer_price
    }));
  };

  const renderCarouselItem = ({ item }) => (
    <View style={{ width: windowWidth }}>
      <Image
        source={{ uri: item }}
        style={styles.carouselImage}
        resizeMode="cover"
      />
    </View>
  );

  const sizeLabels = {
    small: "SM",
    medium: "MD",
    large: "LG",
    "extra large": "XL",
    premium: "PM",
  };

  const handelPayment = () => {
    if (!customerKycStatus) {
      console.log("customer kyc status No", customerKycStatus);
      navigation.navigate('CustomerKyc', {
        city: activeFilters.city
      })

    } else {
      console.log("customer kyc status yes", customerKycStatus);

      navigation.navigate('Checkout', {
        details: details
      });
    }


  }

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : details ? (
        <>
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={getCarouselImages()}
              renderItem={renderCarouselItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onScrollToIndexFailed={() => { }}
            />

            <View style={styles.dotsContainer}>
              {getCarouselImages().map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dot,
                    currentImageIndex === index && styles.activeDot,
                  ]}
                  onPress={() => {
                    setAutoScrollEnabled(false);
                    flatListRef.current?.scrollToIndex({ index, animated: true });
                    setTimeout(() => setAutoScrollEnabled(true), 5000);
                  }}
                />
              ))}
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.serviceName}>{details.name}</Text>
            <Text>Dent paint by {details.garage}</Text>

            {/* rating */}
            <View style={styles.ratingContainer}>
              <Text>⭐⭐⭐⭐ </Text>
              <Text>3.8 (120 reviews)</Text>
            </View>

            {/* diplay price mrp price discount percentage */}
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{details.displayPrice}</Text>
              <Text style={styles.mrpPrice}>₹{details.mrp_price}</Text>
              <View style={styles.discountContainer}>
                <Text style={styles.discountPercentage}>{Math.round((1 - details.displayPrice / details.pricing[details.selectedSize].mrp_price) * 100)}% OFF</Text>
              </View>

            </View>



            <Text style={styles.sectionTitle}>Available Sizes:</Text>
            <View style={styles.vehicleSizeContainer}>
              {details.availableSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    details.selectedSize === size && styles.sizeButtonActive,
                  ]}
                  onPress={() => handleSizeSelect(size)}
                >
                  <Text
                    style={[
                      styles.sizeButtonText,
                      details.selectedSize === size && styles.sizeButtonTextActive,
                    ]}
                  >
                    {sizeLabels[size] || size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Wheels */}
            <View style={styles.wheelContainer}>

              <LottieView
                source={require('../assets/lottie/wheel.json')}

                autoPlay
                speed={0.5}
                loop={true}
                style={{ width: 20, height: 20, transform: [{ scale: 1.0 }] }}
                onAnimationFailure={(error) => console.error('Lottie error:', error)}

              />
              <Text style={styles.wheelText}> Earn 20 wheels on this Service</Text>
            </View>

            {/* Book now */}
            <View style={styles.bookNowContainer}>
              <TouchableOpacity onPress={() => handelPayment()} style={styles.bookNowbutton}><Text style={styles.bookNowText}>Book Now</Text></TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>About This Item</Text>
            <Text style={styles.description}>
              {details.info || "No description available"}
            </Text>
            <Text style={styles.sectionTitle}>Short Info</Text>
            <Text style={styles.short_info}>
              {details.short_info || "No description available"}
            </Text>
          </View>
        </>
      ) : (
        <Text>No details available for this service</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  carouselContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    flex: 1,
    marginTop: 10,
    height: 250,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#000',
  },
  detailsContainer: {
    padding: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  price: {
    fontSize: 20,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  mrpPrice: {
    fontSize: 15,
    color: '#888',
    textDecorationLine: 'line-through',
    marginLeft: 8,
    marginRight: 8,
  },
  discountContainer: {
    backgroundColor: '#ff5722',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountPercentage: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  wheelContainer: {
    flexDirection: 'row',
  },
  wheelText: {
    fontSize: 13,
    color: 'green'
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  vehicleSizeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 12,
    marginBottom: 8,
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButtonActive: {
    borderColor: '#3A7BD5',
    backgroundColor: '#F0F7FF',
  },
  sizeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  sizeButtonTextActive: {
    color: '#3A7BD5',
    fontWeight: 'bold'
  },
  bookNowContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
  },
  bookNowbutton: {
    height: 50,
    width: '70%',
    backgroundColor: '#ff5722',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    fontWeight: 'bold',
  },
  bookNowText: {
    fontSize: 20,
    color: 'white'
  },


  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  short_info: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  }
});

export default ServiceDetails;