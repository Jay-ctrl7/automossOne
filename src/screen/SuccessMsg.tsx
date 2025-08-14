import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SuccessMsg = () => {
    const navigation = useNavigation();
    const route = useRoute();
    
    // Safely destructure with defaults
    const { BookingResponse = {} } = route.params || {};
    const { 
        bookingId = 'N/A', 
        paymentId = 'N/A',
        userData = {} 
    } = BookingResponse;

    const {
        carManufacturer = 'Not specified',
        carModel = 'Not specified',
        fuelType = 'Not specified',
        service = 'Not specified',
        garage = 'Not specified',
        date = 'Not specified',
        time = 'Not specified',
        totalAmount = '0'
    } = userData;

    useEffect(() => {
        console.log('Booking details:', BookingResponse);
    }, []);

    const handleGoHome = () => {
        navigation.navigate('DrawerNav');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Success Animation */}
            <View style={styles.animationContainer}>
                <LottieView
                    source={require('../assets/lottie/successMsg1.json')}
                    autoPlay
                    style={styles.animation}
                    loop={true}
                />
            </View>

            {/* Success Title */}
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSubtitle}>Your booking has been confirmed</Text>

            {/* Booking Summary Card */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Icon name="receipt" size={24} color="#4CAF50" />
                    <Text style={styles.cardTitle}>Booking Summary</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Booking ID:</Text>
                    <Text style={styles.detailValue}>{bookingId}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Payment ID:</Text>
                    <Text style={styles.detailValue}>{paymentId}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Service:</Text>
                    <Text style={styles.detailValue}>{service}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Garage:</Text>
                    <Text style={styles.detailValue}>{garage}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date & Time:</Text>
                    <Text style={styles.detailValue}>{date} at {time}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Vehicle:</Text>
                    <Text style={styles.detailValue}>{carManufacturer} {carModel}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fuel Type:</Text>
                    <Text style={styles.detailValue}>{fuelType}</Text>
                </View>

                <View style={styles.divider} />

                <View style={[styles.detailRow, { marginTop: 8 }]}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalValue}>₹{totalAmount}</Text>
                </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity 
                style={styles.homeButton}
                onPress={handleGoHome}
            >
                <Icon name="home" size={20} color="#FFF" />
                <Text style={styles.homeButtonText}>Back to Home</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#F5F5F7',
        padding: 20,
        paddingBottom: 40,
    },
    animationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        marginBottom: 10,
    },
    animation: {
        width: 150,
        height: 150,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
        textAlign: 'center',
        marginBottom: 5,
    },
    successSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
        color: '#333',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 15,
        color: '#666',
        flex: 1,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        flex: 1,
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 10,
    },
    totalLabel: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
    },
    totalValue: {
        fontSize: 17,
        fontWeight: '700',
        color: '#2E7D32',
    },
    homeButton: {
        flexDirection: 'row',
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    homeButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
});

export default SuccessMsg;