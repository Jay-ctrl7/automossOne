import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import { getAuthData } from '../utils/AuthStore';
import { useRoute } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const CustomerKyc = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fname, setFName] = useState("");
    const [mname, setMName] = useState("");
    const [lname, setLName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [cityId, setCityId] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState("");
    const [customerData, setCustomerData] = useState(null);
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const route = useRoute();
    const { city } = route.params || {};

    // Fetch customer data on mount
    useEffect(() => {
        fetchCustomerInfo();
        fetchCities();
    }, []);

    // Update form when customer data loads
    useEffect(() => {
        if (customerData) {
            handleApiData();
        }
    }, [customerData]);

    const options = {
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 1024,
        maxHeight: 1024,
        includeBase64: false,
    };

    const openImagePicker = () => {
        Alert.alert(
            'Select Profile Picture',
            'Choose an option',
            [
                {
                    text: 'Take Photo',
                    onPress: () => launchCamera(options, handleResponse),
                },
                {
                    text: 'Choose from Gallery',
                    onPress: () => launchImageLibrary(options, handleResponse),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ],
            { cancelable: true },
        );
    };

    const handleResponse = (response) => {
        if (response.didCancel) {
            console.log("User cancelled image picker");
        } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
            Alert.alert('Error', 'Failed to select image');
        } else if (response.assets?.[0]) {
            const asset = response.assets[0];
            setSelectedFile({
                uri: asset.uri,
                name: asset.fileName || `profile_${Date.now()}.jpg`,
                type: asset.type || 'image/jpeg'
            });
            setError(""); // Clear any previous image error
        }
    };

    const handleApiData = () => {
        if (!customerData) return;

        setFName(customerData.fname || "");
        setMName(customerData.mname || "");
        setLName(customerData.lname || "");
        setPhone(customerData.phone || "");
        setAddress(customerData.address || "");
        setCityId(customerData.city_id || city);
        setZipCode(customerData.zip || "");
        setEmail(customerData.email || "");

        // Set selected city name if available
        if (customerData.city_id && cities.length > 0) {
            const cityObj = cities.find(c => c.id === customerData.city_id);
            if (cityObj) {
                setSelectedCity(cityObj.name);
            }
        }

        if (customerData.thumb) {
            setSelectedFile({
                uri: customerData.thumb,
                name: `profile_${Date.now()}.jpg`,
                type: 'image/jpeg'
            });
        }
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
        if (!phone.trim() || !/^\d{10,15}$/.test(phone)) {
            setError("Valid phone number is required");
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
        if (!cityId) {
            setError("City is required");
            return false;
        }
        if (!selectedFile) {
            setError("Profile picture is required");
            return false;
        }
        setError("");
        return true;
    };

    const fetchCustomerInfo = async () => {
        try {
            setFetching(true);
            const authData = await getAuthData();
            const token = authData?.token;

            if (!token) {
                Alert.alert("Error", "Please login again");
                return;
            }

            const response = await axios.post(ENDPOINTS.auth.customerinfo, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (response.data?.status === 1) {
                setCustomerData(response.data.data);
            } else {
                console.log("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Failed to fetch customer info:", error);
            Alert.alert("Error", "Failed to load customer data");
        } finally {
            setFetching(false);
        }
    };

    const fetchCities = async () => {
        try {
            const response = await axios.get(ENDPOINTS.master.city);
            if (response.data.status === 1) {
                setCities(response.data.data);
                // If city comes from params, set it
                if (city) {
                    const cityObj = response.data.data.find(c => c.id === city);
                    if (cityObj) {
                        setCityId(cityObj.id);
                        setSelectedCity(cityObj.name);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch cities:", error);
            Alert.alert("Error", "Failed to load cities");
        }
    };

    const handleCitySelect = (city) => {
        setCityId(city.id);
        setSelectedCity(city.name);
        setDropdownVisible(false);
    };

    const PostCustomerKyc = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const authData = await getAuthData();
            const token = authData?.token;

            if (!token) {
                Alert.alert("Error", "Please login again");
                return;
            }

            const formData = new FormData();

            if (selectedFile) {
                formData.append('thumb', {
                    uri: selectedFile.uri,
                    name: selectedFile.name,
                    type: selectedFile.type
                });
            }

            formData.append('fname', fname);
            formData.append('mname', mname);
            formData.append('lname', lname);
            formData.append('phone', phone);
            formData.append('address', address);
            formData.append('city_id', cityId);
            formData.append('Zip', zipCode);

            if (email) {
                formData.append('email', email);
            }

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

            if (response.data?.status === 1) {
                Alert.alert("Success", "KYC information updated successfully");
            } else {
                throw new Error(response.data?.message || "Update failed");
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMsg = error.response?.data?.message ||
                error.message ||
                "An error occurred while submitting";
            setError(errorMsg);
            Alert.alert("Error", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        await PostCustomerKyc();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                {fetching ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0066cc" />
                    </View>
                ) : (
                    <>
                        <Text style={styles.header}>Customer KYC Form</Text>

                        {/* Profile Picture Section */}
                        <View style={styles.profileSection}>
                            <TouchableOpacity
                                onPress={openImagePicker}
                                disabled={loading}
                            >
                                <View style={styles.profileImageContainer}>
                                    {selectedFile ? (
                                        <Image
                                            source={{ uri: selectedFile.uri }}
                                            style={styles.profileImage}
                                        />
                                    ) : (
                                        <View style={styles.profilePlaceholder}>
                                            <Image
                                                source={require('../assets/icon/addUser.png')}
                                                style={styles.addIcon}
                                            />
                                            <Text style={styles.profilePlaceholderText}>
                                                {customerData?.thumb ? 'Change Photo' : 'Add Photo'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.profileHelpText}>
                                Tap to {customerData?.thumb ? 'change' : 'add'} profile picture
                            </Text>
                        </View>

                        {/* Personal Information Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Personal Information</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>First Name*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter first name"
                                    value={fname}
                                    onChangeText={setFName}
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Middle Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter middle name"
                                    value={mname}
                                    onChangeText={setMName}
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Last Name*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter last name"
                                    value={lname}
                                    onChangeText={setLName}
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter email"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        {/* Contact Information Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Contact Information</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone Number*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter phone number"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    editable={!loading}
                                    maxLength={15}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Address*</Text>
                                <TextInput
                                    style={[styles.input, styles.multilineInput]}
                                    placeholder="Enter full address"
                                    value={address}
                                    onChangeText={setAddress}
                                    multiline
                                    numberOfLines={3}
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Zip Code*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter zip code"
                                    value={zipCode}
                                    onChangeText={setZipCode}
                                    keyboardType="numeric"
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>City*</Text>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => setDropdownVisible(true)}
                                    disabled={loading}
                                >
                                    <Text style={selectedCity ? styles.dropdownButtonText : styles.dropdownButtonPlaceholder}>
                                        {selectedCity || "Select a city"}
                                    </Text>
                                </TouchableOpacity>
                                
                                <Modal
                                    visible={dropdownVisible}
                                    transparent
                                    animationType="fade"
                                    onRequestClose={() => setDropdownVisible(false)}
                                >
                                    <TouchableOpacity
                                        style={styles.modalOverlay}
                                        activeOpacity={1}
                                        onPress={() => setDropdownVisible(false)}
                                    >
                                        <View style={styles.dropdownContainer}>
                                            <FlatList
                                                data={cities}
                                                keyExtractor={(item) => item.id.toString()}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        style={styles.dropdownItem}
                                                        onPress={() => handleCitySelect(item)}
                                                    >
                                                        <Text style={styles.dropdownItemText}>{item.name}</Text>
                                                    </TouchableOpacity>
                                                )}
                                                ItemSeparatorComponent={() => (
                                                    <View style={styles.dropdownSeparator} />
                                                )}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </Modal>
                            </View>
                        </View>

                        {/* Error Message */}
                        {error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : null}

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitButton, (loading || fetching) && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={loading || fetching}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    {customerData ? 'Update KYC' : 'Submit KYC'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 25,
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    profilePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    addIcon: {
        width: 40,
        height: 40,
        marginBottom: 5,
        tintColor: '#888',
    },
    profilePlaceholderText: {
        color: '#888',
        fontSize: 14,
    },
    profileHelpText: {
        marginTop: 8,
        color: '#666',
        fontSize: 12,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#444',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    dropdownButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fff',
    },
    dropdownButtonText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownButtonPlaceholder: {
        fontSize: 16,
        color: '#888',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    dropdownContainer: {
        width: '80%',
        maxHeight: '60%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
    },
    dropdownItem: {
        padding: 15,
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownSeparator: {
        height: 1,
        backgroundColor: '#eee',
    },
    submitButton: {
        backgroundColor: '#0066cc',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#99c2ff',
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: '#ff3333',
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 10,
        padding: 10,
        backgroundColor: '#ffeeee',
        borderRadius: 5,
    },
});

export default CustomerKyc;