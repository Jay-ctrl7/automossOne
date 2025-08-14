import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MapScreen = () => {
  // Sample coordinates (replace with yours)
  const source = { latitude: 37.7749, longitude: -122.4194 }; // San Francisco
  const destination = { latitude: 34.0522, longitude: -118.2437 }; // Los Angeles

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: source.latitude,
          longitude: source.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker coordinate={source} title="Source" pinColor="blue" />
        <Marker coordinate={destination} title="Destination" pinColor="red" />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

export default MapScreen;