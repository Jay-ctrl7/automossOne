import { View, Text, Image, ScrollView, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';

const Banner = () => {
  const [bannerData, setBannerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  
  const fetchBanner = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ENDPOINTS.master.banner);

      if (response.data.status === 1 && response.data.data.length > 0) {
        setBannerData(response.data.data);
      } else {
        setError('No banners available');
      }
    } catch (err) {
      console.error('Error fetching banner data:', err);
      setError('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  useEffect(() => {
    // Auto-scroll interval
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % bannerData.length;
      setCurrentIndex(nextIndex);
      
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: (windowWidth - 40 + 40) * nextIndex, // (slide width + horizontal margin) * index
          animated: true,
        });
      }
    }, 3000); // 3 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [currentIndex, bannerData.length]);

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    
    // Calculate current index
    const index = Math.round(contentOffset.x / (windowWidth - 40 + 40)); // Account for slide width and margin
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        // Disable scrolling when user is interacting
        onTouchStart={() => {
          // You might want to pause auto-scroll during user interaction
          // This would require additional state management
        }}
      >
        {bannerData.map((item, index) => (
          <View key={item.id} style={styles.slide}>
            <Image 
              source={{ uri: item.thumb }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.name}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Pagination indicators */}
      <View style={styles.pagination}>
        {bannerData.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.dot,
              index === currentIndex ? styles.activeDot : styles.inactiveDot
            ]} 
          />
        ))}
      </View>
    </View>
  );
};

const windowWidth = Dimensions.get('window').width;

// ... (keep your existing styles the same)
const styles = StyleSheet.create({
  container: {
    height: 200,
    marginVertical: 15,
    position: 'relative',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: windowWidth - 40, // Account for horizontal margin
    height: '100%',
    marginHorizontal: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#000',
    width: 12,
  },
  inactiveDot: {
    backgroundColor: '#ccc',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
  },
});

export default Banner;