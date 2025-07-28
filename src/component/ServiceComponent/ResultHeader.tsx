import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native'; // Optional: for theme support

const ResultsHeader = ({ 
  selectedCategory, 
  loading, 
  filteredServices, 
  activeFilters, 
  handleResetFilters 
}) => {
  const { colors } = useTheme(); // Optional: for theme support

  return (
    <View style={[styles.resultsHeader, { backgroundColor: colors.background }]}>
      <Text 
        style={[styles.headerText, { color: colors.text }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {selectedCategory} ({loading ? '...' : filteredServices.length} Results)
      </Text>
      {activeFilters.filterActive && (
        <TouchableOpacity 
          onPress={handleResetFilters}
          activeOpacity={0.7}
          accessibilityLabel="Clear all filters"
        >
          <Text style={[styles.clearFiltersText, { color: colors.primary }]}>
            Clear Filters
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1, // Allows text to shrink if needed
    marginRight: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default React.memo(ResultsHeader); // Memoize to prevent unnecessary re-renders