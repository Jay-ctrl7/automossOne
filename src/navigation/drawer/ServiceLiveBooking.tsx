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
    Alert,
    Platform,
    PermissionsAndroid,
    FlatList

} from 'react-native';
import axios from 'axios';
import { ENDPOINTS } from '../../config/api';
import { launchImageLibrary } from 'react-native-image-picker';
// import AudioRecorderPlayer from 'react-native-audio-recorder-player';
// import RNFS from 'react-native-fs'; // For file system operations
import { useLocationStore } from '../../stores/locationStore'
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';


// Initialize audio recorder
// const audioRecorderPlayer = AudioRecorderPlayer;

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
                        <TouchableOpacity onPress={onHide} style={{ position: 'absolute', top: 10, right: 10 }}>
                            <Icon name="close" size={24} color="#6200ee" />
                        </TouchableOpacity>
                        <View style={styles.subContainer}>
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
                                    {showThumb && (
                                        item.thumb ? (
                                            <Image
                                                source={{ uri: item.thumb }}
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 4,
                                                    marginLeft: 6,
                                                    marginRight: 8,
                                                    backgroundColor: '#eee'
                                                }}
                                            />
                                        ) : (
                                            <View style={{
                                                width: 32,
                                                height: 32,
                                                marginLeft: 8,
                                                backgroundColor: '#eee',
                                                borderRadius: 4
                                            }}>
                                                <Image
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        marginLeft: 0,
                                                        backgroundColor: '#eee',
                                                        borderRadius: 4
                                                    }}
                                                    source={require('../../assets/icon/wheel.png')}
                                                />
                                            </View>
                                        )
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        </View>

                       
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
const ModalForCar = ({
    label,
    placeholder,
    visible,
    onShow,
    onHide,
    data,
    selectedId,
    onSelect,
    showThumb = true,
    autoOpenNextModal = null
}) => {
    const [search, setSearch] = useState('');
    const filtered = data.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    // Calculate number of columns based on screen width
    const screenWidth = Dimensions.get('window').width;
    const numColumns = Math.floor(screenWidth / 120); // Aim for ~120px per item

    const handleItemSelect = (id) => {
        onSelect(id);
        setSearch('');
        onHide();
        
        if (autoOpenNextModal && typeof autoOpenNextModal === 'function') {
            setTimeout(() => autoOpenNextModal(), 300);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.gridItem,
                selectedId === item.id && styles.selectedGridItem
            ]}
            onPress={() => handleItemSelect(item.id)}
        >
            {showThumb ? (
                <View style={styles.gridIconContainer}>
                    {item.thumb ? (
                        <Image
                            source={{ uri: item.thumb }}
                            style={styles.gridIcon}
                            resizeMode="contain"
                        />
                    ) : (
                        <Icon 
                            name={label.includes('Model') ? "directions-car" : "branding-watermark"} 
                            size={36} 
                            color="#666" 
                        />
                    )}
                </View>
            ) : (
                <View style={styles.gridIconContainer}>
                    <Icon name="local-gas-station" size={36} color="#666" />
                </View>
            )}
            <Text style={styles.gridItemText} numberOfLines={2}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={pickerStyles.fieldContainer}>

            <Text style={pickerStyles.fieldLabel}>{label}</Text>
            <TouchableOpacity
                style={pickerStyles.inputButton}
                onPress={onShow}
                activeOpacity={0.6}
            >
                <View style={pickerStyles.inputContent}>
                    {/* {showThumb && (
                        <View style={pickerStyles.thumbnailContainer}>
                            {selectedId && data.find(v => v.id === selectedId)?.thumb ? (
                                // <Image
                                //     source={{ uri: data.find(v => v.id === selectedId)?.thumb }}
                                //     style={pickerStyles.thumbnail}
                                // />
                            ) : (
                                // <Icon 
                                //     name={label.includes('Model') ? "directions-car" : 
                                //           label.includes('Fuel') ? "local-gas-station" : "branding-watermark"} 
                                //     size={24} 
                                //     color="#666" 
                                // />
                            )}
                        </View>
                    )} */}
                    <Text
                        style={[
                            pickerStyles.inputButtonText,
                            !selectedId && { color: '#888' }
                        ]}
                        numberOfLines={1}
                    >
                        {selectedId
                            ? data.find(v => v.id === selectedId)?.name ?? placeholder
                            : placeholder}
                    </Text>
                </View>
                {/* <Icon name="chevron-right" size={20} color="#999" /> */}
            </TouchableOpacity>
            
            <Modal
                visible={visible}
                animationType="slide"
                transparent={true}
                onRequestClose={onHide}
            >
                <View style={pickerStyles.modalBackdrop}>
                    
                    <View style={[pickerStyles.modalBox]}>
                         <TouchableOpacity onPress={onHide} style={{ position: 'absolute', top: 10, right: 10 }}>
                            <Icon name="close" size={24} color="#6200ee" />
                        </TouchableOpacity>
                        
                       
                        <TextInput
                            placeholder="Search..."
                            value={search}
                            onChangeText={setSearch}
                            style={pickerStyles.searchInput}
                            autoFocus
                        />
                        
                        <View style={{flex:0}}>
                              <FlatList
                            data={filtered}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                            numColumns={numColumns}
                            contentContainerStyle={styles.gridContainer}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Icon name="error-outline" size={40} color="#ccc" />
                                    <Text style={styles.emptyStateText}>No results found</Text>
                                </View>
                            }
                        />

                        </View>
                      
                        
                        <TouchableOpacity onPress={onHide} style={{ marginTop: 0 }}>
                            <Text style={[pickerStyles.modalItemText, { textAlign: 'center', color: '#6200ee' }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// Add these styles to your existing stylesheet


const ServiceLiveBooking = () => {
    // Data state
    const [categories, setCategories] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [cities, setCities] = useState([]);
    const [fuel, setFuel] = useState([]);

    // Form state
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCat, setSelectedSubCat] = useState(null);
    const [selectedSubSubCat, setSelectedSubSubCat] = useState(null);
    const [selectedManufacturer, setSelectedManufacturer] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const [selectedFuelType, setSelectedFuelType] = useState(null);
    const [heading, setHeading] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [selectedCity, setSelectedCity] = useState(null);
    const [images, setImages] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});

    //Modal Visibility
    const [catModal, setCatModal] = useState(false);
    const [subCatModal, setSubCatModal] = useState(false);
    const [subSubCatModal, setSubSubCatModal] = useState(false);
    const [manuModal, setManuModal] = useState(false);
    const [modelModal, setModelModal] = useState(false);
    const [fuelModal, setFuelModal] = useState(false);
    const [cityModal, setCityModal] = useState(false);

    // UI state
    const [currentForm, setCurrentForm] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Audio state
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordPath, setRecordPath] = useState('');
    const [currentPosition, setCurrentPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [recordingTimer, setRecordingTimer] = useState(0);

    // Location
    const { userLocation } = useLocationStore();
    const latitude = userLocation?.latitude;
    const longitude = userLocation?.longitude;

    // Helper functions
    const getSubCats = () => categories.find(x => x.id === selectedCategory)?.child || [];
    const getSubSubCats = () => getSubCats().find(x => x.id === selectedSubCat)?.child || [];
    const getModels = () => vehicles.find(x => x.id === selectedManufacturer)?.model || [];

    // Data fetching
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [cats, mans, city, fuel] = await Promise.all([
                    axios.get(ENDPOINTS.master.category),
                    axios.get(ENDPOINTS.master.manufacture),
                    axios.get(ENDPOINTS.master.city),
                    axios.get(ENDPOINTS.master.fuel)
                ]);
                setCategories(cats.data?.data || []);
                setVehicles(mans.data?.data || []);
                setCities(city.data?.data || []);
                setFuel(fuel.data?.data || []);
            } catch (e) {
                console.error('Failed to fetch data:', e);
                Alert.alert('Error', 'Failed to load form data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    // useEffect(() => {
    //     let interval;
    //     if (isRecording) {
    //         setRecordingTimer(0); // Reset timer when starting
    //         interval = setInterval(() => {
    //             setRecordingTimer(prev => prev + 1); // Increment every second
    //         }, 1000);
    //     }
    //     return () => clearInterval(interval); // Cleanup on unmount or stop
    // }, [isRecording]);

    // Form validation
    const validateForm1 = () => {
        const errors = {};
        // if (!selectedCategory) errors.category = 'Category is required';
        // if (!selectedFuelType) errors.fuelType = 'Fuel type is required';
        // if (!heading.trim()) errors.heading = 'Heading is required';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateForm2 = () => {
        const errors = {};
        if (!description.trim()) errors.description = 'Description is required';
        if (!address.trim()) errors.address = 'Address is required';
        if (!selectedCity) errors.city = 'City is required';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Image handling
    const openImagePicker = () => {
        if (images.length >= 5) {
            Alert.alert('Limit reached', 'You can upload a maximum of 5 images.');
            return;
        }

        const options = {
            mediaType: 'photo',
            selectionLimit: 5 - images.length,
            includeBase64: false,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert('Error', response.errorMessage || 'Image selection failed');
                return;
            }

            const selected = response.assets || [];
            if ((images.length + selected.length) > 5) {
                Alert.alert('Limit', 'You can only select up to 5 images.');
                return;
            }

            setImages(prev => [...prev, ...selected]);
        });
    };

    // Audio handling
    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            try {
                const grants = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                ]);

                if (
                    grants['android.permission.RECORD_AUDIO'] !== PermissionsAndroid.RESULTS.GRANTED
                    // ||
                    // grants['android.permission.WRITE_EXTERNAL_STORAGE'] !== PermissionsAndroid.RESULTS.GRANTED
                ) {
                    Alert.alert('Permissions required', 'Audio recording requires microphone and storage permissions');
                    console.log("Granted Permissions", grants);
                    return false;
                }
                return true;
            } catch (err) {
                console.error('Permission error:', err);
                return false;
            }
        }
        return true;
    };

    const getAudioPath = () => {
        const audioDir = Platform.select({
            ios: RNFS.LibraryDirectoryPath,
            android: RNFS.ExternalDirectoryPath,
        });
        const fileName = `recording_${Date.now()}.mp3`;
        return `${audioDir}/${fileName}`;
    };

    const startRecording = async () => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            const path = getAudioPath();
            console.log('Starting recording at:', path);

            setRecordPath(path);

            await audioRecorderPlayer.startRecorder(path);
            audioRecorderPlayer.addRecordBackListener((e) => {
                console.log('Recording progress:', e.currentPosition);
            });

            setIsRecording(true);
            setCurrentPosition(0);
            setDuration(0);


        } catch (error) {
            console.error('Recording start error:', error);
            Alert.alert('Error', 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        try {
            const currentPath = recordPath;
            if (!currentPath) {
                throw new Error('No recording path available');
            }

            await audioRecorderPlayer.stopRecorder();
            audioRecorderPlayer.removeRecordBackListener();
            setIsRecording(false);

            console.log('Recording stopped, verifying file at:', currentPath);

            // Verify file exists with proper path handling
            const filePath = Platform.OS === 'android' ? currentPath : `file://${currentPath}`;
            const exists = await RNFS.exists(filePath);

            if (!exists) {
                throw new Error(`Recording file not found at ${filePath}`);
            }


            const stats = await RNFS.stat(filePath);
            const fileSize = stats.size;
            // Approximate: 16kbps = 2KB/sec, adjust based on your recording settings
            const estimatedDuration = Math.floor((fileSize / 2000) * 1000);
            setDuration(estimatedDuration);
            setCurrentPosition(0);



            console.log('Recording successfully saved at:', filePath);
            return filePath;
        } catch (error) {
            console.error('Stop recording error:', error);
            Alert.alert('Error', 'Failed to save recording: ' + error.message);
            return null;
        }
    };

    const playRecording = async () => {
        if (!recordPath) {
            Alert.alert('No recording', 'Please record audio first');
            return;
        }

        try {
            const exists = await RNFS.exists(recordPath);
            if (!exists) {
                throw new Error('Audio file not found');
            }

            await audioRecorderPlayer.stopPlayer();
            audioRecorderPlayer.removePlayBackListener();

            const msg = await audioRecorderPlayer.startPlayer(recordPath);
            console.log('Playback started:', msg);

            audioRecorderPlayer.addPlayBackListener((e) => {
                setCurrentPosition(e.currentPosition);
                setDuration(e.duration);
                setIsPlaying(true);

                if (e.currentPosition >= e.duration) {
                    setIsPlaying(false);
                }
            });
        } catch (err) {
            console.error('Playback error:', err);
            Alert.alert('Error', 'Failed to play recording');
        }
    };

    const stopPlayback = async () => {
        try {
            await audioRecorderPlayer.stopPlayer();
            audioRecorderPlayer.removePlayBackListener();
            setIsPlaying(false);
            setCurrentPosition(0);
        } catch (err) {
            console.error('Stop playback error:', err);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Form navigation
    const proceedToForm2 = () => {
        if (!validateForm1()) return;
        setCurrentForm(2);
    };

    const returnToForm1 = () => {
        setCurrentForm(1);
    };

    // Form submission
    const handleSubmit = async () => {
        if (!validateForm2()) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Add form fields
            formData.append('category', selectedCategory);
            formData.append('subCategory', selectedSubCat);
            formData.append('subSubCategory', selectedSubSubCat);
            formData.append('manufacturer', selectedManufacturer);
            formData.append('model', selectedModel);
            formData.append('fuelType', selectedFuelType);
            formData.append('heading', heading.trim());
            formData.append('description', description.trim());
            formData.append('address', address.trim());
            formData.append('city', selectedCity);
            formData.append('latitude', latitude);
            formData.append('longitude', longitude);

            // Add images
            images.forEach((image, index) => {
                formData.append('images', {
                    uri: image.uri,
                    type: image.type || 'image/jpeg',
                    name: `image_${index}.jpg`
                });
            });

            // Add audio if exists
            // if (recordPath) {
            //     const audioFile = {
            //         uri: `file://${recordPath}`,
            //         type: 'audio/mp3',
            //         name: `recording.mp3`
            //     };
            //     formData.append('audio', audioFile);
            // }

            const response = await axios.post(ENDPOINTS.customer.jobcardInsert, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                Alert.alert('Success', 'Service request submitted successfully!');
                // Reset form or navigate away
            } else {
                throw new Error(response.data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Submission error:', error);
            Alert.alert('Error', error.message || 'Failed to submit service request');
        } finally {
            setIsSubmitting(false);
        }
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
                    onPress={proceedToForm2}
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
                                label="S-sub Category"
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
                            <ModalForCar
                                label="Manufacturer"
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
                                autoOpenNextModal={() => selectedManufacturer && setModelModal(true)}
                            />
                            <ModalForCar
                                label="Model"
                                placeholder="Select Model"
                                visible={modelModal}
                                onShow={() => selectedManufacturer && setModelModal(true)}
                                onHide={() => setModelModal(false)}
                                data={getModels()}
                                selectedId={selectedModel}
                                onSelect={id => setSelectedModel(id)}
                            />
                            <ModalForCar
                                label="Fuel Type *"
                                placeholder="Select Type"
                                visible={fuelModal}
                                onShow={() => setFuelModal(true)}
                                onHide={() => setFuelModal(false)}
                                data={fuel}
                                selectedId={selectedFuelType}
                                onSelect={setSelectedFuelType}
                                showThumb={false}
                            />
                        </View>

                        <Text style={styles.inputLabel}>
                            Heading (What is this service About) *
                        </Text>
                        <TextInput
                            style={[styles.inputField, fieldErrors.heading && styles.errorField]}
                            placeholder="Brief about the service you need"
                            value={heading}
                            onChangeText={setHeading}
                        />
                        {fieldErrors.heading && <Text style={styles.errorText}>{fieldErrors.heading}</Text>}

                        <Text style={styles.inputLabel}>Describe About Your issue</Text>
                        <TextInput
                            style={[styles.inputField, styles.multilineInput]}
                            placeholder="Write your issue here..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />

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
                        <View style={styles.imageContainer}>
                            <Text style={styles.inputLabel}>Add Photo (Max 5)</Text>
                            <TouchableOpacity
                                style={styles.inputImage}
                                onPress={openImagePicker}
                                disabled={images.length >= 5}
                            >
                                <Text style={styles.inputImageLabel}>
                                    {images.length >= 5 ? 'Maximum 5 images' : 'Drop Image(s)'}
                                </Text>
                            </TouchableOpacity>

                            <ScrollView horizontal>
                                {images.map((img, idx) => (
                                    <View key={idx} style={{ margin: 5, position: 'relative' }}>
                                        <Image
                                            source={{ uri: img.uri }}
                                            style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#ddd' }}
                                        />
                                        <TouchableOpacity
                                            style={{ position: 'absolute', top: 2, right: 2, backgroundColor: '#fff', borderRadius: 10 }}
                                            onPress={() => {
                                                setImages(images.filter((_, i) => i !== idx));
                                            }}
                                        >
                                            <Text style={{ color: 'red', fontWeight: 'bold', padding: 2 }}>X</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>

                        {/* <View style={styles.audioContainer}>
                            <Text style={styles.inputLabel}>Audio Recording</Text>

                            <View style={styles.audioControls}>
                                <TouchableOpacity
                                    style={[styles.audioButton, isPlaying && styles.audioButtonActive]}
                                    onPress={isPlaying ? stopPlayback : playRecording}
                                    disabled={!recordPath}
                                >
                                    <Text style={styles.audioButtonText}>
                                        {isPlaying ? 'Stop Playback' : 'Play Recording'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.audioButton, isRecording && styles.audioButtonActive]}
                                    onPress={isRecording ? stopRecording : startRecording}
                                >
                                    <Text style={styles.audioButtonText}>
                                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {
                                !isRecording && (
                                    <View style={styles.timerContainer}>
                                        <Text style={styles.timerText}>
                                            {formatTime(currentPosition / 1000)} / {formatTime(duration / 1000)}
                                        </Text>
                                    </View>
                                )
                            }
                            {
                                isRecording && (
                                    <View style={styles.timerContainer}>
                                        <Text style={styles.timerText}>
                                            Recording... {formatTime(recordingTimer)}
                                        </Text>
                                    </View>
                                )
                            }

                            {recordPath && (
                                <Text style={styles.audioPathText}>
                                    Audio saved: {recordPath.split('/').pop()}
                                </Text>
                            )}
                        </View> */}
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
                            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.buttonText}>Submit Request</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

const pickerStyles = StyleSheet.create({
    fieldContainer: {
        flex: 1,
        marginHorizontal: 4,
        marginBottom: 16,
        
    },
    fieldLabel: {
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 6,
        color: '#333',
    },
    inputButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        height: 48,
        justifyContent: 'center',
    },
    inputButtonText: {
        fontSize: 15,
        color: '#333',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalBox: {
        backgroundColor: 'white',
        borderRadius: 12,
        maxHeight: '70%',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
        backgroundColor: '#f8f8f8',
    },
    modalItem: {
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    // modalItemText: {
    //     fontSize: 15,
    //     color: '#333',
    //     flex: 1,
    // },
});
// Add these additional styles:
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    subContainer:{
margin: 16,
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
    imageContainer: {
        marginBottom: 16,
    },
    imageHeader: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 6,
        color: '#111',
    },
    inputImage: {
        padding: 20,
        backgroundColor: '#fafafa',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 10,
        alignSelf: 'flex-start', // makes button shrink to content
    },
    inputImageLabel: {
        color: 'red',
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'center',
    },
    thumbRow: {
        flexDirection: 'row',
        marginTop: 8,
    },
    thumbContainer: {
        marginRight: 10,
        position: 'relative',
    },
    thumbImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#ddd',
    },
    removeBtn: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 10,
        paddingHorizontal: 4,
        paddingVertical: 1,
        zIndex: 2,
    },
    removeText: {
        color: '#e53935',
        fontWeight: 'bold',
        fontSize: 13,
        textAlign: 'center',
    },
    audioContainer: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    audioControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    audioButton: {
        flex: 1,
        marginHorizontal: 5,
        padding: 12,
        backgroundColor: 'red',
        borderRadius: 8,
        alignItems: 'center',
    },
    audioButtonActive: {
        backgroundColor: '#3700b3',
    },
    audioButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    timerContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    timerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    audioPathText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
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
        backgroundColor: 'red',
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
        backgroundColor: 'green',
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

    errorField: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
    },
    submitButtonDisabled: {
        backgroundColor: '#aaa',
    },

   modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        margin: 0, // Add this to remove any default margins
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        maxHeight: '80%',
        width: '100%', // Ensure it takes full width
        marginBottom: 0, // Explicitly set to 0
        // Add shadow for better visual connection
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: '#f8f8f8',
    },
    grid: {
        justifyContent: 'space-between',
    },
    item: {
        alignItems: 'center',
        padding: 8,
        marginBottom: 12,
        width: '30%', // Will be overridden by FlatList's numColumns
    },
    selectedItem: {
        backgroundColor: '#f0f8ff',
        borderRadius: 8,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        width: 40,
        height: 40,
    },
    itemText: {
        fontSize: 12,
        textAlign: 'center',
        color: '#333',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
    },
    
    gridContainer: {
        padding: 8,
    },
    gridItem: {
        alignItems: 'center',
        padding: 12,
        margin: 4,
        width: '30%', // Will be overridden by numColumns
    },
    selectedGridItem: {
        backgroundColor: '#f0f8ff',
        borderRadius: 8,
    },
    gridIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    gridIcon: {
        width: 40,
        height: 40,
    },
    gridItemText: {
        fontSize: 12,
        textAlign: 'center',
        color: '#333',
    },
    emptyState: {
        padding: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
    },

});

export default ServiceLiveBooking;