import { TouchableOpacity, StyleSheet,Image,View } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BtnServiceLiveBooking = ({ onPress }) => {
  return (
    <View style={styles.container}>
         <TouchableOpacity 
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* <Icon name="add" size={24} color="white" /> */}
      <Image source={require('../assets/image/logo.png')}
      style={styles.logo}/>
    </TouchableOpacity>

    </View>
   
  );
};

const styles = StyleSheet.create({
    container:{
        backgroundColor:'#fff'
    },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 50, // Adjusted from 50 to 20 to match parent
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  logo:{
    height:55,
    width:55
  },

});

export default BtnServiceLiveBooking;