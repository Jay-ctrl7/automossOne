import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Image, 
  useWindowDimensions,
  FlatList,
  TouchableOpacity
} from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRoute } from '@react-navigation/native';
import { ENDPOINTS } from '../config/api';
import axios from 'axios';

const ServiceDetails = () => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const route = useRoute();
  const { itemId, activeFilters } = route.params;
  const flatListRef = useRef();
  const { width: windowWidth } = useWindowDimensions();
  const scrollInterval = useRef();

  useEffect(() => {
    fetchServiceDetails();
    return () => {
      // Clean up on unmount
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    };
  }, [itemId, activeFilters]);

  // Auto-scroll effect
  useEffect(() => {
        console.log("Details data",details);

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
    }, 3000); // Change slide every 3 seconds

    return () => {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    };
  }, [currentImageIndex, details, autoScrollEnabled]);

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

        setDetails(groupedService);
        setAutoScrollEnabled(true); // Enable auto-scroll when data loads
      }
    } catch (err) {
      console.error("Error fetching service details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Memoize this function to prevent unnecessary recalculations
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
    
    // Pause auto-scroll on user interaction
    setAutoScrollEnabled(false);
    if (scrollInterval.current) clearInterval(scrollInterval.current);
    
    // Resume auto-scroll after 5 seconds of inactivity
    const timeout = setTimeout(() => {
      setAutoScrollEnabled(true);
    }, 5000);
    
    return () => clearTimeout(timeout);
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
   const handleSizeSelect=(size)=>{
      const updatedDetails=details.map((service)=>{
        if(service.id===item.id){
          return{
               ...service,
          selectedSize:size,
          displayPrice:service.pricing[size].offer_price,

          }
       
        }
        return service;
      });
      setDetails(updatedDetails);
      setFilteredDetails(updatedDetails);

    };

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
              onScrollToIndexFailed={() => {}}
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
            <Text>Garage: {details.garage}</Text>
            <Text style={styles.price}>₹{details.displayPrice}</Text>
            
            <Text style={styles.sectionTitle}>Available Sizes:</Text>
           <View style={styles.vehicleSizeContainer}>
                      {details.availableSizes.map((size) => {
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
                     );
                   })}
                     </View>

            <Text style={styles.sectionTitle}>Description:</Text>
            <Text style={styles.description}>
              {details.description || "No description available"}
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
    marginTop:10,
    height: 250,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius:10,
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
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    color: '#2ecc71',
    fontWeight: 'bold',
    marginBottom: 16,
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
   sizeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  sizeButtonTextActive: {
    color: '#3A7BD5',
   fontWeight:'bold'
  },
  
  sizePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedSizePill: {
    backgroundColor: '#e9c2c2ff',
  },
  sizeText: {
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
});

export default ServiceDetails;