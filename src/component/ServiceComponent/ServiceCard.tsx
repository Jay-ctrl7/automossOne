import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ServiceCard = ({ 
  item, 
  expandedCards, 
  toggleExpand, 
  handleServiceDetails, 
  handleSizeSelect,
  handleCheckout
}) => {
  const price = item.pricing[item.selectedSize]?.mrp_price || 0;
  const offer = item.displayPrice || 0;
  const percentOff = price > 0 ? Math.max(0, Math.round(100 * (1 - offer / price))) : 0;

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
              source={require('../../assets/lottie/wheel.json')}
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
                    onPress={() => handleSizeSelect(item.id, size)}
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
                    : require('../../assets/icon/wheel.png')
                }
                style={styles.serviceImage}
                onError={() => { /* could trigger placeholder */ }}
              />
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>4.5⭐</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => handleCheckout(item)} 
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  serviceTagText: { 
    color: 'white', 
    fontSize: 12, 
    fontWeight: '500' 
  },
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
  cardContent: { 
    flexDirection: 'row', 
    padding: 16 
  },
  leftContent: { 
    flex: 1, 
    paddingRight: 16 
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
  seeMoreText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  priceContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
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
  rightContent: { 
    alignItems: 'center' 
  },
  imageContainer: { 
    position: 'relative', 
    marginBottom: 12 
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
    fontWeight: 'bold' 
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
    fontWeight: '600' 
  },
});

export default ServiceCard;