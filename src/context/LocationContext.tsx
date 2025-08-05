// src/context/LocationContext.tsx
import React, { createContext, useContext, useState } from 'react';

type LocationContextType = {
  city: string;
  setCity: (city: string) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [city, setCity] = useState('');

  return (
    <LocationContext.Provider value={{ city, setCity }}>
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