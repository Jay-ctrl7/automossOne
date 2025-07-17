import { View, Text, FlatList, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { ENDPOINTS } from '../config/api'; // Adjust the import path as necessary


const TopCarServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const navigation = useNavigation();

   

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await axios.get(ENDPOINTS.master.category);
            
            if (response.data.status === 1 ) {
                setServices(response.data.data);
            } else {
                throw new Error('Invalid API response structure');
            }
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const screenWidth = Dimensions.get('window').width;
    const itemWidth = (screenWidth - 40) / 4;

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity 
                style={[styles.itemContainer, { width: itemWidth }]}
                onPress={() => navigation.navigate('ServiceDetails', { sId: item.id, sName:item.name })}
            >
                <View style={styles.iconContainer}>
                    <Image source={{ uri: item.thumb }} style={styles.icon} />
                </View>
                <View style={styles.textContainer}>
                    <Text 
                        style={styles.itemText}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {item.name}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const toggleShowAll = () => {
        setShowAll(!showAll);
    };

    // Determine which services to show based on showAll state
    const displayedServices = showAll ? services : services.slice(0, 8);

    if (loading && services.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading services...</Text>
            </View>
        );
    }

    if (error && services.length === 0) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load services: {error}</Text>
                <TouchableOpacity onPress={fetchServices}>
                    <Text style={styles.retryText}>Tap to retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Top Car Services</Text>
                {services.length > 8 && (
                    <TouchableOpacity onPress={toggleShowAll}>
                        <Text style={styles.seeAllText}>
                            {showAll ? 'Show Less' : 'See All'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            
            <FlatList 
                data={displayedServices}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={4}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#f8f8f8',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    seeAllText: {
        color: '#1976d2',
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#d32f2f',
        marginBottom: 10,
    },
    retryText: {
        color: '#1976d2',
        fontWeight: 'bold',
    },
    listContent: {
        paddingBottom: 10,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    itemContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 10,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    textContainer: {
        width: '100%',
        minHeight: 40, // Ensure consistent height for text containers
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    itemText: {
        fontSize: 12,
        textAlign: 'center',
        color: '#555',
        fontWeight: '500',
        lineHeight: 16,
    },
});

export default TopCarServices;