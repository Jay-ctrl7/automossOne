import React, { useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

const CategoryItem = ({ item, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.categoryItem, isSelected && styles.selectedCategory]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text
      style={[styles.categoryText, isSelected && styles.selectedCategoryText]}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {item.name}
    </Text>
  </TouchableOpacity>
);

const CategoryTabs = ({ 
  categories, 
  selectedCategory, 
  handleCategoryPress,
  scrollRef 
}) => {
  useEffect(() => {
    // Scroll to selected category when it changes
    if (selectedCategory && scrollRef.current) {
      const index = categories.findIndex(cat => cat.name === selectedCategory);
      if (index !== -1) {
        const itemWidth = 100; // Approximate width of each category item
        const position = index * (itemWidth + 10); // 20 is marginRight
        
        scrollRef.current.scrollTo({
          x: position,
          animated: true,
        });
      }
    }
  }, [selectedCategory, categories]);

  return (
    <View style={styles.categoryContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContent}
        keyboardShouldPersistTaps="always"
      >
        {categories.map(cat => (
          <CategoryItem
            key={cat.id}
            item={cat}
            isSelected={selectedCategory === cat.name}
            onPress={() => handleCategoryPress(cat.name)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  categoryScrollContent: { 
    paddingHorizontal: 16 
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eeeff5ff',
    minWidth: 80,
    maxWidth: 120,
  },
  selectedCategory: { 
    backgroundColor: '#ff4444' 
  },
  categoryText: { 
    fontSize: 12, 
    color: '#666', 
    fontWeight: '500' 
  },
  selectedCategoryText: { 
    color: '#fff' 
  },
});

export default React.memo(CategoryTabs);