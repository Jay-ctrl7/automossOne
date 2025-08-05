import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    ScrollView,
    Text,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Image,
    Alert
} from 'react-native';
import axios from 'axios';
import { ENDPOINTS } from '../../config/api';
import { TextInput as PaperTextInput } from 'react-native-paper';


// --- Modal Picker with Search & Optional Thumb ---
const ModalPickerWithSearch = ({
    label,
    placeholder,
    visible,
    onShow,
    onHide,
    data,
    selectedId,
    onSelect,
    showThumb = true,
}) => {
    const [search, setSearch] = useState('');
    const filtered = data.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={pickerStyles.fieldContainer}>
            <Text style={pickerStyles.fieldLabel}>{label}</Text>
            <TouchableOpacity
                style={pickerStyles.inputButton}
                onPress={onShow}
                activeOpacity={0.6}
            >
                <Text
                    style={[
                        pickerStyles.inputButtonText,
                        !selectedId && { color: '#888' }
                    ]}
                >
                    {selectedId
                        ? data.find(v => v.id === selectedId)?.name ?? placeholder
                        : placeholder}
                </Text>
            </TouchableOpacity>
            <Modal
                visible={visible}
                animationType="slide"
                transparent
                onRequestClose={onHide}
            >
                <View style={pickerStyles.modalBackdrop}>
                    <View style={pickerStyles.modalBox}>
                        <TextInput
                            placeholder="Search..."
                            value={search}
                            onChangeText={setSearch}
                            style={pickerStyles.searchInput}
                            autoFocus
                        />
                        <ScrollView>
                            {filtered.length === 0 && (
                                <Text style={{ textAlign: 'center', margin: 20 }}>
                                    No results
                                </Text>
                            )}
                            {filtered.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        pickerStyles.modalItem,
                                        {
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }
                                    ]}
                                    onPress={() => {
                                        onSelect(item.id);
                                        setSearch('');
                                        onHide();
                                    }}
                                >
                                    <Text
                                        style={[
                                            pickerStyles.modalItemText,
                                            selectedId === item.id && { color: '#6200ee', fontWeight: 'bold' }
                                        ]}
                                    >
                                        {item.name}
                                    </Text>
                                    {showThumb && item.thumb ? (
                                        <Image
                                            source={{ uri: item.thumb }}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 4,
                                                marginLeft: 8,
                                                marginRight: 8,
                                                backgroundColor: '#eee'
                                            }}
                                            resizeMode="contain"
                                        />
                                    ) : showThumb ? (
                                        <View style={{
                                            width: 32,
                                            height: 32,
                                            marginLeft: 8,
                                            backgroundColor: '#eee',
                                            borderRadius: 4
                                        }} >
                                            <Image style={{
                                                width: 32,
                                                height: 32,
                                                marginLeft: 0,
                                                backgroundColor: '#eee',
                                                borderRadius: 4
                                            }} source={require('../../assets/icon/wheel.png')} />
                                        </View>
                                    ) : null}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity onPress={onHide} style={{ marginTop: 12 }}>
                            <Text
                                style={[
                                    pickerStyles.modalItemText,
                                    { textAlign: 'center', color: '#6200ee' }
                                ]}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const pickerStyles = StyleSheet.create({
    fieldContainer: {
        flex: 1,
        minWidth: 110,
        marginHorizontal: 6,
        marginBottom: 10,
    },
    fieldLabel: {
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 6,
        color: '#222',
    },
    inputButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#fafafa',
        paddingVertical: 12,
        paddingHorizontal: 14,
        minHeight: 44,
        justifyContent: 'center',
    },
    inputButtonText: {
        fontSize: 15,
        color: '#222',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#fff',
        borderRadius: 15,
        width: '90%',
        maxHeight: '75%',
        paddingVertical: 20,
        paddingHorizontal: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 12,
        fontSize: 16,
        backgroundColor: '#fafafa',
    },
    modalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    modalItemText: {
        fontSize: 17,
        color: '#222',
    },
});

const FUEL_TYPES = [
    { id: 'petrol', name: 'Petrol' },
    { id: 'diesel', name: 'Diesel' },
    { id: 'cng', name: 'CNG' },
    { id: 'ev', name: 'Electric' }
];

const ServiceLiveBooking = () => {
    // Data state
    const [categories, setCategories] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [cities, setCities] = useState([]);

    // Form 1 state
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCat, setSelectedSubCat] = useState(null);
    const [selectedSubSubCat, setSelectedSubSubCat] = useState(null);
    const [selectedManufacturer, setSelectedManufacturer] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const [selectedFuelType, setSelectedFuelType] = useState(null);
    const [heading, setHeading] = useState('');

    // Form 2 state
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [selectedCity, setSelectedCity] = useState(null);

    // Modal state
    const [catModal, setCatModal] = useState(false);
    const [subCatModal, setSubCatModal] = useState(false);
    const [subSubCatModal, setSubSubCatModal] = useState(false);
    const [manuModal, setManuModal] = useState(false);
    const [modelModal, setModelModal] = useState(false);
    const [fuelModal, setFuelModal] = useState(false);
    const [cityModal, setCityModal] = useState(false);

    // Form navigation
    const [currentForm, setCurrentForm] = useState(1);
    const [loading, setLoading] = useState(true);

    // Data fetching
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [cats, mans, city] = await Promise.all([
                    axios.get(ENDPOINTS.master.category),
                    axios.get(ENDPOINTS.master.manufacture),
                    axios.get(ENDPOINTS.master.city)
                ]);
                setCategories(cats.data?.data || []);
                setVehicles(mans.data?.data || []);
                setCities(city.data?.data || []);
            } catch (e) {
                console.error('Failed to fetch data:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper functions
    const getSubCats = () => categories.find(x => x.id === selectedCategory)?.child || [];
    const getSubSubCats = () => getSubCats().find(x => x.id === selectedSubCat)?.child || [];
    const getModels = () => vehicles.find(x => x.id === selectedManufacturer)?.model || [];

    const validateForm1 = () => {
        const errors = [];
        if (!selectedCategory) errors.push('Category is required');
        if (!selectedFuelType) errors.push('Fuel type is required');
        if (!heading.trim()) errors.push('Heading is required');
        return errors;
    };

    const proceedToForm2 = () => {
        const errors = validateForm1();
        if (errors.length > 0) {
            Alert.alert('Validation Error', errors.join('\n'));
            return;
        }
        setCurrentForm(2);
    };

    const returnToForm1 = () => {
        setCurrentForm(1);
    };

    const handleSubmit = () => {
        const formData = {
            // Form 1 data
            category: selectedCategory,
            subCategory: selectedSubCat,
            subSubCategory: selectedSubSubCat,
            manufacturer: selectedManufacturer,
            model: selectedModel,
            fuelType: selectedFuelType,
            heading: heading.trim(),

            // Form 2 data
            description: description.trim(),
            address: address.trim(),
            city: selectedCity
        };

        console.log('Submitting form data:', formData);
        // Add your form submission logic here
        Alert.alert('Success', 'Service request submitted successfully!');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Form Navigation Tabs */}
            <View style={styles.formNavContainer}>
                <TouchableOpacity
                    onPress={() => setCurrentForm(1)}
                    style={[
                        styles.formNavButton,
                        currentForm === 1 && styles.formNavButtonActive
                    ]}
                >
                    <Text style={[
                        styles.formNavText,
                        currentForm === 1 && styles.formNavTextActive
                    ]}>
                        Service Details
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        const errors = validateForm1();
                        if (errors.length > 0) {
                            Alert.alert('Complete Form 1', 'Please complete all required fields in Form 1 first');
                        } else {
                            setCurrentForm(2);
                        }
                    }}
                    style={[
                        styles.formNavButton,
                        currentForm === 2 && styles.formNavButtonActive
                    ]}
                >
                    <Text style={[
                        styles.formNavText,
                        currentForm === 2 && styles.formNavTextActive
                    ]}>
                        Additional Info
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
            >
                {currentForm === 1 ? (
                    <>
                        {/* FORM 1: Service Details */}
                        <View style={styles.row}>
                            <ModalPickerWithSearch
                                label="Category *"
                                placeholder="Select Category"
                                visible={catModal}
                                onShow={() => setCatModal(true)}
                                onHide={() => setCatModal(false)}
                                data={categories}
                                selectedId={selectedCategory}
                                onSelect={id => {
                                    setSelectedCategory(id);
                                    setSelectedSubCat(null);
                                    setSelectedSubSubCat(null);
                                }}
                                showThumb={true}
                            />
                            <ModalPickerWithSearch
                                label="Sub Category"
                                placeholder="Select"
                                visible={subCatModal}
                                onShow={() => selectedCategory && setSubCatModal(true)}
                                onHide={() => setSubCatModal(false)}
                                data={getSubCats()}
                                selectedId={selectedSubCat}
                                onSelect={id => {
                                    setSelectedSubCat(id);
                                    setSelectedSubSubCat(null);
                                }}
                                showThumb={true}
                            />
                            <ModalPickerWithSearch
                                label="Sub Sub Category"
                                placeholder="Select"
                                visible={subSubCatModal}
                                onShow={() => selectedSubCat && setSubSubCatModal(true)}
                                onHide={() => setSubSubCatModal(false)}
                                data={getSubSubCats()}
                                selectedId={selectedSubSubCat}
                                onSelect={id => setSelectedSubSubCat(id)}
                                showThumb={false}
                            />
                        </View>

                        <View style={styles.row}>
                            <ModalPickerWithSearch
                                label="Car Manufacturer"
                                placeholder="Select Manufacturer"
                                visible={manuModal}
                                onShow={() => setManuModal(true)}
                                onHide={() => setManuModal(false)}
                                data={vehicles}
                                selectedId={selectedManufacturer}
                                onSelect={id => {
                                    setSelectedManufacturer(id);
                                    setSelectedModel(null);
                                }}
                            />
                            <ModalPickerWithSearch
                                label="Model"
                                placeholder="Select Model"
                                visible={modelModal}
                                onShow={() => selectedManufacturer && setModelModal(true)}
                                onHide={() => setModelModal(false)}
                                data={getModels()}
                                selectedId={selectedModel}
                                onSelect={id => setSelectedModel(id)}
                            />
                            <ModalPickerWithSearch
                                label="Fuel Type *"
                                placeholder="Select Type"
                                visible={fuelModal}
                                onShow={() => setFuelModal(true)}
                                onHide={() => setFuelModal(false)}
                                data={FUEL_TYPES}
                                selectedId={selectedFuelType}
                                onSelect={setSelectedFuelType}
                                showThumb={false}
                            />
                        </View>

                        <Text style={styles.inputLabel}>
                            Heading (What is this service About) *
                        </Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="Brief about the service you need"
                            value={heading}
                            onChangeText={setHeading}
                        />

                        <Text style={styles.inputLabel}>Describe About Your issue</Text>
                        <TextInput
                            style={[styles.inputField, styles.multilineInput]}
                            placeholder="Write your issue here..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                        {/* <PaperTextInput
                            mode="outlined"
                            label="Fancy Input"
                            value={description}
                            onChangeText={setDescription}
                            style={styles.paperInput}
                        /> */}

                        <View style={styles.row}>
                            <View style={styles.addressContainer}>
                                <Text style={styles.inputLabel}>Address</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Enter your address"
                                    value={address}
                                    onChangeText={setAddress}
                                />
                            </View>
                            <View style={styles.cityContainer}>
                                <ModalPickerWithSearch
                                    label="City"
                                    placeholder="Select City"
                                    visible={cityModal}
                                    onShow={() => setCityModal(true)}
                                    onHide={() => setCityModal(false)}
                                    data={cities}
                                    selectedId={selectedCity}
                                    onSelect={setSelectedCity}
                                    showThumb={false}
                                />
                            </View>
                        </View>
                    </>
                ) : (
                    <>
                        {/* FORM 2: Additional Information */}
                        <Text style={styles.inputLabel}>Form 2</Text>

                    </>
                )}
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={styles.navigationContainer}>
                {currentForm === 1 ? (
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={proceedToForm2}
                    >
                        <Text style={styles.buttonText}>Continue to Additional Info</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={returnToForm1}
                        >
                            <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.buttonText}>Submit Request</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingBottom: 100,
    },
    formNavContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    formNavButton: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    formNavButtonActive: {
        borderBottomColor: '#6200ee',
    },
    formNavText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#666',
    },
    formNavTextActive: {
        color: '#6200ee',
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    addressContainer: {
        flex: 1,
        marginRight: 8,
    },
    cityContainer: {
        flex: 1,
        marginLeft: 8,
    },
    inputLabel: {
        fontWeight: '600',
        fontSize: 15,
        marginBottom: 6,
        color: '#111',
    },
    inputField: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontSize: 16,
        backgroundColor: '#fafafa',
        marginBottom: 14,
    },
    multilineInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    navigationContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    nextButton: {
        flex: 1,
        backgroundColor: '#6200ee',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    backButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 8,
    },
    submitButton: {
        flex: 2,
        backgroundColor: '#34C759',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    backButtonText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ServiceLiveBooking;