import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import { ENDPOINTS } from '../../config/api';


const CategoryFilterSection = ({
  selectedCategories,
  selectedSubcategories,
  onCategorySelect,
  onSubcategorySelect
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedParents, setExpandedParents] = useState([]);
  useEffect(() => {
    let isActive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(ENDPOINTS.master.category);
        if (res.data.status === 1 && isActive) setCategories(res.data.data);
      } catch (err) {
        if (isActive) setError('Unable to fetch categories');
      } finally {
        if (isActive) setLoading(false);
      }
    })();
    return () => { isActive = false; };
  }, []);
  const toggleParent = (parentId) => {
    setExpandedParents(parents =>
      parents.includes(parentId)
        ? parents.filter(id => id !== parentId)
        : [...parents, parentId]
    );
  };

  const isParentSelected = (id) => selectedCategories.includes(id);
  const isChildSelected = (id) => selectedSubcategories.includes(id);

  // Clicking parent toggles ALL its subcats on/off via passed ids
  const handleParentSelect = (parentId, children) => {
    const isSelected = isParentSelected(parentId);
    onCategorySelect(parentId, !isSelected, children.map(c => c.id));
  };

  // Clicking child MAY need to sync parent with all child selection state
  const handleChildSelect = (childId, parentId, siblingChildren) => {
    const isSelected = isChildSelected(childId);
    onSubcategorySelect(childId, !isSelected, parentId, siblingChildren.map(c => c.id));
  };

  if (loading) return (
    <View style={categoryStyles.loadingContainer}>
      <ActivityIndicator size="small" color="#007AFF"/>
      <Text style={categoryStyles.loadingText}>Loading categories...</Text>
    </View>
  );
  if (error) return (
    <View style={categoryStyles.errorContainer}>
      <Text style={categoryStyles.errorText}>{error}</Text>
    </View>
  );

  return (
    <View style={categoryStyles.container}>
      <Text style={categoryStyles.sectionTitle}>Select Services</Text>
      <FlatList
        data={categories}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={categoryStyles.categoryContainer}>
            {/* Parent item */}
            <TouchableOpacity
              style={[
                categoryStyles.parentItem,
                isParentSelected(item.id) && categoryStyles.selectedItem
              ]}
              onPress={() => handleParentSelect(item.id, item.child ?? [])}
            >
              {/* Parent Checkbox */}
              <CheckBox
                value={isParentSelected(item.id)}
                onValueChange={() => handleParentSelect(item.id, item.child ?? [])}
                tintColors={{ true: '#007AFF', false: '#A5A5A5' }}
              />
              <View style={categoryStyles.textContainer}>
                <Text style={categoryStyles.categoryText}>{item.name}</Text>
              </View>
              {item.child && !!item.child.length && (
                <Icon
                  name={expandedParents.includes(item.id) ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#666"
                  style={{padding: 8}}
                  onPress={() => toggleParent(item.id)}
                />
              )}
            </TouchableOpacity>
            {/* Children */}
            {expandedParents.includes(item.id) && item.child && (
              <View style={categoryStyles.childrenContainer}>
                {item.child.map(child => (
                  <View key={child.id} style={categoryStyles.childWrapper}>
                    <TouchableOpacity
                      style={[
                        categoryStyles.childItem,
                        isChildSelected(child.id) && categoryStyles.selectedItem
                      ]}
                      onPress={() => handleChildSelect(child.id, item.id, item.child)}
                    >
                      {/* Child Checkbox */}
                      <CheckBox
                        value={isChildSelected(child.id)}
                        onValueChange={() => handleChildSelect(child.id, item.id, item.child)}
                        tintColors={{ true: '#007AFF', false: '#A5A5A5' }}
                      />
                      <View style={categoryStyles.textContainer}>
                        <Text style={categoryStyles.categoryText}>{child.name}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};
const categoryStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  retryText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  categoryContainer: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  parentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
  },
  childWrapper: {
    marginLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#ddd',
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 24,
    backgroundColor: '#f8f8f8',
  },
  selectedItem: {
    backgroundColor: '#e1f0ff',
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  childrenContainer: {
    marginTop: 4,
  },
});
export default CategoryFilterSection;