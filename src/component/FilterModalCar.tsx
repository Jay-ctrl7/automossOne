import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import CheckBox from '@react-native-community/checkbox';
import LocationFilterSection from './filter-sections/LocationFilterSection';
import GarageFilterSection from './filter-sections/GarageFilterSection';
import PriceFilterSection from './filter-sections/PriceFilterSection';
import CategoryFilterSection from './filter-sections/CategoryFilterSection';
import CarSizeFilterSection from'./filter-sections/CarSizeFilterSection';
import RatingFilterSection from'./filter-sections/RatingFilterSection';

// --- Default values used everywhere ---
const DEFAULT_CITY = 19; // fallback for Bhubaneswar
const DEFAULT_DISTANCE = 50;
const DEFAULT_PRICE = [100, 10000];
const DEFAULT_CAR_SIZES = ['small', 'medium', 'extra large', 'premium'];
const NO_VALUE = null;

// Helper to deep compare arrays
const areArraysEqual = (a, b) =>
  Array.isArray(a) && Array.isArray(b) &&
  a.length === b.length && a.every((v, i) => v === b[i]);

const getDefaultFilters = () => ({
  city: DEFAULT_CITY,
  distance: DEFAULT_DISTANCE,
  price: DEFAULT_PRICE,
  categories: [],
  subcategories: [],
  carSizes: [...DEFAULT_CAR_SIZES],
});

// -------- Main Modal Component --------
const FilterModalCar = ({
  visible,
  onClose,
  onApplyFilters,
  initialFilters = getDefaultFilters(),
  onResetFilters,
  hasActiveFilters
}) => {
  const [filters, setFilters] = useState(getDefaultFilters());
  // Ensure fresh filters on modal open
  useEffect(() => {
    setFilters({ ...getDefaultFilters(), ...initialFilters });
  }, [initialFilters, visible]);

  // Check if any filter is changed from default
  const hasLocalActiveFilters = useMemo(() => {
    const def = getDefaultFilters();
    return (
      filters.city !== def.city ||
      filters.distance !== def.distance ||
      !areArraysEqual(filters.price, def.price) ||
      filters.categories.length > 0 ||
      filters.subcategories.length > 0 ||
      !areArraysEqual(filters.carSizes, def.carSizes)
    );
  }, [filters]);

  // --- Reset logic
  const handleReset = () => {
    const reset = getDefaultFilters();
    setFilters(reset);
    onResetFilters && onResetFilters(reset);
  };

  // --- Apply logic
  const handleApply = () => {
    onApplyFilters && onApplyFilters({ ...filters, filterActive: true });
    onClose && onClose();
  };

  const [selectedServiceId, setSelectedServiceId] = useState('1');

  const services = useMemo(() => [
    {
      id: '1',
      name: 'Location',
      icon: 'map-marker',
      component: (
        <LocationFilterSection
          key="location"
          selectedCity={filters.city}
          onCitySelect={city => setFilters(prev => ({ ...prev, city }))}
        />
      )
    },
    {
      id: '2',
      name: 'Garage Distance',
      icon: 'wrench',
      component: (
        <GarageFilterSection
          key="garage"
          selectedDistance={filters.distance}
          onDistanceSelect={distance =>
            setFilters(prev => ({ ...prev, distance }))
          }
        />
      )
    },
    {
      id: '3',
      name: 'Price Range',
      icon: 'rupee',
      component: (
        <PriceFilterSection
          key="price"
          selectedPrice={filters.price}
          onPriceSelect={price =>
            setFilters(prev => ({ ...prev, price }))
          }
        />
      )
    },
    {
      id: '4',
      name: 'Services',
      icon: 'list',
      component: (
        <CategoryFilterSection
          key="category"
          selectedCategories={filters.categories}
          selectedSubcategories={filters.subcategories}
          onCategorySelect={(catId, isSelected, childrenIds=[]) => {
            setFilters(prev => {
              // Update categories
              let cats = isSelected
                ? [...prev.categories, catId]
                : prev.categories.filter(id => id !== catId);
              // Subcat logic
              let subcats = [...prev.subcategories];
              if (isSelected && childrenIds.length) {
                // select all subcats if parent selected
                subcats = Array.from(new Set([...subcats, ...childrenIds]));
              }
              if (!isSelected && childrenIds.length) {
                // remove subcats if parent is deselected
                subcats = subcats.filter(id => !childrenIds.includes(id));
              }
              return { ...prev, categories: cats, subcategories: subcats };
            });
          }}
          onSubcategorySelect={(subcatId, isSelected, parentId, siblings=[]) => {
            setFilters(prev => {
              let subcats = isSelected
                ? [...prev.subcategories, subcatId]
                : prev.subcategories.filter(id => id !== subcatId);
              // auto-select/deselect parent as needed
              let cats = [...prev.categories];
              if (isSelected && !cats.includes(parentId)) {
                cats.push(parentId);
              }
              if (
                !isSelected &&
                siblings.every(sid => sid === subcatId || !subcats.includes(sid))
              ) {
                // if all siblings are unchecked, uncheck parent
                cats = cats.filter(id => id !== parentId);
              }
              return { ...prev, categories: cats, subcategories: subcats };
            });
          }}
        />
      )
    },
    {
      id: '5',
      name: 'Car Sizes',
      icon: 'car',
      component: (
        <CarSizeFilterSection
          key="carSizes"
          selectedSizes={filters.carSizes}
          onSizeSelect={(size, isSelected) => {
            setFilters(prev => ({
              ...prev,
              carSizes: isSelected
                ? [...prev.carSizes, size]
                : prev.carSizes.filter(s => s !== size)
            }));
          }}
        />
      )
    },
    { // Just visual demo, not hooked up
      id: '6',
      name: 'Customer Ratings',
      icon: 'star',
      component: <RatingFilterSection key="ratings"/>
    }
  ], [filters]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* --- Header --- */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <View style={styles.headerActions}>
              {(hasLocalActiveFilters || hasActiveFilters) && (
                <TouchableOpacity onPress={handleReset} style={styles.resetHeaderButton}>
                  <Text style={styles.resetHeaderText}>Reset</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} testID="closeModal">
                <Icon name="times" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* --- Main Tabs/View ---  */}
          <View style={styles.mainContainer}>
            {/* Left nav */}
            <View style={styles.listContainer}>
              <FlatList
                data={services}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.serviceItem,
                      selectedServiceId === item.id && styles.selectedItem
                    ]}
                    onPress={() => setSelectedServiceId(item.id)}
                  >
                    <Icon
                      name={item.icon}
                      size={16}
                      color={selectedServiceId === item.id ? '#007AFF' : '#666'}
                    />
                    <Text style={[
                      styles.serviceName,
                      selectedServiceId === item.id && styles.selectedText
                    ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            {/* Filtering UI */}
            <View style={styles.detailsContainer}>
              <View style={styles.filterContentContainer}>
                {services.find(s => s.id === selectedServiceId)?.component}
              </View>
            </View>
          </View>

          {/* --- Footer --- */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={styles.buttonText}>Reset All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.applyButton,
                !hasLocalActiveFilters && styles.disabledButton
              ]}
              onPress={handleApply}
              disabled={!hasLocalActiveFilters}
            >
              <Text style={[styles.buttonText, styles.applyButtonText]}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ----------- Subcomponents Below -----------

// const LocationFilterSection = ({ selectedCity, onCitySelect }) => {
//   const [cities, setCities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   useEffect(() => {
//     let isActive = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get(ENDPOINTS.master.city);
//         if (res.data.status === 1 && isActive) setCities(res.data.data);
//       } catch (err) {
//         if (isActive) setError('Failed to load cities');
//       } finally {
//         if (isActive) setLoading(false);
//       }
//     })();
//     return () => { isActive = false; };
//   }, []);
//   if (loading) return (
//     <View style={localStyles.loadingContainer}>
//       <ActivityIndicator size="small" color="#007AFF"/>
//       <Text style={localStyles.loadingText}>Loading cities...</Text>
//     </View>
//   );
//   if (error) return (
//     <View style={localStyles.errorContainer}>
//       <Text style={localStyles.errorText}>{error}</Text>
//     </View>
//   );
//   return (
//     <View style={localStyles.container}>
//       <Text style={localStyles.sectionTitle}>Select City</Text>
//       <FlatList
//         data={cities}
//         keyExtractor={item => String(item.id)}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={[
//               localStyles.cityItem,
//               selectedCity === item.id && localStyles.selectedCityItem
//             ]}
//             onPress={() => onCitySelect(item.id)}
//           >
//             <Text style={localStyles.cityText}>{item.name}</Text>
//             {selectedCity === item.id && (
//               <Icon name="check" size={16} color="#007AFF"/>
//             )}
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );
// };

// const GarageFilterSection = ({ selectedDistance, onDistanceSelect }) => {
//   const distanceOptions = [
//     { id: '5', name: 'Within 5 km', value: 5 },
//     { id: '10', name: 'Within 10 km', value: 10 },
//     { id: '25', name: 'Within 25 km', value: 25 },
//     { id: '50', name: 'Within 50 km', value: 50 },
//     { id: 'any', name: 'Any Distance', value: DEFAULT_DISTANCE }
//   ];
//   return (
//     <View style={garageStyles.container}>
//       <Text style={garageStyles.sectionTitle}>Maximum Distance (km)</Text>
//       {distanceOptions.map(option => (
//         <TouchableOpacity
//           key={option.id}
//           style={[
//             garageStyles.optionContainer,
//             selectedDistance === option.value && garageStyles.selectedOption
//           ]}
//           onPress={() => onDistanceSelect(option.value)}
//         >
//           <CheckBox
//             value={selectedDistance === option.value}
//             onValueChange={() => onDistanceSelect(option.value)}
//             tintColors={{ true: '#007AFF', false: '#A5A5A5' }}
//             style={garageStyles.checkbox}
//           />
//           <Text style={garageStyles.optionText}>{option.name}</Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// };

// const PriceFilterSection = ({ selectedPrice, onPriceSelect }) => {
//   const priceOptions = [
//     { id: '1', name: '₹100 - ₹1000', value: [100, 1000] },
//     { id: '2', name: '₹1000 - ₹3000', value: [1000, 3000] },
//     { id: '3', name: '₹3000 - ₹7000', value: [3000, 7000] },
//     { id: '4', name: '₹7000 - ₹15000', value: [7000, 15000] },
//     { id: '5', name: '₹15000+', value: [15000, 50000] },
//     { id: 'any', name: 'Any price', value: DEFAULT_PRICE }
//   ];
//   const isPriceSelected = (range) =>
//     Array.isArray(selectedPrice) &&
//     Array.isArray(range) &&
//     selectedPrice[0] === range[0] && selectedPrice[1] === range[1];
//   return (
//     <View style={priceStyles.container}>
//       <Text style={priceStyles.sectionTitle}>Price Range</Text>
//       {priceOptions.map(option => (
//         <TouchableOpacity
//           key={option.id}
//           style={[
//             priceStyles.optionContainer,
//             isPriceSelected(option.value) && priceStyles.selectedOption
//           ]}
//           onPress={() => onPriceSelect(option.value)}
//         >
//           <CheckBox
//             value={isPriceSelected(option.value)}
//             onValueChange={() => onPriceSelect(option.value)}
//             tintColors={{ true: '#007AFF', false: '#A5A5A5' }}
//             style={priceStyles.checkbox}
//           />
//           <Text style={priceStyles.optionText}>{option.name}</Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// };

// const CategoryFilterSection = ({
//   selectedCategories,
//   selectedSubcategories,
//   onCategorySelect,
//   onSubcategorySelect
// }) => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [expandedParents, setExpandedParents] = useState([]);
//   useEffect(() => {
//     let isActive = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get(ENDPOINTS.master.category);
//         if (res.data.status === 1 && isActive) setCategories(res.data.data);
//       } catch (err) {
//         if (isActive) setError('Unable to fetch categories');
//       } finally {
//         if (isActive) setLoading(false);
//       }
//     })();
//     return () => { isActive = false; };
//   }, []);
//   const toggleParent = (parentId) => {
//     setExpandedParents(parents =>
//       parents.includes(parentId)
//         ? parents.filter(id => id !== parentId)
//         : [...parents, parentId]
//     );
//   };

//   const isParentSelected = (id) => selectedCategories.includes(id);
//   const isChildSelected = (id) => selectedSubcategories.includes(id);

//   // Clicking parent toggles ALL its subcats on/off via passed ids
//   const handleParentSelect = (parentId, children) => {
//     const isSelected = isParentSelected(parentId);
//     onCategorySelect(parentId, !isSelected, children.map(c => c.id));
//   };

//   // Clicking child MAY need to sync parent with all child selection state
//   const handleChildSelect = (childId, parentId, siblingChildren) => {
//     const isSelected = isChildSelected(childId);
//     onSubcategorySelect(childId, !isSelected, parentId, siblingChildren.map(c => c.id));
//   };

//   if (loading) return (
//     <View style={categoryStyles.loadingContainer}>
//       <ActivityIndicator size="small" color="#007AFF"/>
//       <Text style={categoryStyles.loadingText}>Loading categories...</Text>
//     </View>
//   );
//   if (error) return (
//     <View style={categoryStyles.errorContainer}>
//       <Text style={categoryStyles.errorText}>{error}</Text>
//     </View>
//   );

//   return (
//     <View style={categoryStyles.container}>
//       <Text style={categoryStyles.sectionTitle}>Select Services</Text>
//       <FlatList
//         data={categories}
//         keyExtractor={item => String(item.id)}
//         renderItem={({ item }) => (
//           <View style={categoryStyles.categoryContainer}>
//             {/* Parent item */}
//             <TouchableOpacity
//               style={[
//                 categoryStyles.parentItem,
//                 isParentSelected(item.id) && categoryStyles.selectedItem
//               ]}
//               onPress={() => handleParentSelect(item.id, item.child ?? [])}
//             >
//               {/* Parent Checkbox */}
//               <CheckBox
//                 value={isParentSelected(item.id)}
//                 onValueChange={() => handleParentSelect(item.id, item.child ?? [])}
//                 tintColors={{ true: '#007AFF', false: '#A5A5A5' }}
//               />
//               <View style={categoryStyles.textContainer}>
//                 <Text style={categoryStyles.categoryText}>{item.name}</Text>
//               </View>
//               {item.child && !!item.child.length && (
//                 <Icon
//                   name={expandedParents.includes(item.id) ? 'chevron-up' : 'chevron-down'}
//                   size={16}
//                   color="#666"
//                   style={{padding: 8}}
//                   onPress={() => toggleParent(item.id)}
//                 />
//               )}
//             </TouchableOpacity>
//             {/* Children */}
//             {expandedParents.includes(item.id) && item.child && (
//               <View style={categoryStyles.childrenContainer}>
//                 {item.child.map(child => (
//                   <View key={child.id} style={categoryStyles.childWrapper}>
//                     <TouchableOpacity
//                       style={[
//                         categoryStyles.childItem,
//                         isChildSelected(child.id) && categoryStyles.selectedItem
//                       ]}
//                       onPress={() => handleChildSelect(child.id, item.id, item.child)}
//                     >
//                       {/* Child Checkbox */}
//                       <CheckBox
//                         value={isChildSelected(child.id)}
//                         onValueChange={() => handleChildSelect(child.id, item.id, item.child)}
//                         tintColors={{ true: '#007AFF', false: '#A5A5A5' }}
//                       />
//                       <View style={categoryStyles.textContainer}>
//                         <Text style={categoryStyles.categoryText}>{child.name}</Text>
//                       </View>
//                     </TouchableOpacity>
//                   </View>
//                 ))}
//               </View>
//             )}
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// const CarSizeFilterSection = ({ selectedSizes, onSizeSelect }) => {
//   const carSizes = [
//     { id: 'small', name: 'Small' },
//     { id: 'medium', name: 'Medium' },
//     { id: 'extra large', name: 'Extra Large' },
//     { id: 'premium', name: 'Premium' },
//   ];
//   return (
//     <View style={carSizeStyles.container}>
//       <Text style={carSizeStyles.sectionTitle}>Select Car Sizes</Text>
//       {carSizes.map(size => (
//         <TouchableOpacity
//           key={size.id}
//           style={carSizeStyles.optionContainer}
//           onPress={() => onSizeSelect(size.id, !selectedSizes.includes(size.id))}
//         >
//           <CheckBox
//             value={selectedSizes.includes(size.id)}
//             onValueChange={() => onSizeSelect(size.id, !selectedSizes.includes(size.id))}
//             tintColors={{ true: '#007AFF', false: '#A5A5A5' }}
//             style={carSizeStyles.checkbox}
//           />
//           <Text style={carSizeStyles.optionText}>{size.name}</Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// };

// const RatingFilterSection = () => (
//   <View style={{padding: 15, alignItems: 'center'}}>
//     <Text style={{fontSize: 16, color:'#999'}}>Coming soon: filter by ratings</Text>
//   </View>
// );

// --- styles: styles, garageStyles, priceStyles, categoryStyles, carSizeStyles, localStyles ---
// Use your previously provided StyleSheet objects unchanged!

// (Below put the styles exactly as in your version.)




// Local styles for components
// const localStyles = StyleSheet.create({
//   container: { flex: 1, paddingTop: 10 },
//   sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
//   cityItem: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   selectedCityItem: { backgroundColor: '#f0f7ff' },
//   cityText: { fontSize: 15 },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   loadingText: { marginTop: 10 },
//   errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   errorText: { color: 'red', marginBottom: 10 },
//   retryText: { color: '#007AFF' },
// });

// const garageStyles = StyleSheet.create({
//   container: {
//     padding: 16,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   optionContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     marginVertical: 4,
//   },
//   selectedOption: {
//     backgroundColor: '#f0f7ff',
//     borderRadius: 8,
//   },
//   checkbox: {
//     marginRight: 10,
//   },
//   optionText: {
//     fontSize: 15,
//   },
// });

// const priceStyles = StyleSheet.create({
//   container: {
//     padding: 16,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   optionContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     marginVertical: 4,
//   },
//   selectedOption: {
//     backgroundColor: '#f0f7ff',
//     borderRadius: 8,
//   },
//   checkbox: {
//     marginRight: 10,
//   },
//   optionText: {
//     fontSize: 15,
//   },
// });

// const categoryStyles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 12,
//     color: '#333',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#666',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     color: 'red',
//     marginBottom: 10,
//   },
//   retryText: {
//     color: '#007AFF',
//     fontWeight: '500',
//   },
//   categoryContainer: {
//     marginBottom: 8,
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   parentItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     backgroundColor: '#f8f8f8',
//   },
//   childWrapper: {
//     marginLeft: 16,
//     borderLeftWidth: 2,
//     borderLeftColor: '#ddd',
//   },
//   childItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     paddingLeft: 24,
//     backgroundColor: '#f8f8f8',
//   },
//   selectedItem: {
//     backgroundColor: '#e1f0ff',
//   },
//   textContainer: {
//     flex: 1,
//     marginLeft: 10,
//   },
//   categoryText: {
//     fontSize: 15,
//     fontWeight: '500',
//     color: '#333',
//   },
//   childrenContainer: {
//     marginTop: 4,
//   },
// });

// const carSizeStyles = StyleSheet.create({
//   container: {
//     padding: 16,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   optionContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 8,
//   },
//   checkbox: {
//     marginRight: 8,
//   },
//   optionText: {
//     fontSize: 15,
//   },
// });

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetHeaderButton: {
    marginRight: 20,
  },
  resetHeaderText: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  listContainer: {
    width: '35%',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    paddingRight: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedItem: {
    backgroundColor: '#f0f7ff',
  },
  serviceName: {
    fontSize: 15,
    color: '#666',
    paddingLeft: 4,
  },
  selectedText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  detailsContainer: {
    flex: 1,
    paddingLeft: 15,
  },
  filterContentContainer: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: 'white',
  },
});

export default FilterModalCar;