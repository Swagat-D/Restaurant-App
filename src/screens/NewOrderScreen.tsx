import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Modal, FlatList, Image, StatusBar, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OrderReviewScreen from './OrderReviewScreen';

const { width, height } = Dimensions.get('window');

interface NewOrderScreenProps {
  onBack?: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface TableOption {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied';
}

interface ReviewItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  instruction?: string;
}

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

export default function NewOrderScreen({ onBack }: NewOrderScreenProps) {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [showTableDropdown, setShowTableDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderItems, setOrderItems] = useState<{[key: string]: number}>({});
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [specialInstruction, setSpecialInstruction] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState<{[key: string]: string}>({});
  const [searchText, setSearchText] = useState('');
  const [showReview, setShowReview] = useState(false);

  const orderNumber = `ORD${Date.now().toString().slice(-4)}`;

  // Mock table data
  const tables: TableOption[] = [
    { id: '1', number: 'Table 1', capacity: 4, status: 'available' },
    { id: '2', number: 'Table 2', capacity: 2, status: 'available' },
    { id: '3', number: 'Table 3', capacity: 6, status: 'occupied' },
    { id: '4', number: 'Table 4', capacity: 4, status: 'available' },
    { id: '5', number: 'Table 5', capacity: 8, status: 'available' },
    { id: '6', number: 'Table 6', capacity: 2, status: 'available' },
  ];

  const categories = ['All', 'Appetizers', 'Main Course', 'Desserts', 'Beverages'];

  const menuItems: MenuItem[] = [
    { id: '1', name: 'Butter Chicken', description: 'Creamy chicken in rich tomato sauce', price: 180, image: '🍛', category: 'Main Course' },
    { id: '2', name: 'Dal Makhani', description: 'Rich black lentils in creamy gravy', price: 120, image: '🍲', category: 'Main Course' },
    { id: '3', name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 160, image: '🧀', category: 'Appetizers' },
    { id: '4', name: 'Naan Bread', description: 'Soft, fluffy Indian bread', price: 40, image: '🍞', category: 'Appetizers' },
    { id: '5', name: 'Biryani', description: 'Fragrant basmati rice with spices', price: 200, image: '🍚', category: 'Main Course' },
    { id: '6', name: 'Gulab Jamun', description: 'Sweet milk dumplings in syrup', price: 80, image: '🍯', category: 'Desserts' },
    { id: '7', name: 'Mango Lassi', description: 'Refreshing yogurt drink', price: 60, image: '🥤', category: 'Beverages' },
    { id: '8', name: 'Tandoori Roti', description: 'Whole wheat flatbread', price: 25, image: '🫓', category: 'Appetizers' },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const availableTables = tables.filter(table => table.status === 'available');

  const handleTableSelect = (table: TableOption) => {
    setSelectedTable(table.number);
    setShowTableDropdown(false);
  };

  const handleAddItem = (itemId: string) => {
    // Only show instruction modal for new items (quantity 0)
    if (!orderItems[itemId] || orderItems[itemId] === 0) {
      setCurrentItemId(itemId);
      setShowInstructionModal(true);
    } else {
      // For existing items, directly add to quantity
      setOrderItems(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1
      }));
    }
  };

  const confirmAddItem = () => {
    if (currentItemId) {
      setOrderItems(prev => ({
        ...prev,
        [currentItemId]: (prev[currentItemId] || 0) + 1
      }));
      // Store special instruction for this item if provided
      if (specialInstruction.trim()) {
        setSpecialInstructions(prev => ({
          ...prev,
          [currentItemId]: specialInstruction.trim()
        }));
      }
    }
    setSpecialInstruction('');
    setShowInstructionModal(false);
    setCurrentItemId(null);
  };

  const skipInstruction = () => {
    confirmAddItem();
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems(prev => {
      const newItems = { ...prev };
      if (newItems[itemId] > 0) {
        newItems[itemId]--;
        if (newItems[itemId] === 0) {
          delete newItems[itemId];
        }
      }
      return newItems;
    });
  };

  const getTotalItems = () => {
    return Object.values(orderItems).reduce((sum, count) => sum + count, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(orderItems).reduce((total, [itemId, count]) => {
      const item = menuItems.find(m => m.id === itemId);
      return total + (item ? item.price * count : 0);
    }, 0);
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItemCard}>
      <View style={styles.menuItemImageContainer}>
        <Text style={styles.menuItemImage}>{item.image}</Text>
      </View>
      <View style={styles.menuItemInfo}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemDescription}>{item.description}</Text>
        <View style={styles.menuItemFooter}>
          <Text style={styles.menuItemPrice}>₹ {item.price.toFixed(2)}</Text>
          <View style={styles.quantityControls}>
            {orderItems[item.id] ? (
              <>
                <TouchableOpacity 
                  style={styles.quantityButton} 
                  onPress={() => handleRemoveItem(item.id)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{orderItems[item.id]}</Text>
                <TouchableOpacity 
                  style={styles.quantityButton} 
                  onPress={() => handleAddItem(item.id)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => handleAddItem(item.id)}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  // Helper to build review items array
  const getReviewItems = (): ReviewItem[] => {
    return Object.entries(orderItems)
      .map(([itemId, qty]) => {
        const item = menuItems.find(m => m.id === itemId);
        if (!item) return null;
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: qty,
          instruction: specialInstructions[itemId],
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  };

  if (showReview) {
    return (
      <OrderReviewScreen
        orderNumber={orderNumber}
        tableNumber={selectedTable}
        items={getReviewItems()}
        specialInstruction={specialInstruction}
        onConfirm={() => {/* handle confirm logic here */ setShowReview(false); }}
        onEdit={(itemId, newQuantity, newInstruction) => {
          // Update quantity
          setOrderItems(prev => ({
            ...prev,
            [itemId]: newQuantity
          }));
          // Update special instruction
          if (newInstruction && newInstruction.trim()) {
            setSpecialInstructions(prev => ({
              ...prev,
              [itemId]: newInstruction.trim()
            }));
          } else {
            // Remove instruction if empty
            setSpecialInstructions(prev => {
              const updated = { ...prev };
              delete updated[itemId];
              return updated;
            });
          }
        }}
        onDelete={(itemId) => {
          setOrderItems(prev => {
            const newItems = { ...prev };
            delete newItems[itemId];
            return newItems;
          });
          // Also remove any special instructions for this item
          setSpecialInstructions(prev => {
            const updated = { ...prev };
            delete updated[itemId];
            return updated;
          });
        }}
        onBack={() => setShowReview(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.greetingText}>New Order</Text>
            <Text style={styles.subtitleText}>Order #{orderNumber}</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Table Selection */}
        <View style={[styles.section, styles.sectionCompact]}>
          <Text style={styles.sectionTitle}>Select Table</Text>
          <TouchableOpacity 
            style={styles.tableDropdown}
            onPress={() => setShowTableDropdown(true)}
          >
            <Text style={[styles.tableDropdownText, !selectedTable && styles.placeholderText]}>
              {selectedTable || 'Choose a table'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.section, styles.sectionCompact, {paddingTop: 0, paddingBottom: 8}]}> 
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color="#999" style={{marginRight: 8}} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search menu items..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Category Tabs */}
        <View style={[styles.section, styles.sectionCompact, {paddingTop: 0, paddingBottom: 8}]}> 
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTab,
                  selectedCategory === category && styles.activeCategoryTab
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryTabText,
                  selectedCategory === category && styles.activeCategoryTabText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View style={[styles.section, styles.sectionCompact, {paddingTop: 0}]}> 
          <Text style={styles.sectionTitle}>What's New?</Text>
          <FlatList
            data={filteredMenuItems}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.menuRow}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
      {/* Special Instructions Modal */}
      <Modal
        visible={showInstructionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInstructionModal(false)}
      >
        <View style={styles.instructionOverlay}>
          <View style={styles.instructionModal}>
            <Text style={styles.instructionTitle}>Special Instructions</Text>
            <Text style={styles.instructionSubtitle}>Add any notes for the kitchen (optional)</Text>
            <View style={styles.instructionInputContainer}>
              <TextInput
                style={styles.instructionInput}
                placeholder="Type instructions here..."
                placeholderTextColor="#999"
                value={specialInstruction}
                onChangeText={setSpecialInstruction}
                multiline
              />
            </View>
            <View style={styles.instructionButtonRow}>
              <TouchableOpacity style={styles.instructionSkipButton} onPress={skipInstruction}>
                <Text style={styles.instructionSkipText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.instructionConfirmButton} onPress={confirmAddItem}>
                <Text style={styles.instructionConfirmText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
        </View>
      </ScrollView>

      {/* Order Summary */}
      {getTotalItems() > 0 && (
        <View style={styles.orderSummary}>
          <View style={styles.orderSummaryContent}>
            <View>
              <Text style={styles.orderSummaryTitle}>
                {getTotalItems()} items • ₹ {getTotalPrice().toFixed(2)}
              </Text>
              <Text style={styles.orderSummarySubtitle}>
                {selectedTable || 'Select table first'}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.orderButton, !selectedTable && styles.disabledButton]}
              disabled={!selectedTable}
              onPress={() => setShowReview(true)}
            >
              <Text style={styles.orderButtonText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Table Selection Modal */}
      <Modal
        visible={showTableDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTableDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowTableDropdown(false)}
        >
          <View style={styles.tableModal}>
            <Text style={styles.tableModalTitle}>Select Table</Text>
            {availableTables.map((table) => (
              <TouchableOpacity
                key={table.id}
                style={styles.tableOption}
                onPress={() => handleTableSelect(table)}
              >
                <View style={styles.tableOptionContent}>
                  <Text style={styles.tableOptionText}>{table.number}</Text>
                  <Text style={styles.tableCapacity}>Capacity: {table.capacity}</Text>
                </View>
                <Ionicons name="checkmark-circle-outline" size={20} color="#2C2C2C" />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2C2C2C',
    paddingTop: height * 0.06,
    paddingBottom: height * 0.025,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: width * 0.05,
  },
  greetingText: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: responsiveFontSize(14),
    color: '#E0E0E0',
  },
  headerTitle: {
    fontSize: responsiveFontSize(24),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: responsiveFontSize(14),
    color: '#E0E0E0',
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: width * 0.05,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: height * 0.015,
  },
  tableDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: width * 0.04,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableDropdownText: {
    fontSize: responsiveFontSize(16),
    color: '#333333',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#999999',
  },
  categoryContainer: {
    paddingBottom: height * 0.01,
    paddingLeft: width * 0.005,
  },
  categoryTab: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.012,
    borderRadius: 20,
    marginRight: width * 0.03,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeCategoryTab: {
    backgroundColor: '#2C2C2C',
    transform: [{ scale: 1.05 }],
  },
  categoryTabText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    fontWeight: '500',
  },
  activeCategoryTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  menuRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  menuItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: '5%',
    flex: 1,
    minWidth: 0,
    marginHorizontal: 4,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  instructionModal: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  instructionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionSubtitle: {
    fontSize: responsiveFontSize(13),
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionInputContainer: {
    width: '100%',
    marginBottom: 18,
  },
  instructionInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    fontSize: responsiveFontSize(14),
    color: '#333',
    minHeight: 48,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  instructionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  instructionSkipButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  instructionSkipText: {
    color: '#2C2C2C',
    fontWeight: 'bold',
    fontSize: responsiveFontSize(14),
  },
  instructionConfirmButton: {
    flex: 1,
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  instructionConfirmText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: responsiveFontSize(14),
  },
  menuItemImageContainer: {
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  menuItemImage: {
    fontSize: responsiveFontSize(40),
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: height * 0.005,
  },
  menuItemDescription: {
    fontSize: responsiveFontSize(11),
    color: '#666666',
    marginBottom: height * 0.01,
    lineHeight: responsiveFontSize(14),
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sectionCompact: {
    paddingVertical: height * 0.015,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: responsiveFontSize(14),
    color: '#333',
    paddingVertical: 2,
    backgroundColor: 'transparent',
  },
  quantityButton: {
    backgroundColor: '#2C2C2C',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quantityButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#2C2C2C',
    minWidth: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#2C2C2C',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  orderSummary: {
    backgroundColor: '#FFFFFF',
    padding: width * 0.05,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  orderSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderSummaryTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#333333',
  },
  orderSummarySubtitle: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
    marginTop: 2,
  },
  orderButton: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.015,
    borderRadius: 25,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: width * 0.05,
    width: width * 0.8,
    maxHeight: height * 0.6,
  },
  tableModalTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  tableOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: width * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tableOptionContent: {
    flex: 1,
  },
  tableOptionText: {
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
    color: '#333333',
  },
  tableCapacity: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
    marginTop: 2,
  },
});