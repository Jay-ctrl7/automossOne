import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import { getAuthData } from '../utils/AuthStore';
import { useRoute } from '@react-navigation/native';

const CustomerKyc = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fname, setFName] = useState("");
    const [mname, setMName] = useState("");
    const [lname, setLName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [cityId, setCityId] = useState(19);
    const [zipCode, setZipCode] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const route = useRoute();
    const { city } = route.params;

    const handleImageSelection = () => {
        // In a real app, you would implement image picking logic here
        // For bare React Native without libraries, you might need to use:
        // - React Native's built-in ImagePicker (Android only)
        // - Or implement a custom native module
        Alert.alert(
            'Image Selection',
            'In a complete implementation, this would open the image picker',
            [
                { text: 'OK', onPress: () => {
                    // Mock image selection for demonstration
                    setSelectedFile({
                        uri: 'https://via.placeholder.com/150',
                        name: 'profile.jpg',
                        type: 'image/jpeg'
                    });
                }}
            ]
        );
    };

    const validateForm = () => {
        if (!fname.trim()) {
            setError("First name is required");
            return false;
        }
        if (!lname.trim()) {
            setError("Last name is required");
            return false;
        }
        if (!phone.trim()) {
            setError("Phone number is required");
            return false;
        }
        if (!address.trim()) {
            setError("Address is required");
            return false;
        }
        if (!zipCode.trim()) {
            setError("Zip code is required");
            return false;
        }
        // if (!selectedFile) {
        //     setError("Profile picture is required");
        //     return false;
        // }
        setError("");
        return true;
    };

    const PostCustomerKyc = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const authData = await getAuthData();
            const token = authData ? authData.token : undefined;

            const formData = new FormData();
            formData.append('thumb', selectedFile);
            formData.append('fname', fname);
            formData.append('mname', mname);
            formData.append('lname', lname);
            formData.append('phone', phone);
            formData.append('address', address);
            formData.append('city_id', cityId || city);
            formData.append('Zip', zipCode);
            if (email) formData.append('email', email);

            const response = await axios.post(
                ENDPOINTS.auth.Customer_Kycupdate,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
            
            console.log('Success:', response.data);
            Alert.alert("Success", "KYC information submitted successfully");
            return response.data;
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
            setError(error.response?.data?.message || "An error occurred while submitting");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        PostCustomerKyc();
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.header}>Customer KYC Form</Text>
            
            {/* Profile Picture Section */}
            {/* <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profile Picture</Text>
                <TouchableOpacity style={styles.imageContainer} onPress={handleImageSelection}>
                    {selectedFile ? (
                        <Image source={{ uri: selectedFile.uri }} style={styles.image} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.imagePlaceholderText}>+ Add Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View> */}

            {/* Personal Information Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>First Name*</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter first name"
                        value={fname}
                        onChangeText={setFName}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Middle Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter middle name"
                        value={mname}
                        onChangeText={setMName}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Last Name*</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter last name"
                        value={lname}
                        onChangeText={setLName}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
            </View>

            {/* Contact Information Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Phone Number*</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter phone number"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Address*</Text>
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        placeholder="Enter address"
                        value={address}
                        onChangeText={setAddress}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Zip Code*</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter zip code"
                        value={zipCode}
                        onChangeText={setZipCode}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>City*</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={city ? String(city) : "Enter city"}
                        value={cityId || city}
                        onChangeText={setCityId}
                        editable={!city}
                    />
                </View>
            </View>

            {/* Error Message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Submit Button */}
            <TouchableOpacity 
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.submitButtonText}>
                    {loading ? "Processing..." : "Submit KYC"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 16,
    },
    contentContainer: {
        paddingBottom: 32,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 24,
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#444',
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e9ecef',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ced4da',
    },
    imagePlaceholderText: {
        color: '#6c757d',
        fontSize: 14,
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    submitButton: {
        backgroundColor: '#007bff',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    disabledButton: {
        backgroundColor: '#6c757d',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: '#dc3545',
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 8,
    },
});

export default CustomerKyc;