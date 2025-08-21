import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Alert, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { ENDPOINTS } from '../config/api';

const ShowMap = () => {
  const route = useRoute();
  const { coordinates, address, garageId } = route.params || {};
  const token = useAuthStore(state => state.token);

  const [region, setRegion] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set initial region based on coordinates from params
  useEffect(() => {
    if (coordinates && coordinates.latitude && coordinates.longitude) {
      const initialRegion = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      setRegion(initialRegion);
      
      // Add marker for the coordinate from params
      setMarkers([{
        id: 'user-location',
        title: "User Location",
        description: address || 'User address',
        coordinate: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        },
        pinColor: '#FF0000' // Red pin for service location
      }]);
    } else {
      // Default fallback region
      setRegion({
        latitude: 20.2961,
        longitude: 85.8245,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setError("No coordinates provided");
    }
  }, [coordinates, address]);

  const fetchGarageDetails = async () => {
    try {
      if (!token) {
        Alert.alert("Error", "Please login again");
        setLoading(false);
        return;
      }

      console.log('Fetching all garages to find ID:', garageId);

      const response = await axios.get(ENDPOINTS.garage.list, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        timeout: 10000
      });

      if (response.data?.status === 1 && response.data.data) {
        const garages = response.data.data;
        console.log('All Garages:', garages);
        
        // Find the garage with matching ID
        const matchedGarage = garages.find(garage => garage.id === garageId || garage.id === parseInt(garageId));
        
        if (matchedGarage) {
          console.log('Matched Garage:', matchedGarage);
          
          // Add garage location to markers if coordinates are available
          if (matchedGarage.garage_lat && matchedGarage.garage_lon) {
            const garageMarker = {
              id: 'garage-location',
              title: matchedGarage.name || "Garage",
              description: matchedGarage.address || 'Garage location',
              coordinate: {
                latitude: parseFloat(matchedGarage.garage_lat),
                longitude: parseFloat(matchedGarage.garage_lon)
              },
              pinColor: '#4CAF50' // Green pin for garage
            };
            
            setMarkers(prev => [...prev, garageMarker]);
            
            // Update region to show both markers if needed
            if (region && coordinates) {
              const latDelta = Math.max(
                Math.abs(coordinates.latitude - parseFloat(matchedGarage.latitude)) * 2,
                region.latitudeDelta
              );
              const longDelta = Math.max(
                Math.abs(coordinates.longitude - parseFloat(matchedGarage.longitude)) * 2,
                region.longitudeDelta
              );
              
              setRegion({
                latitude: (coordinates.latitude + parseFloat(matchedGarage.garage_lat)) / 2,
                longitude: (coordinates.longitude + parseFloat(matchedGarage.garage_lng)) / 2,
                latitudeDelta: latDelta + 0.01, // Add padding
                longitudeDelta: longDelta + 0.01, // Add padding
              });
            }
          }
        } else {
          console.log('No garage found with ID:', garageId);
          setError('Garage location not found');
        }
      } else {
        console.log('No garage data found in response');
        setError('No garage data available');
      }

    } catch (error) {
      console.error('Error fetching garage details:', error);
      if (error.response?.status === 404) {
        console.log('Garage endpoint not found');
        setError('Garage service unavailable');
      } else {
        setError('Failed to load garage details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Coordinates:', coordinates);
    console.log('Address:', address);
    console.log('Garage ID:', garageId);
    
    if (garageId && garageId !== 'N/A') {
      setLoading(true);
      fetchGarageDetails();
    } else {
      setLoading(false);
    }
  }, [garageId, token, coordinates]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading map data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text>No location coordinates available</Text>
      </View>
    );
  }

  if (!region) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load map</Text>
        <Text>No location coordinates available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            pinColor={marker.pinColor || '#0000FF'} // Default blue
          />
        ))}
      </MapView>
      
      {/* Address overlay */}
      {address && address !== 'Address not available' && (
        <View style={styles.addressOverlay}>
          <Text style={styles.addressText}>{address}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    marginBottom: 10,
  },
  addressOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addressText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ShowMap;