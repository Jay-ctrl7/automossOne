import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useLocationStore = create(
  persist(
    (set, get) => ({
      userLocation: null,
      locationError: null,
      isLoading: false,
      
      setUserLocation: (location) => {
        if (!location || typeof location.latitude !== "number" || typeof location.longitude !== "number") {
          set({ locationError: "Invalid location data" });
          return;
        }
        set({ 
          userLocation: {
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: new Date().toISOString()
          },
          locationError: null
        });
      },
      
      clearLocation: () => set({ userLocation: null }),
      
      getCurrentLocation: async () => {
        set({ isLoading: true });
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            set({ locationError: "Permission denied" });
            return;
          }
          
          const location = await Location.getCurrentPositionAsync({});
          get().setUserLocation(location.coords);
        } catch (error) {
          set({ 
            locationError: error.message,
            userLocation: null
          });
        } finally {
          set({ isLoading: false });
        }
      },
      
      hasLocation: () => !!get().userLocation,
    }),
    {
      name: "location-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("Location store rehydrated");
        }
      },
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          // Migration logic if needed
        }
        return persistedState;
      },
    }
  )
);