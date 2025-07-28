import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EmptyState = ({ 
  error, 
  handleRetry,
  customIcon,       // Optional custom icon name
  customTitle,      // Optional custom title
  customSubtext,    // Optional custom subtext
  buttonText = 'Try Again' // Customizable button text
}) => {
  return (
    <View style={styles.emptyStateContainer}>
      <Icon 
        name={customIcon || (error ? 'error-outline' : 'search-off')} 
        size={60} 
        color="#ccc" 
        style={styles.emptyStateIcon} 
      />
      <Text style={styles.emptyStateTitle}>
        {customTitle || (error || 'No services found')}
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {customSubtext || (error ? 
          'Please try again or contact support if the problem persists.' :
          'Try adjusting your search criteria or browse other categories')}
      </Text>
      {error && (
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={handleRetry}
          activeOpacity={0.7}
          accessibilityLabel="Retry loading"
        >
          <Text style={styles.retryButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateIcon: {
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default React.memo(EmptyState);