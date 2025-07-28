import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native'; // Optional for theme support

const LoadingIndicator = ({ 
  message = 'Loading services...', // Customizable loading message
  size = 'large',                 // 'large' or 'small'
  color,                         // Optional custom color
  showText = true                // Toggle text visibility
}) => {
  const { colors } = useTheme(); // Optional for theme support

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator 
        size={size} 
        color={color || colors.primary} // Fallback to theme color if no color specified
      />
      {showText && (
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default React.memo(LoadingIndicator); // Memoize to prevent unnecessary re-renders