import React, { useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';


const ShowMap = () => {
  const [region, setRegion] = useState({
    latitude: 37.78825,    // Default latitude (San Francisco)
    longitude: -122.4324,  // Default longitude
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [markers, setMarkers] = useState([
    {
      id: 1,
      title: "Golden Gate Bridge",
      description: "Iconic suspension bridge",
      coordinate: { latitude: 37.8199, longitude: -122.4783 },
    },
    {
      id: 2,
      title: "Alcatraz Island",
      description: "Famous former prison",
      coordinate: { latitude: 37.8267, longitude: -122.4233 },
    },
    {
        id:3,
        title:"Bhubaneswar",
        description:"Capital city of Odisha",
        coordinate: { latitude: 20.2961, longitude: 85.8245 },
    }
  ]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default ShowMap;