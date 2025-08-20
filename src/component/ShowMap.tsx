import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Dimensions, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { ENDPOINTS } from '../config/api';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Config from 'react-native-config';

// Add your Google Maps API key here
const GOOGLE_MAPS_APIKEY = Config.GOOGLE_MAPS_API_KEY;

const ShowMap = () => {
  const route = useRoute();
  const { coordinates, address, garageId } = route.params || {};
  const token = useAuthStore(state => state.token);

  const [region, setRegion] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [trackingMode, setTrackingMode] = useState('none');
  const [isNavigating, setIsNavigating] = useState(false);

  const mapRef = useRef(null);
  const watchId = useRef(null);

  // Get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        error => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  // Watch position for navigation
  const watchPosition = () => {
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
    }

    watchId.current = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        
        // Update map region during navigation
        if (isNavigating && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }, 1000);
        }
      },
      error => console.error('Error watching position:', error),
      { 
        enableHighAccuracy: true, 
        distanceFilter: 10, 
        interval: 1000,
        fastestInterval: 1000 
      }
    );
  };

  // Set initial region and markers
  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Try to get current location first
        try {
          const location = await getCurrentLocation();
          setCurrentLocation(location);
        } catch (error) {
          console.log('Could not get current location:', error);
        }

        if (coordinates && coordinates.latitude && coordinates.longitude) {
          const dest = {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          };
          setDestination(dest);
          
          const initialRegion = {
            ...dest,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          
          setRegion(initialRegion);
          
          // Add markers
          const newMarkers = [{
            id: 'destination',
            title: "Destination",
            description: address || 'Destination address',
            coordinate: dest,
            pinColor: '#FF0000'
          }];

          // Add current location marker if available
          if (currentLocation) {
            newMarkers.push({
              id: 'current-location',
              title: "My Location",
              description: 'Current location',
              coordinate: currentLocation,
              pinColor: '#007AFF'
            });
          }

          setMarkers(newMarkers);
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
      } catch (error) {
        setError("Failed to initialize map");
        console.error("Map initialization error:", error);
      }
    };

    initializeMap();
  }, [coordinates, address, currentLocation]);

  // Fetch garage details
  const fetchGarageDetails = async () => {
    try {
      if (!token) {
        Alert.alert("Error", "Please login again");
        setLoading(false);
        return;
      }

      const response = await axios.get(ENDPOINTS.garage.list, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        timeout: 10000
      });

      if (response.data?.status === 1 && response.data.data) {
        const garages = response.data.data;
        const matchedGarage = garages.find(garage => garage.id === garageId || garage.id === parseInt(garageId));
        
        if (matchedGarage && matchedGarage.garage_lat && matchedGarage.garage_lon) {
          const garageLocation = {
            latitude: parseFloat(matchedGarage.garage_lat),
            longitude: parseFloat(matchedGarage.garage_lon)
          };
          
          // Update destination to garage location
          setDestination(garageLocation);
          
          // Add garage marker
          const garageMarker = {
            id: 'garage-location',
            title: matchedGarage.name || "Garage",
            description: matchedGarage.address || 'Garage location',
            coordinate: garageLocation,
            pinColor: '#4CAF50'
          };
          
          setMarkers(prev => [...prev, garageMarker]);
        }
      }
    } catch (error) {
      console.error('Error fetching garage details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (garageId && garageId !== 'N/A') {
      fetchGarageDetails();
    } else {
      setLoading(false);
    }
  }, [garageId, token]);

  // Start navigation
  const startNavigation = () => {
    if (!currentLocation || !destination) {
      Alert.alert("Error", "Cannot start navigation without location data");
      return;
    }
    
    setIsNavigating(true);
    setShowRoute(true);
    setTrackingMode('following');
    watchPosition();
    
    // Fit map to show both locations and route
    if (mapRef.current) {
      mapRef.current.fitToCoordinates([currentLocation, destination], {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });
    }
  };

  // Stop navigation
  const stopNavigation = () => {
    setIsNavigating(false);
    setTrackingMode('none');
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  // Format distance
  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Format duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

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
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        showsTraffic={true}
        showsBuildings={true}
        zoomEnabled={true}
        zoomControlEnabled={true}
        rotateEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        toolbarEnabled={true}
        loadingEnabled={true}
        loadingIndicatorColor="#0000ff"
        loadingBackgroundColor="#ffffff"
        followsUserLocation={trackingMode === 'following'}
      >
        {/* Render markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            pinColor={marker.pinColor}
          />
        ))}

        {/* Render route if navigation is active */}
        {showRoute && currentLocation && destination && (
          <MapViewDirections
            origin={currentLocation}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor="#007AFF"
            optimizeWaypoints={true}
            onStart={(params) => {
              console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
            }}
            onReady={result => {
              setRouteInfo(result);
              console.log(`Distance: ${result.distance} km`);
              console.log(`Duration: ${result.duration} min.`);
              
              // Fit map to show the entire route
              if (mapRef.current) {
                mapRef.current.fitToCoordinates(result.coordinates, {
                  edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                  animated: true,
                });
              }
            }}
            onError={(errorMessage) => {
              console.error('Directions error:', errorMessage);
            }}
          />
        )}
      </MapView>

      {/* Navigation Controls */}
      <View style={styles.controlsContainer}>
        {!isNavigating ? (
          <TouchableOpacity 
            style={styles.navigationButton}
            onPress={startNavigation}
            disabled={!currentLocation || !destination}
          >
            <Icon name="directions" size={24} color="#FFF" />
            <Text style={styles.navigationButtonText}>Start Navigation</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.navigationButton, styles.stopButton]}
            onPress={stopNavigation}
          >
            <Icon name="stop" size={24} color="#FFF" />
            <Text style={styles.navigationButtonText}>Stop Navigation</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Route Information */}
      {routeInfo && (
        <View style={styles.routeInfoContainer}>
          <View style={styles.routeInfoItem}>
            <Icon name="directions-car" size={20} color="#007AFF" />
            <Text style={styles.routeInfoText}>
              {formatDistance(routeInfo.distance * 1000)}
            </Text>
          </View>
          <View style={styles.routeInfoItem}>
            <Icon name="access-time" size={20} color="#007AFF" />
            <Text style={styles.routeInfoText}>
              {formatDuration(routeInfo.duration * 60)}
            </Text>
          </View>
        </View>
      )}

      {/* Address overlay */}
      {address && address !== 'Address not available' && (
        <View style={styles.addressOverlay}>
          <Text style={styles.addressText}>{address}</Text>
        </View>
      )}

      {/* Current Location Button */}
      <TouchableOpacity 
        style={styles.currentLocationButton}
        onPress={() => {
          if (currentLocation && mapRef.current) {
            mapRef.current.animateToRegion({
              ...currentLocation,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }, 1000);
          }
        }}
      >
        <Icon name="my-location" size={24} color="#007AFF" />
      </TouchableOpacity>
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
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  navigationButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  routeInfoContainer: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeInfoText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default ShowMap;