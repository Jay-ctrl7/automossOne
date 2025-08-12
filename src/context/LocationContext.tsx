import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LocationData = {
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address: string;
  city: string;
  country?: string;
  isDefault?: boolean;
};

type LocationContextType = {
  location: LocationData;
  setLocation: (location: LocationData, isUserEdited?: boolean) => Promise<void>;
  resetToDefault: () => Promise<void>;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [location, setLocationState] = useState<LocationData>({ 
    address: '', 
    city: '',
    isDefault: true 
  });

  // Load saved location on startup
  useEffect(() => {
    const loadLocation = async () => {
      try {
        const savedLocation = await AsyncStorage.getItem('@user_location');
        if (savedLocation) {
          setLocationState(JSON.parse(savedLocation));
        }
      } catch (error) {
        console.error('Failed to load location', error);
      }
    };
    loadLocation();
  }, []);

  const setLocation = async (newLocation: LocationData, isUserEdited = false) => {
    const updatedLocation = {
      ...newLocation,
      isDefault: !isUserEdited
    };
    setLocationState(updatedLocation);
    await AsyncStorage.setItem('@user_location', JSON.stringify(updatedLocation));
  };

  const resetToDefault = async () => {
    setLocationState(prev => ({
      ...prev,
      isDefault: true
    }));
    await AsyncStorage.removeItem('@user_location');
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, resetToDefault }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};