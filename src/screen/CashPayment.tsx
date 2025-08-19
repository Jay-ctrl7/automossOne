import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';

const CashPayment = () => {
    const navigation = useNavigation();
    const route = useRoute();

    // Safely destructure with default empty objects
    const { params = {} } = route;
    const { BookingResponse = {}, userData = {} } = params;

    // Default values for all possible data
    const {
        booking_id = 'N/A',
        message = 'Booking Confirmed',
        status = 1,
        data_saved = {
            scedule_date: 'N/A',
            scedule_time: 'N/A',
            cust_address: 'Address not available',
            car_manufacturer_id: 'N/A',
            car_model_id: 'N/A',
            description: '',
            is_homeservice: false
        },
        order_details = {
            quote_price: 0,
            gst_amount: 0,
            platform_fee: 0,
            transaction_fee: 0
        }
    } = BookingResponse;
    const totalAmount = order_details.quote_price + order_details.gst_amount + order_details.platform_fee + order_details.transaction_fee;

    useEffect(() => {
        console.log('Complete Booking Response:', BookingResponse);
    }, [BookingResponse]);

    // Format date function
    const formatDate = (dateString) => {
        if (dateString === 'N/A') return 'N/A';
        try {
            const [month, day, year] = dateString.split('/');
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const formattedDate = formatDate(data_saved.scedule_date);

    if (!BookingResponse || Object.keys(BookingResponse).length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No booking information available</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                {/* <Icon
                    name={status === 1 ? "check-circle" : "error"}
                    size={60}
                    color={status === 1 ? "#4CAF50" : "#FF5722"}
                /> */}
                  <LottieView
                                    source={require('../assets/lottie/successMsg1.json')}
                                    autoPlay
                                    style={styles.animation}
                                    loop={true}
                                />
                <Text style={styles.successTitle}>{message}</Text>
                <Text style={styles.bookingId}>Booking ID: {booking_id}</Text>
            </View>
           
            {/* Booking Details Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Service Details</Text>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Service Type:</Text>
                    <Text style={styles.detailValue}>
                        {data_saved.is_homeservice ? 'Home Service' : 'Garage Service'}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Service:</Text>
                    <Text style={styles.detailValue}>{userData.service}</Text>
                </View>
                       <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Garage:</Text>
                    <Text style={styles.detailValue}>{userData.garage}</Text>
                </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Vehicle:</Text>
                    <Text style={styles.detailValue}>{userData.carManufacturer} {userData.carModel} ({userData.fuelType})</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>{formattedDate}</Text>
                </View>
              

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time:</Text>
                    <Text style={styles.detailValue}>{data_saved.scedule_time}</Text>
                </View>
         
                


                {data_saved.description ? (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Notes:</Text>
                        <Text style={styles.detailValue}>{data_saved.description}</Text>
                    </View>
                ) : null}
            </View>

            {/* Address Card */}
            {/* <View style={styles.card}>
        <Text style={styles.cardTitle}>Service Address</Text>
        <Text style={styles.addressText}>{data_saved.cust_address}</Text>
      </View> */}

            {/* Payment Details Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Payment Details</Text>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Service Fee:</Text>
                    <Text style={styles.detailValue}>₹{order_details.quote_price}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>GST ({order_details.gst_percent || 15}%):</Text>
                    <Text style={styles.detailValue}>₹{order_details.gst_amount}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Platform Fee:</Text>
                    <Text style={styles.detailValue}>₹{order_details.platform_fee}</Text>
                </View>

                <View style={styles.divider} />

                <View style={[styles.detailRow, { marginTop: 10 }]}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalValue}>₹{totalAmount}</Text>
                </View>

                <View style={styles.paymentMethod}>
                    {/* <Icon name="attach-money" size={20} color="#4CAF50" /> */}
                    <Text style={styles.paymentText}>Cash on Delivery</Text>
                </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
                style={[styles.button, { backgroundColor: '#4CAF50' }]}
                onPress={() => navigation.navigate('home')}
            >
                <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: '#2196F3', marginTop: 10 }]}
                onPress={() => console.log('Contact Support')}
            >
                <Text style={styles.buttonText}>Contact Support</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
        textAlign: 'center',
    },
    bookingId: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 16,
        color: '#666',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        textAlign: 'right',
        flexShrink: 1,
    },
    addressText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 10,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E91E63',
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    paymentText: {
        fontSize: 16,
        color: '#4CAF50',
        marginLeft: 8,
        fontWeight: 'bold',
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 18,
        color: '#F44336',
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 20,
    },
});

export default CashPayment;