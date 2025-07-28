import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CheckBox from '@react-native-community/checkbox';

const CarSizeFilterSection = ({ 
  selectedSizes = [], 
  onSizeSelect,
  title = 'Select Car Sizes',
  containerStyle,
  showSelectAll = true
}) => {
  const carSizes = [
    { id: 'small', name: 'Small', abbreviation: 'SM' },
    { id: 'medium', name: 'Medium', abbreviation: 'MD' },
    { id: 'extra large', name: 'Extra Large', abbreviation: 'XL' },
    { id: 'premium', name: 'Premium', abbreviation: 'PM' },
  ];

  const toggleSelectAll = () => {
    if (selectedSizes.length === carSizes.length) {
      // Deselect all
      carSizes.forEach(size => onSizeSelect(size.id, false));
    } else {
      // Select all
      carSizes.forEach(size => onSizeSelect(size.id, true));
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showSelectAll && (
          <TouchableOpacity onPress={toggleSelectAll}>
            <Text style={styles.selectAllText}>
              {selectedSizes.length === carSizes.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {carSizes.map(size => (
        <TouchableOpacity
          key={size.id}
          style={[
            styles.optionContainer,
            selectedSizes.includes(size.id) && styles.selectedOption
          ]}
          onPress={() => onSizeSelect(size.id, !selectedSizes.includes(size.id))}
          activeOpacity={0.7}
          accessibilityLabel={`${size.name} car size`}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selectedSizes.includes(size.id) }}
        >
          <CheckBox
            value={selectedSizes.includes(size.id)}
            onValueChange={() => onSizeSelect(size.id, !selectedSizes.includes(size.id))}
            tintColors={{ true: '#007AFF', false: '#A5A5A5' }}
            onTintColor="#007AFF"
            onCheckColor="#FFFFFF"
            boxType="square"
            style={styles.checkbox}
          />
          <View style={styles.sizeBadge}>
            <Text style={styles.sizeAbbreviation}>{size.abbreviation}</Text>
          </View>
          <Text style={styles.optionText}>{size.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  selectAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F8F8F8',
  },
  selectedOption: {
    backgroundColor: '#E6F2FF',
  },
  checkbox: {
    marginRight: 12,
    width: 20,
    height: 20,
  },
  sizeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sizeAbbreviation: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },
  optionText: {
    fontSize: 15,
    color: '#333333',
    flex: 1,
  },
});

export default React.memo(CarSizeFilterSection);