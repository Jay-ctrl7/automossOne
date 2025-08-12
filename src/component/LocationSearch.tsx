import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Config from 'react-native-config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocation } from '../context/LocationContext'; // Import your location context

const LocationSearch = ({ onLocationSelect, style }) => {
  const { location: contextLocation, setLocation } = useLocation();
  const [query, setQuery] = useState(contextLocation?.address || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUsingDefault, setIsUsingDefault] = useState(!!contextLocation?.address);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);

  // Set default location when available and not edited
  useEffect(() => {
    if (!hasBeenEdited && contextLocation?.address) {
      setQuery(contextLocation.address);
      setIsUsingDefault(true);
    }
  }, [contextLocation?.address, hasBeenEdited]);

  const searchLocations = async (searchText) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        {
          params: {
            input: searchText,
            key: Config.GOOGLE_MAPS_API_KEY,
            components: 'country:in',
            language: 'en',
          }
        }
      );

      setResults(response.data.predictions || []);
    } catch (err) {
      setError('Failed to fetch locations');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (placeId) => {
    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        {
          params: {
            place_id: placeId,
            key: Config.GOOGLE_MAPS_API_KEY,
            fields: 'geometry,name,formatted_address,address_components',
          }
        }
      );

      const result = response.data.result;
      const getAddressComponent = (type: string) =>
        result.address_components?.find(c => c.types.includes(type))?.long_name;

      const locationData = {
        address: result.formatted_address,
        coordinates: result.geometry.location,
        city: getAddressComponent('locality') || getAddressComponent('administrative_area_level_2'),
        country: getAddressComponent('country'),
        state: getAddressComponent('administrative_area_level_1'),
        postalCode: getAddressComponent('postal_code'),
        isDefault: false
      };

      setQuery(locationData.address);
      setIsUsingDefault(false);
      setHasBeenEdited(true);
      setResults([]);

      // Update both local callback and context
      if (onLocationSelect) onLocationSelect(locationData);
      setLocation(locationData);
    } catch (err) {
      setError('Failed to get location details');
      console.error('Details error:', err);
    }
  };

  const handleInputChange = (text) => {
    setQuery(text);
    if (!hasBeenEdited) setHasBeenEdited(true);
    if (text.length > 2) {
      searchLocations(text);
    } else {
      setResults([]);
    }
  };

  const clearLocation = () => {
    setQuery('');
    setResults([]);
    setIsUsingDefault(false);
    setHasBeenEdited(true);
    if (onLocationSelect) onLocationSelect(null);
    setLocation({ address: '', isDefault: false });
  };
  const handleRefresh = () => {
    if (contextLocation?.address) {
      setQuery(contextLocation.address);
      setIsUsingDefault(true);
      setHasBeenEdited(false);
      setResults([]);

      // Update both local callback and context
      if (onLocationSelect) onLocationSelect({
        ...contextLocation,
        isDefault: true
      });
      setLocation({
        ...contextLocation,
        isDefault: true
      });
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <Icon
          name={query ? "location-on" : "search"}
          size={20}
          color={isUsingDefault ? "#4CAF50" : "#999"}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={isUsingDefault ? "Using your current location" : "Search for a location..."}
          placeholderTextColor="#999"
          value={query}
          onChangeText={handleInputChange}
          onFocus={() => {
            if (isUsingDefault) {
              setQuery('');
              setIsUsingDefault(false);
            }
          }}
          autoCorrect={false}
          textAlign="left"  // Explicit left alignment
          includeFontPadding={false}
        />
        {contextLocation?.address && (
          <TouchableOpacity onPress={handleRefresh}>
            <Icon
              name="refresh"
              size={20}
              color={isUsingDefault ? "#4CAF50" : "#999"}
            />
          </TouchableOpacity>
        )}
        {loading && <ActivityIndicator size="small" style={styles.loader} />}
        {(query && !isUsingDefault) && (
          <TouchableOpacity onPress={clearLocation}>
            <Icon name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {!isUsingDefault && results.length > 0 && (
        <FlatList
          data={results}
          scrollEnabled={false}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => handleSelect(item.place_id)}
            >
              <Icon name="location-on" size={20} color="#666" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.primaryText}>{item.structured_formatting.main_text}</Text>
                <Text style={styles.secondaryText}>{item.structured_formatting.secondary_text}</Text>
              </View>
              <TouchableOpacity onPress={() => handleSelect(item.place_id)}>
                <Icon name="refresh" size={20} color="#666" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          style={styles.resultsList}
          keyboardShouldPersistTaps="always"
        />
      )}

      {isUsingDefault && (
        <Text style={styles.defaultLocationNote}>
          Using your current location. Start typing to search for a different address.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    paddingLeft: 8,
    textAlign: 'left',
    includeFontPadding: false,
  },
  loader: {
    marginLeft: 8,
  },
  resultsList: {
    maxHeight: 200,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultTextContainer: {
    marginLeft: 10,
  },
  primaryText: {
    fontSize: 16,
    color: '#333',
  },
  secondaryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
  defaultLocationNote: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default LocationSearch;

