import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { useLocation } from '../../context/LocationContext';
import Config from 'react-native-config';

const LocationService = () => {
  const { setLocation } = useLocation();

  const getGoogleLocationDetails = async (lat: number, lng: number) => {
    try {
      const apiKey = Config.GOOGLE_MAPS_API_KEY;
      if (!apiKey) throw new Error('Google Maps API key not configured');
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );

      const data = await response.json();
      if (data.status !== 'OK') {
        throw new Error(data.error_message || 'Geocoding failed');
      }

      const address = data.results[0];
      const extractComponent = (type: string) => 
        address.address_components.find((c: any) => c.types.includes(type))?.long_name;

      return {
        coordinates: { latitude: lat, longitude: lng },
        city: extractComponent('locality') || extractComponent('administrative_area_level_2'),
        address: address.formatted_address,
        country: extractComponent('country'),
        district: extractComponent('administrative_area_level_2'),
        state: extractComponent('administrative_area_level_1'),
        postalCode: extractComponent('postal_code')
      };
    } catch (error) {
      console.error('Google Maps API error:', error);
      throw error;
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission request error:', err);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
  let isMounted = true;
  let watchId: number;

  const fetchLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission || !isMounted) return;

    // Use watchPosition for better control
    watchId = Geolocation.watchPosition(
      async (position) => {
        try {
          const locationDetails = await getGoogleLocationDetails(
            position.coords.latitude,
            position.coords.longitude
          );
          if (isMounted) {
            setLocation({
              ...locationDetails,
              error: undefined,
              timestamp: Date.now()
            });
          }
        } catch (error) {
          if (isMounted) {
            setLocation({
              city: 'Location unavailable',
              error: error instanceof Error ? error.message : 'Failed to get location details'
            });
          }
        }
      },
      (error) => {
        if (isMounted) {
          setLocation({
            city: 'Location unavailable',
            error: error.message
          });
        }
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 50, // Only update when moving >50 meters
        interval: 10000,
        fastestInterval: 5000
      }
    );
  };

  fetchLocation();

  return () => {
    isMounted = false;
    if (watchId) Geolocation.clearWatch(watchId);
  };
}, [setLocation]);

  return null;
};

export default LocationService;