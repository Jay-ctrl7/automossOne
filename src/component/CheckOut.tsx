import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CheckOut = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Checkout</Text>
      
      {/* Service Selection */}
      <View style={styles.section}>
        
        
        <View style={[styles.checkboxContainer, styles.selectedService]}>
          <Text style={[styles.checkboxLabel, styles.selectedLabel]}>Autorupa Garage</Text>
        </View>
        
        <View style={styles.checkboxContainer}>
            <Icon name="calendar-today" size={20}/>
          <Text style={styles.checkboxLabel}>Select Date & Time</Text>
        </View>
        
        <View style={styles.checkboxContainer}>
          <Text style={styles.checkboxLabel}>Auto care Paint & Dent</Text>
          <Text style={styles.price}>₹899</Text>
        </View>
      </View>
      
      {/* Offers Section */}
    <View style={styles.section1}>
      <View>
        <Text style={[styles.checkboxLabel, styles.selectedLabel]}>Offers & Promo Code</Text>
      </View>
      <TouchableOpacity >
        <Text style={styles.checkboxLabel}>View offers</Text>
      </TouchableOpacity>
    </View>
      
      <View style={styles.divider} />
      
      {/* Frequently Added Together */}
      <Text style={styles.sectionTitle}>Frequently added together</Text>
      
      <View style={styles.cardContainer}>
        {[1, 2,].map((item) => (
          <View key={item} style={styles.card}>
            <Text style={styles.cardTitle}>AC Gas Refill</Text>
            <Text style={styles.cardPrice}>₹499</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectButtonText}>Select</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      
      <View style={styles.divider} />
      
      {/* Item Total */}
      <View style={styles.totalSection}>
        <View style={styles.checkboxContainer}>
          <Icon name="check-box-outline-blank" size={24} color="#777" />
          <Text style={styles.checkboxLabel}>₹899</Text>
          <Text style={styles.taxText}>plus taxes</Text>
        </View>
        
        <View style={styles.checkboxContainer}>
          <Icon name="check-box-outline-blank" size={24} color="#777" />
          <Text style={styles.checkboxLabel}>Select Date & Time</Text>
          <Text style={styles.price}>₹899</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  section1: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent:"space-between",
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedService: {
    backgroundColor: '#f5f5f5',
  },
  checkboxLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedLabel: {
    fontWeight: 'bold',
    color: '#000',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  selectButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  totalSection: {
    marginTop: 20,
  },
  taxText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 36,
  },
});

export default CheckOut;