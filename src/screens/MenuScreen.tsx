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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface MenuItemProps {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  status: 'available' | 'out-of-stock';
  isVeg: boolean;
  isSpicy: boolean;
  isRecommended?: boolean;
  orders?: number;
  image?: string;
  prepTime?: string;
}

interface CategoryProps {
  id: string;
  name: string;
  icon: string;
  items: MenuItemProps[];
}

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

// Enhanced Menu Data with Categories
const MENU_CATEGORIES: CategoryProps[] = [
  {
    id: 'appetizers',
    name: 'Appetizers',
    icon: 'restaurant-outline',
    items: [
      {
        id: 'app1',
        name: 'Paneer Tikka',
        price: 160,
        description: 'Succulent cubes of cottage cheese marinated in spices and grilled to perfection',
        category: 'appetizers',
        status: 'available',
        isVeg: true,
        isSpicy: true,
        isRecommended: true,
        orders: 15,
        prepTime: '15 min'
      },
      {
        id: 'app2',
        name: 'Chicken 65',
        price: 180,
        description: 'Spicy, deep-fried chicken dish with South Indian flavors',
        category: 'appetizers',
        status: 'available',
        isVeg: false,
        isSpicy: true,
        orders: 12,
        prepTime: '20 min'
      },
      {
        id: 'app3',
        name: 'Crispy Corn',
        price: 120,
        description: 'Golden fried corn kernels tossed with herbs and spices',
        category: 'appetizers',
        status: 'out-of-stock',
        isVeg: true,
        isSpicy: false,
        orders: 8,
        prepTime: '12 min'
      }
    ]
  },
  {
    id: 'mains',
    name: 'Main Course',
    icon: 'nutrition-outline',
    items: [
      {
        id: 'main1',
        name: 'Butter Chicken',
        price: 220,
        description: 'Tender chicken pieces in a rich, creamy tomato-based sauce',
        category: 'mains',
        status: 'available',
        isVeg: false,
        isSpicy: false,
        isRecommended: true,
        orders: 25,
        prepTime: '25 min'
      },
      {
        id: 'main2',
        name: 'Dal Makhani',
        price: 140,
        description: 'Rich and creamy black lentils slow-cooked with butter and cream',
        category: 'mains',
        status: 'available',
        isVeg: true,
        isSpicy: false,
        orders: 18,
        prepTime: '20 min'
      },
      {
        id: 'main3',
        name: 'Biryani Special',
        price: 250,
        description: 'Fragrant basmati rice layered with tender meat and aromatic spices',
        category: 'mains',
        status: 'available',
        isVeg: false,
        isSpicy: true,
        isRecommended: true,
        orders: 22,
        prepTime: '35 min'
      },
      {
        id: 'main4',
        name: 'Palak Paneer',
        price: 160,
        description: 'Fresh spinach curry with cottage cheese cubes',
        category: 'mains',
        status: 'available',
        isVeg: true,
        isSpicy: false,
        orders: 14,
        prepTime: '18 min'
      }
    ]
  },
  {
    id: 'breads',
    name: 'Breads & Rice',
    icon: 'leaf-outline',
    items: [
      {
        id: 'bread1',
        name: 'Butter Naan',
        price: 45,
        description: 'Soft and fluffy bread brushed with butter',
        category: 'breads',
        status: 'available',
        isVeg: true,
        isSpicy: false,
        orders: 30,
        prepTime: '8 min'
      },
      {
        id: 'bread2',
        name: 'Garlic Naan',
        price: 55,
        description: 'Naan bread topped with fresh garlic and cilantro',
        category: 'breads',
        status: 'available',
        isVeg: true,
        isSpicy: false,
        orders: 20,
        prepTime: '10 min'
      },
      {
        id: 'bread3',
        name: 'Jeera Rice',
        price: 80,
        description: 'Basmati rice tempered with cumin seeds',
        category: 'breads',
        status: 'available',
        isVeg: true,
        isSpicy: false,
        orders: 16,
        prepTime: '15 min'
      }
    ]
  },
  {
    id: 'desserts',
    name: 'Desserts',
    icon: 'ice-cream-outline',
    items: [
      {
        id: 'dessert1',
        name: 'Gulab Jamun',
        price: 80,
        description: 'Soft milk dumplings soaked in rose-flavored sugar syrup',
        category: 'desserts',
        status: 'available',
        isVeg: true,
        isSpicy: false,
        orders: 12,
        prepTime: '5 min'
      },
      {
        id: 'dessert2',
        name: 'Kulfi',
        price: 60,
        description: 'Traditional Indian ice cream with cardamom and pistachios',
        category: 'desserts',
        status: 'available',
        isVeg: true,
        isSpicy: false,
        orders: 8,
        prepTime: '2 min'
      }
    ]
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: 'cafe-outline',
    items: [
      {
        id: 'bev1',
        name: 'Masala Chai',
        price: 25,
        description: 'Traditional Indian tea brewed with aromatic spices',
        category: 'beverages',
        status: 'available',
        isVeg: true,
        isSpicy: false,
        orders: 40,
        prepTime: '5 min'
      },
      {
        id: 'bev2',
        name: 'Fresh Lime Soda',
        price: 35,
        description: 'Refreshing lime juice with soda and mint',
        category: 'beverages',
        status: 'available',
        isVeg: true,
        isSpicy: false,
        orders: 15,
        prepTime: '3 min'
      },
      {
        id: 'bev3',
        name: 'Mango Lassi',
        price: 45,
        description: 'Creamy yogurt drink blended with sweet mango pulp',
        category: 'beverages',
        status: 'available',
        isVeg: true,
        isSpicy: false,
        orders: 18,
        prepTime: '4 min'
      }
    ]
  }
];

// Enhanced Menu Item Component
const MenuItem = ({ item }: { item: MenuItemProps }) => (
  <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
    <View style={styles.menuItemHeader}>
      <View style={styles.menuItemTitleRow}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <View style={styles.menuItemBadges}>
          {item.isVeg && (
            <View style={[styles.dietBadge, styles.vegBadge]}>
              <View style={styles.vegDot} />
            </View>
          )}
          {!item.isVeg && (
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
          {item.prepTime && (
            <Text style={styles.prepTime}>• {item.prepTime}</Text>
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
      name={category.icon as any} 
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
  const [selectedCategory, setSelectedCategory] = useState('appetizers');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<MenuItemProps[]>([]);

  useEffect(() => {
    filterMenuItems();
  }, [selectedCategory, searchQuery]);

  const filterMenuItems = () => {
    const currentCategory = MENU_CATEGORIES.find(cat => cat.id === selectedCategory);
    if (!currentCategory) return;

    let items = currentCategory.items;
    
    if (searchQuery.trim()) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredItems(items);
  };

  const getAllItems = () => {
    return MENU_CATEGORIES.flatMap(category => category.items);
  };

  const getItemsBySearch = () => {
    if (!searchQuery.trim()) return [];
    
    return getAllItems().filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const displayItems = searchQuery.trim() ? getItemsBySearch() : filteredItems;

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
          {MENU_CATEGORIES.map((category) => (
            <CategoryTab
              key={category.id}
              category={category}
              isActive={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </ScrollView>
      )}

      {/* Menu Items */}
      <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
        {searchQuery.trim() && (
          <View style={styles.searchResultsHeader}>
            <Text style={styles.searchResultsText}>
              {displayItems.length} results for "{searchQuery}"
            </Text>
          </View>
        )}
        
        <View style={styles.menuList}>
          {displayItems.length > 0 ? (
            displayItems.map((item) => (
              <MenuItem key={item.id} item={item} />
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
});