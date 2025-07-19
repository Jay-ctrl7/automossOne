import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';

const Emergency = () => {
  const [searchText, setSearchText] = useState('');

  return (
    <ScrollView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon 
          name="search" 
          size={20} 
          color="#888" 
          style={styles.searchIcon} 
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search Emergency Services..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#888"
          returnKeyType="search" 
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => console.log("Filter pressed")}
        >
          <Icon name='filter-alt' size={20} color='#ff4444' />
        </TouchableOpacity>
      </View>

      {/* Static Service Cards */}
      <View style={styles.cardContainer}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceTag}>
            <Text style={styles.serviceTagText}>Emergency Garage</Text>
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
            <Text style={styles.serviceName}>24/7 Emergency Towing</Text>
            <Text style={styles.info} numberOfLines={3} ellipsizeMode="tail">
              Immediate towing services available 24 hours a day, 7 days a week for all vehicle types.
            </Text>
            <View style={styles.priceContainer}>
              <Text style={styles.originalPrice}>₹5000</Text>
              <Text style={styles.currentPrice}>₹3500</Text>
              <Text style={styles.percentOff}>30% OFF</Text>
            </View>
            <View style={styles.vehicleSizeContainer}>
              {['SM', 'MD', 'LG', 'XL'].map((size) => (
                <TouchableOpacity key={size} style={styles.sizeButton}>
                  <Text style={styles.sizeButtonText}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.rightContent}>
            <View style={styles.imageContainer}>
              <Image
                source={require('../assets/icon/wheel.png')}
                style={styles.serviceImage}
              />
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>4.5⭐</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Second Static Service Card */}
      <View style={[styles.cardContainer, {marginTop: 16}]}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceTag}>
            <Text style={styles.serviceTagText}>Quick Repair</Text>
          </View>
          <View style={styles.wheelContainer}>
            <Text style={styles.wheelText}>15</Text>
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
            <Text style={styles.serviceName}>Emergency Roadside Repair</Text>
            <Text style={styles.info} numberOfLines={3} ellipsizeMode="tail">
              Fast and reliable roadside repair services for common vehicle breakdowns.
            </Text>
            <View style={styles.priceContainer}>
              <Text style={styles.originalPrice}>₹3000</Text>
              <Text style={styles.currentPrice}>₹2500</Text>
              <Text style={styles.percentOff}>17% OFF</Text>
            </View>
            <View style={styles.vehicleSizeContainer}>
              {['SM', 'MD', 'LG'].map((size) => (
                <TouchableOpacity key={size} style={styles.sizeButton}>
                  <Text style={styles.sizeButtonText}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.rightContent}>
            <View style={styles.imageContainer}>
              <Image
                source={require('../assets/icon/wheel.png')}
                style={styles.serviceImage}
              />
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>4.2⭐</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    padding: 8,
    marginLeft: 8,
  },
  cardContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    padding: 12,
  },
  serviceTag: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  serviceTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  wheelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#D0E8D0',
  },
  wheelText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  leftContent: {
    flex: 1,
    paddingRight: 16,
  },
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  percentOff: {
    color: '#ff4444',
    fontWeight: 'bold',
    fontSize: 11,
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
  sizeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  rightContent: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
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
  ratingText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Emergency; 