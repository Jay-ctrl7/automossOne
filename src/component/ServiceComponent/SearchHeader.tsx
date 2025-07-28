import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform,Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SearchHeader = ({ 
  searchText, 
  setSearchText, 
  activeFilters, 
  setShowFilterModal,
  handleResetFilters 
}) => {
  return (
    <View style={styles.searchContainer}>
      <Icon 
        name="search" 
        size={20} 
        color="#888" 
        style={styles.searchIcon} 
      />
      <TextInput
        style={styles.searchBar}
        placeholder="Search services..."
        value={searchText}
        onChangeText={setSearchText}
        placeholderTextColor="#888"
        clearButtonMode="while-editing"
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
        activeOpacity={0.7}
        accessibilityLabel="Filter services"
      >
        <Icon 
          name={activeFilters.filterActive ? 'filter-alt' : 'filter-alt-off'}
          size={20}
          color={activeFilters.filterActive ? '#ff4444' : '#888'} 
        />
      </TouchableOpacity>
      {activeFilters.filterActive && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetFilters}
          activeOpacity={0.7}
          accessibilityLabel="Reset all filters"
        >
          <Text style={styles.resetButtonText}>Reset All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    paddingHorizontal: 12,
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
  searchIcon: { 
    marginRight: 8 
  },
  searchBar: {
    flex: 1,
    paddingVertical: Platform.select({
      ios: 12,
      android: 10,
    }),
    fontSize: 16,
    color: '#333',
    paddingRight: 8,
    includeFontPadding: false, // for better vertical alignment on Android
  },
  filterButton: { 
    padding: 8, 
    marginLeft: 8 
  },
  resetButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  resetButtonText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SearchHeader;