import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const { width, height } = Dimensions.get('window');

interface MenuItemProps {
  _id: string;
  menuid: string;
  name: string;
  price: number;
  description: string;
  category: string;
  status: 'available' | 'unavailable';
  isVegetarian: boolean;
  isSpicy: boolean;
  isRecommended?: boolean;
  orders?: number;
  img?: string;
  icon?: string;
  preparationTime?: number;
  isActive: boolean;
  isGlutenFree?: boolean;
}

interface CategoryProps {
  _id: string;
  categoryid: string;
  name: string;
  icon: string;
}

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

// Enhanced Menu Item Component
const MenuItem = ({ item }: { item: MenuItemProps }) => (
  <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
    <View style={styles.menuItemHeader}>
      <View style={styles.menuItemTitleRow}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <View style={styles.menuItemBadges}>
          {item.isVegetarian && (
            <View style={[styles.dietBadge, styles.vegBadge]}>
              <View style={styles.vegDot} />
            </View>
          )}
          {!item.isVegetarian && (
            <View style={[styles.dietBadge, styles.nonVegBadge]}>
              <View style={styles.nonVegDot} />
            </View>
          )}
          {item.isSpicy && (
            <Ionicons name="flame" size={14} color="#FF6B35" />
          )}
          {item.isRecommended && (
            <View style={styles.recommendedBadge}>
              <Ionicons name="star" size={12} color="#FFD700" />
            </View>
          )}
        </View>
      </View>
      
      <Text style={styles.menuItemDescription}>{item.description}</Text>
      
      <View style={styles.menuItemFooter}>
        <View style={styles.priceSection}>
          <Text style={styles.menuItemPrice}>₹{item.price}</Text>
          {item.preparationTime && (
            <Text style={styles.prepTime}>• {item.preparationTime} min</Text>
          )}
        </View>
        
        <View style={styles.menuItemRight}>
          {item.orders && (
            <Text style={styles.menuItemOrders}>{item.orders} orders today</Text>
          )}
          <View style={[
            styles.statusBadge,
            item.status === 'available' ? styles.statusAvailable : styles.statusUnavailable
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'available' ? styles.statusTextAvailable : styles.statusTextUnavailable
            ]}>
              {item.status === 'available' ? 'Available' : 'Out of Stock'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// Category Tab Component
const CategoryTab = ({ 
  category, 
  isActive, 
  onPress 
}: { 
  category: CategoryProps; 
  isActive: boolean; 
  onPress: () => void; 
}) => (
  <TouchableOpacity 
    style={[styles.categoryTab, isActive && styles.activeCategoryTab]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons 
      name="restaurant-outline" 
      size={20} 
      color={isActive ? '#FFFFFF' : '#666666'} 
    />
    <Text style={[
      styles.categoryTabText,
      isActive && styles.activeCategoryTabText
    ]}>
      {category.name}
    </Text>
  </TouchableOpacity>
);

export default function MenuScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemProps[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItemProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory || searchQuery.trim()) {
      fetchMenuItems();
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    filterMenuItems();
  }, [menuItems, searchQuery]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('auth_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await api.getCategories(token);
      
      if (response.success && response.categories) {
        // Add "All" category at the beginning
        const allCategories = [
          { _id: 'all', categoryid: 'all', name: 'All', icon: 'apps-outline' },
          ...response.categories
        ];
        setCategories(allCategories);
        
        // Load all menu items initially
        setSelectedCategory('all');
      } else {
        setError(response.message || 'Failed to load categories');
      }
    } catch (err: any) {
      setError(err.message || 'Network error while loading categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoadingItems(true);
      setError(null);
      const token = await AsyncStorage.getItem('auth_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      let response;
      
      if (selectedCategory === 'all') {
        // Fetch all menu items
        response = await api.getAllMenuItems(token);
      } else {
        // Fetch menu items for specific category
        response = await api.getMenuItems(token, selectedCategory, undefined, searchQuery.trim() || undefined);
      }
      
      if (response.success && response.menus) {
        setMenuItems(response.menus);
      } else {
        setError(response.message || 'Failed to load menu items');
        setMenuItems([]);
      }
    } catch (err: any) {
      setError(err.message || 'Network error while loading menu items');
      setMenuItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const filterMenuItems = () => {
    let items = [...menuItems];
    
    // Filter by search query if provided
    if (searchQuery.trim()) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category if not "all"
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    setFilteredItems(items);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery(''); // Clear search when changing category
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2C2C2C" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Failed to load menu</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Search */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Digital Menu</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Tabs */}
      {!searchQuery.trim() && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabs}
          contentContainerStyle={styles.categoryTabsContent}
        >
          {categories.map((category) => (
            <CategoryTab
              key={category._id}
              category={category}
              isActive={selectedCategory === category._id}
              onPress={() => handleCategorySelect(category._id)}
            />
          ))}
        </ScrollView>
      )}

      {/* Menu Items */}
      <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
        {searchQuery.trim() && (
          <View style={styles.searchResultsHeader}>
            <Text style={styles.searchResultsText}>
              {filteredItems.length} results for "{searchQuery}"
            </Text>
          </View>
        )}
        
        {loadingItems ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#2C2C2C" />
            <Text style={styles.loadingText}>Loading items...</Text>
          </View>
        ) : (
          <View style={styles.menuList}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <MenuItem key={item._id} item={item} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyStateTitle}>
                  {searchQuery.trim() ? 'No items found' : 'No items in this category'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {searchQuery.trim() 
                    ? 'Try searching with different keywords' 
                    : 'Items will be added soon'
                  }
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: height * 0.02,
    paddingHorizontal: width * 0.04,
    paddingBottom: height * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: responsiveFontSize(24),
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: height * 0.015,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: width * 0.03,
    height: height * 0.05,
  },
  searchIcon: {
    marginRight: width * 0.02,
  },
  searchInput: {
    flex: 1,
    fontSize: responsiveFontSize(14),
    color: '#2C2C2C',
  },
  clearButton: {
    padding: 4,
  },
  categoryTabs: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    maxHeight: height * 0.085,
  },
  categoryTabsContent: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    marginRight: width * 0.03,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeCategoryTab: {
    backgroundColor: '#2C2C2C',
    borderColor: '#2C2C2C',
  },
  categoryTabText: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
    marginLeft: 6,
    fontWeight: '600',
  },
  activeCategoryTabText: {
    color: '#FFFFFF',
  },
  menuContent: {
    flex: 1,
  },
  searchResultsHeader: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchResultsText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    fontWeight: '500',
  },
  menuList: {
    padding: width * 0.04,
    gap: height * 0.015,
  },
  // Menu Item Styles
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: width * 0.04,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemHeader: {
    flex: 1,
  },
  menuItemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: height * 0.008,
  },
  menuItemName: {
    fontSize: responsiveFontSize(16),
    fontWeight: '700',
    color: '#2C2C2C',
    flex: 1,
    marginRight: width * 0.02,
  },
  menuItemBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dietBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  vegBadge: {
    borderColor: '#4CAF50',
  },
  nonVegBadge: {
    borderColor: '#F44336',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  nonVegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  recommendedBadge: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 2,
  },
  menuItemDescription: {
    fontSize: responsiveFontSize(13),
    color: '#666666',
    lineHeight: responsiveFontSize(18),
    marginBottom: height * 0.012,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemPrice: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  prepTime: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
    marginLeft: width * 0.02,
  },
  menuItemRight: {
    alignItems: 'flex-end',
  },
  menuItemOrders: {
    fontSize: responsiveFontSize(11),
    color: '#666666',
    marginBottom: height * 0.005,
  },
  statusBadge: {
    paddingHorizontal: width * 0.025,
    paddingVertical: height * 0.005,
    borderRadius: 6,
    minWidth: width * 0.2,
    alignItems: 'center',
  },
  statusAvailable: {
    backgroundColor: '#E8F5E8',
  },
  statusUnavailable: {
    backgroundColor: '#FFE8E8',
  },
  statusText: {
    fontSize: responsiveFontSize(11),
    fontWeight: '600',
  },
  statusTextAvailable: {
    color: '#2D7D2D',
  },
  statusTextUnavailable: {
    color: '#D73A2A',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.08,
  },
  emptyStateTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
    color: '#2C2C2C',
    marginTop: height * 0.015,
    marginBottom: height * 0.008,
  },
  emptyStateText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: width * 0.1,
  },
  // Loading and Error States
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.1,
  },
  loadingText: {
    fontSize: responsiveFontSize(16),
    color: '#666666',
    marginTop: 12,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: width * 0.1,
  },
  retryButton: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
  },
});