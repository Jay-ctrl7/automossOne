import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CheckBox from '@react-native-community/checkbox';

const DEFAULT_PRICE = [0, 50000];
const PriceFilterSection = ({ selectedPrice, onPriceSelect }) => {
  const priceOptions = [
    { id: '1', name: '₹100 - ₹1000', value: [100, 1000] },
    { id: '2', name: '₹1000 - ₹3000', value: [1000, 3000] },
    { id: '3', name: '₹3000 - ₹7000', value: [3000, 7000] },
    { id: '4', name: '₹7000 - ₹15000', value: [7000, 15000] },
    { id: '5', name: '₹15000+', value: [15000, 50000] },
    { id: 'any', name: 'Any price', value: DEFAULT_PRICE }
  ];
  const isPriceSelected = (range) =>
    Array.isArray(selectedPrice) &&
    Array.isArray(range) &&
    selectedPrice[0] === range[0] && selectedPrice[1] === range[1];
  return (
    <View style={priceStyles.container}>
      <Text style={priceStyles.sectionTitle}>Price Range</Text>
      {priceOptions.map(option => (
        <TouchableOpacity
          key={option.id}
          style={[
            priceStyles.optionContainer,
            isPriceSelected(option.value) && priceStyles.selectedOption
          ]}
          onPress={() => onPriceSelect(option.value)}
        >
          <CheckBox
            value={isPriceSelected(option.value)}
            onValueChange={() => onPriceSelect(option.value)}
            tintColors={{ true: '#007AFF', false: '#A5A5A5' }}
            style={priceStyles.checkbox}
          />
          <Text style={priceStyles.optionText}>{option.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
const priceStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginVertical: 4,
  },
  selectedOption: {
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
  },
  checkbox: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 15,
  },
});
export default PriceFilterSection;