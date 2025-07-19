import { View, Text, ScrollView, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native';
import { ENDPOINTS } from '../config/api';
import axios from 'axios';

const ServiceDetails = () => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null); // Initialize as null instead of empty array
  const route = useRoute();
  const { itemId, activeFilters } = route.params;

  useEffect(() => {
    console.log("Item ID:", itemId);
    console.log("Active Filters:", activeFilters);
    fetchServiceDetails();
    console.log(details)
  }, [itemId, activeFilters]);
  useEffect(()=>{
    console.log("Details",details);
  },[details])

  const fetchServiceDetails = async () => {
  try {
    setLoading(true);
    const { data } = await axios.post(ENDPOINTS.master.packageMaster.list, {
      city_id: activeFilters.city,
      min: activeFilters.price[0],
      max: activeFilters.price[1],
      car_size: activeFilters.carSizes,
      distance: activeFilters.distance,
    });

    if (data.status === 1) {
      // Filter services that match the itemId first
      const matchingServices = data.data.filter(service => service.id === itemId);

      if (matchingServices.length === 0) {
        setDetails(null); // No matching service found
        return;
      }

      // Group the matching services (should only be one group since we filtered by ID)
      const groupedService = {
        pricing: {},
        availableSizes: [],
      };

      // Copy common properties from the first item (all should have same ID)
      Object.assign(groupedService, matchingServices[0]);

      // Add pricing for all car sizes
      matchingServices.forEach((service) => {
        groupedService.pricing[service.car_size] = {
          mrp_price: service.mrp_price,
          offer_price: service.offer_price,
        };
        if (!groupedService.availableSizes.includes(service.car_size)) {
          groupedService.availableSizes.push(service.car_size);
        }
      });

      // Set default selected size and display price
      groupedService.selectedSize = groupedService.availableSizes[0];
      groupedService.displayPrice = 
        groupedService.pricing[groupedService.availableSizes[0]].offer_price;

      setDetails(groupedService);
      console.log(details);
    }
   
  } catch (err) {
    console.error("Error fetching service details:", err);
    setError("Failed to load service details");
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView style={styles.container}}>
      {loading ? (
        <Text>Loading...</Text>
      ) : details ? (
        <>
          <Text>Service Details</Text>
          <Text>ID: {details.id}</Text>
          <Text>Name: {details.name}</Text>
          {/* Render other details as needed */}


          <View style={styles.carouselContainer}>



          </View>
        </>
      ) : (
        <Text>No details available for this service</Text>
      )}
    </ScrollView>
  )
}

export default ServiceDetails;
const styles=StyleSheet.create({
  container:{

  },
  carouselContainer:{

  }

})