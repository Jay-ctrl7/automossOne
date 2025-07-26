import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CheckBox from '@react-native-community/checkbox';

const DEFAULT_DISTANCE = 100;
const GarageFilterSection = ({ selectedDistance, onDistanceSelect }) => {
  const distanceOptions = [
    { id: '5', name: 'Within 5 km', value: 5 },
    { id: '10', name: 'Within 10 km', value: 10 },
    { id: '25', name: 'Within 25 km', value: 25 },
    { id: '50', name: 'Within 50 km', value: 50 },
    { id: 'any', name: 'Any Distance', value: DEFAULT_DISTANCE }
  ];
  return (
    <View style={garageStyles.container}>
      <Text style={garageStyles.sectionTitle}>Maximum Distance (km)</Text>
      {distanceOptions.map(option => (
        <TouchableOpacity
          key={option.id}
          style={[
            garageStyles.optionContainer,
            selectedDistance === option.value && garageStyles.selectedOption
          ]}
          onPress={() => onDistanceSelect(option.value)}
        >
          <CheckBox
            value={selectedDistance === option.value}
            onValueChange={() => onDistanceSelect(option.value)}
            tintColors={{ true: '#007AFF', false: '#A5A5A5' }}
            style={garageStyles.checkbox}
          />
          <Text style={garageStyles.optionText}>{option.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
const garageStyles = StyleSheet.create({
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

export default GarageFilterSection;