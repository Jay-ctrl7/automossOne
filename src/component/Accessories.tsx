import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';

const Accessories = () => {
  const [accessories, setAccessories] = useState([]);

  const fetchAccessories = async () => {
    try {
      const response = await axios.post(ENDPOINTS.master.assessoriesList);
      if (response.data.status === 1) {
        console.log(response.data.data);
        setAccessories(response.data.data);
      } else {
        console.error('Error fetching', response.data.message);
      }
    } catch (error) {
      console.log('Error fetching accessories:', error);
    }
  };

  useEffect(() => {
    fetchAccessories();
  }, []);

  const renderAccessoryItem = (item, index) => (
    <View key={index} style={styles.accessoryCard}>
      <Image source={{ uri: item.pic3 }} style={styles.accessoryImage} />
      <Text style={styles.accessoryName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.originalPrice}>₹{item.mrp_price}</Text>
        <Text style={styles.offerPrice}>₹{item.offer_price}</Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSeeAll = () => (
    <TouchableOpacity style={styles.seeAllButton}>
      <Text style={styles.seeAllText}>see all</Text>
      <Text style={styles.seeAllArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accessories</Text>
        {renderSeeAll()}
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {accessories.map((item, index) => renderAccessoryItem(item, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  seeAllArrow: {
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  accessoryCard: {
    width: 120,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  accessoryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  accessoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
    minHeight: 32,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  offerPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 50,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Accessories;