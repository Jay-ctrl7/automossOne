// src/components/LocationService.tsx
import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { useLocation } from '../../context/LocationContext';
import Config from 'react-native-config';


const LocationService = () => {
  const { setCity } = useLocation();

  const getOSMCity = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your@email.com)'
          }
        }
      );
      const data = await response.json();
      return data.address?.city || data.address?.town || 'Unknown location';
    } catch (error) {
      console.error('Error fetching city:', error);
      return 'Location unavailable';
    }
  };


const getGoogleCity = async (lat: number, lng: number): Promise<string> => {
  try {
    const apiKey = Config.GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error('Google Maps API key not configured');
    console.log("API Key: ",apiKey);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(data.error_message || 'Geocoding failed');
    }

    // Extract city from address components
    const address = data.results[0];
    const cityComponent = address.address_components.find(
      (component: any) => 
        component.types.includes('locality') || 
        component.types.includes('administrative_area_level_2')
    );

    return cityComponent?.long_name || address.formatted_address || 'Unknown location';
  } catch (error) {
    console.error('Google Maps API error:', error);
    return 'Location unavailable';
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
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const fetchLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      Geolocation.getCurrentPosition(
        async (position) => {
          const cityName = await 
          // getOSMCity(
            getGoogleCity(
            position.coords.latitude,
            position.coords.longitude
          );
          setCity(cityName);
        },
        (error) => {
          console.warn('Location error:', error);
          setCity('Location unavailable');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    fetchLocation();
  }, [setCity]);

  return null; // This component doesn't render anything
};

export default LocationService;