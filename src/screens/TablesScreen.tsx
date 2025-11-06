import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../context/OrderContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const { width, height } = Dimensions.get('window');

interface TableOption {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'Available' | 'Occupied' | 'Reserved';
  tableid?: string;
  name?: string;
}

interface TablesScreenProps {
  onBack?: () => void;
  onNewOrder?: (tableNumber: string) => void;
}

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  isVegetarian?: boolean;
}

interface OrderItem {
  _id?: string;
  menuid: string;
  notes?: string;
  quantity: number;
  // Client-side fields for display
  id?: string;
  name?: string;
  price?: number;
  instruction?: string;
}

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

export default function TablesScreen({ onBack, onNewOrder }: TablesScreenProps) {
  const { orders, refreshOrders, updateFullOrder } = useOrders();
  const [tables, setTables] = useState<TableOption[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableOption | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
  
  // Order editing states
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editedItems, setEditedItems] = useState<{ [key: string]: number }>({});
  const [editedItemInstructions, setEditedItemInstructions] = useState<{ [key: string]: string }>({});
  const [editedCustomerName, setEditedCustomerName] = useState('');
  const [editedCustomerPhone, setEditedCustomerPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTables();
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        return;
      }

      const response = await api.getAllMenuItems(token);
      
      if (response?.success) {
        const items = Array.isArray(response.menus) 
          ? response.menus 
          : Array.isArray(response.menuItems) 
          ? response.menuItems 
          : Array.isArray(response.data) 
          ? response.data 
          : Array.isArray(response.menu)
          ? response.menu
          : [];
        
        setMenuItems(items);
      } else {
        setMessage({ type: 'error', text: response?.message || 'Failed to load menu items' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Network error while loading menu items' });
    }
  };

  const fetchTables = async () => {
    setLoadingTables(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required' });
        setTables([]);
        return;
      }

      const response = await api.getAllTables(token);

      if (response?.success) {
        const tablesData = Array.isArray(response.tables)
          ? response.tables
          : Array.isArray(response.data)
          ? response.data
          : [];

        const formattedTables = tablesData.map((table: any) => ({
          id: table.tableid || table._id || table.id || '',
          tableid: table.tableid || table._id || table.id || '',
          number: table.name || table.number || `Table ${table.tableid || table._id || table.id}`,
          name: table.name || `Table ${table.tableid || table._id || table.id}`,
          capacity: table.capacity || 4,
          status: (table.status || 'available').toString()
        }));

        // Remove duplicates based on table number/name to prevent duplicate rendering
        const uniqueTables = formattedTables.filter((table, index, self) => {
          // Find the first occurrence of a table with the same number or name
          const firstOccurrenceIndex = self.findIndex(t => 
            t.number === table.number || t.name === table.name
          );
          // Keep only if this is the first occurrence
          return index === firstOccurrenceIndex;
        });

        console.log('Total tables from API:', formattedTables.length);
        console.log('Unique tables after deduplication:', uniqueTables.length);
        console.log('Table numbers:', uniqueTables.map(t => t.number));

        setTables(uniqueTables);
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: response?.message || 'Failed to load tables' });
        setTables([]);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Network error while loading tables' });
      setTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  // Get orders for a specific table (only active orders - exclude done and cancelled)
  const getTableOrders = (tableNumber: string) => {
    return orders.filter(order => 
      order.tableNumber === tableNumber && 
      !['done', 'cancelled'].includes(order.status)
    );
  };

  // Get table status based on whether it has active orders
  const getTableDisplayStatus = (table: TableOption) => {
    const tableOrders = getTableOrders(table.number || table.name || `Table ${table.id}`);
    if (tableOrders.length > 0) {
      return 'occupied';
    }
    return table.status?.toLowerCase() || 'available';
  };

  const handleTablePress = (table: TableOption) => {
    const tableOrders = getTableOrders(table.number || table.name || `Table ${table.id}`);
    if (tableOrders.length > 0) {
      setSelectedTable(table);
      setShowOrderModal(true);
    } else {
      // Table is available, option to create new order
      if (onNewOrder) {
        onNewOrder(table.number || table.name || `Table ${table.id}`);
      }
    }
  };

  const handleNewOrderForTable = () => {
    if (selectedTable && onNewOrder) {
      onNewOrder(selectedTable.number || selectedTable.name || `Table ${selectedTable.id}`);
      setShowOrderModal(false);
    }
  };

  const handleEditOrder = (order: any) => {
    setEditingOrder(order);
    setEditedCustomerName(order.customerName || '');
    setEditedCustomerPhone(order.customerPhone || '');
    setSearchQuery(''); // Clear search when opening modal
    
    // Initialize edited items with current order items
    const initialItems: { [key: string]: number } = {};
    const initialInstructions: { [key: string]: string } = {};
    order.items.forEach((item: any) => {
      const itemId = typeof item.menuid === 'string' 
        ? item.menuid 
        : (item.menuid?._id || item.id || item._id);
      initialItems[itemId] = item.quantity;
      initialInstructions[itemId] = item.notes || item.instruction || '';
    });
    setEditedItems(initialItems);
    setEditedItemInstructions(initialInstructions);
    
    setShowEditModal(true);
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    setIsUpdating(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required' });
        return;
      }

      // Prepare items for API (combine existing and new items)
      const items: any[] = [];
      
      // Add items that were modified from existing order
      editingOrder.items.forEach((existingItem: any) => {
        const itemId = typeof existingItem.menuid === 'string' 
          ? existingItem.menuid 
          : (existingItem.menuid?._id || existingItem.id || existingItem._id);
        
        const quantity = editedItems[itemId];
        if (quantity && quantity > 0) {
          items.push({
            menuid: itemId,
            notes: editedItemInstructions[itemId] || existingItem.notes || existingItem.instruction || '',
            quantity
          });
        }
      });

      // Add new items that were added to the order
      Object.entries(editedItems).forEach(([menuid, quantity]) => {
        // Check if this is a new item (not in existing order)
        const isExistingItem = editingOrder.items.some((item: any) => {
          const itemId = typeof item.menuid === 'string' 
            ? item.menuid 
            : (item.menuid?._id || item.id || item._id);
          return itemId === menuid;
        });
        
        if (!isExistingItem && quantity > 0) {
          items.push({
            menuid,
            notes: editedItemInstructions[menuid] || '',
            quantity
          });
        }
      });

      if (items.length === 0) {
        setMessage({ type: 'error', text: 'Order must have at least one item' });
        return;
      }

      // Check if the order has been modified (new items added OR quantities changed)
      const hasNewItems = Object.entries(editedItems).some(([menuid, quantity]) => {
        const isExistingItem = editingOrder.items.some((item: any) => {
          const itemId = typeof item.menuid === 'string' 
            ? item.menuid 
            : (item.menuid?._id || item.id || item._id);
          return itemId === menuid;
        });
        return !isExistingItem && quantity > 0;
      });

      // Check if any existing item quantities were changed
      const hasQuantityChanges = editingOrder.items.some((item: any) => {
        const itemId = typeof item.menuid === 'string' 
          ? item.menuid 
          : (item.menuid?._id || item.id || item._id);
        const currentQuantity = editedItems[itemId] || 0;
        return currentQuantity !== item.quantity;
      });

      // If new items are added OR quantities changed, reset order status to pending
      let orderStatus = editingOrder.status;
      const hasChanges = hasNewItems || hasQuantityChanges;
      
      console.log('Change detection:', {
        hasNewItems,
        hasQuantityChanges,
        hasChanges,
        currentStatus: editingOrder.status,
        editedItems,
        originalItems: editingOrder.items
      });
      
      if (hasChanges) {
        orderStatus = 'pending';
        console.log('Order modified - resetting to pending:', { hasNewItems, hasQuantityChanges });
      }

      // Validate menu items are still available and get current pricing
      const validatedItems: any[] = [];
      for (const item of items) {
        const menuItem = menuItems.find(m => m._id === item.menuid);
        if (!menuItem) {
          setMessage({ type: 'error', text: `Menu item not found: ${item.menuid}. Please refresh and try again.` });
          return;
        }
        
        // Use current menu pricing
        validatedItems.push({
          ...item,
          currentPrice: menuItem.price
        });
      }

      // Calculate totals using current menu prices
      const subtotal = validatedItems.reduce((total, item) => {
        return total + (item.currentPrice * item.quantity);
      }, 0);

      const orderData = {
        tableid: editingOrder.tableid,
        tableNumber: editingOrder.tableNumber,
        customerName: editedCustomerName,
        customerPhone: editedCustomerPhone,
        orderid: editingOrder.orderid,
        items,
        subtotal,
        tax: editingOrder.tax || 0,
        discount: editingOrder.discount || 0,
        totalAmount: subtotal + (editingOrder.tax || 0) - (editingOrder.discount || 0),
        status: orderStatus,
      };

      const response = await api.updateOrder(token, orderData);
      
      console.log('Order update response:', response);
      console.log('Order data sent:', orderData);
      
      if (response?.success) {
        // Use the new updateFullOrder method which refreshes orders automatically
        const updateSuccess = await updateFullOrder(orderData);
        if (updateSuccess) {
          const successMessage = hasChanges 
            ? 'Order updated successfully! Order status reset to pending for kitchen preparation.'
            : 'Order updated successfully!';
          setMessage({ type: 'success', text: successMessage });
          setShowEditModal(false);
          setEditingOrder(null);
          setEditedItems({});
          setEditedItemInstructions({});
        } else {
          setMessage({ type: 'error', text: 'Failed to update local order state' });
        }
      } else {
        setMessage({ type: 'error', text: response?.message || 'Failed to update order' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Error updating order' });
    } finally {
      setIsUpdating(false);
    }
  };

  const adjustItemQuantity = (menuid: string, change: number) => {
    setEditedItems(prev => {
      const currentQty = prev[menuid] || 0;
      const newQty = Math.max(0, currentQty + change);
      
      if (newQty === 0) {
        const { [menuid]: _, ...rest } = prev;
        // Also clear instructions when removing item
        setEditedItemInstructions(prevInstr => {
          const { [menuid]: __, ...restInstr } = prevInstr;
          return restInstr;
        });
        return rest;
      }
      
      return {
        ...prev,
        [menuid]: newQty
      };
    });
  };

  const updateItemInstructions = (menuid: string, instructions: string) => {
    setEditedItemInstructions(prev => ({
      ...prev,
      [menuid]: instructions
    }));
  };

  const renderTableCard = (table: TableOption) => {
    const displayStatus = getTableDisplayStatus(table);
    const tableOrders = getTableOrders(table.number || table.name || `Table ${table.id}`);
    const totalAmount = tableOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    return (
      <TouchableOpacity
        style={[
          styles.tableCard,
          displayStatus === 'occupied' && styles.tableCardOccupied,
          displayStatus === 'available' && styles.tableCardAvailable,
          displayStatus === 'reserved' && styles.tableCardReserved,
        ]}
        onPress={() => handleTablePress(table)}
      >
        <View style={styles.tableCardHeader}>
          <Text style={styles.tableNumber}>{table.number || table.name}</Text>
          <View style={[
            styles.statusBadge,
            displayStatus === 'occupied' && styles.statusOccupied,
            displayStatus === 'available' && styles.statusAvailable,
            displayStatus === 'reserved' && styles.statusReserved,
          ]}>
            <Text style={[
              styles.statusText,
              displayStatus === 'occupied' && styles.statusTextOccupied,
              displayStatus === 'available' && styles.statusTextAvailable,
              displayStatus === 'reserved' && styles.statusTextReserved,
            ]}>
              {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.tableCapacity}>Capacity: {table.capacity}</Text>

        {tableOrders.length > 0 && (
          <View style={styles.tableOrderInfo}>
            <Text style={styles.orderCount}>{tableOrders.length} active order{tableOrders.length > 1 ? 's' : ''}</Text>
            <Text style={styles.orderAmount}>₹{totalAmount.toFixed(0)}</Text>
          </View>
        )}

        <View style={styles.tableCardFooter}>
          <Ionicons 
            name={displayStatus === 'occupied' ? 'restaurant' : displayStatus === 'reserved' ? 'time' : 'add-circle-outline'} 
            size={20} 
            color={displayStatus === 'occupied' ? '#EF4444' : displayStatus === 'reserved' ? '#F59E0B' : '#22C55E'} 
          />
          <Text style={styles.tableCardAction}>
            {displayStatus === 'occupied' ? 'View Orders' : displayStatus === 'reserved' ? 'Reserved' : 'Add Order'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
            <Text style={styles.headerTitle}>Tables Management</Text>
            <Text style={styles.headerSubtitle}>
              {tables.filter(table => getTableDisplayStatus(table) === 'occupied').length} occupied tables
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchTables}>
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {message && (
          <View style={styles.section}>
            <View style={[styles.messageContainer, message.type === 'error' ? styles.messageError : message.type === 'success' ? styles.messageSuccess : styles.messageInfo]}>
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          </View>
        )}

        {loadingTables ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading tables...</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Restaurant Tables</Text>
            <View style={styles.tablesGrid}>
              {tables
                .filter(table => getTableDisplayStatus(table) === 'occupied')
                .map((table, index) => {
                  console.log(`Rendering table ${index}: ${table.number} (ID: ${table.id})`);
                  return (
                    <View key={`table-${table.id}-${table.number}`}>
                      {renderTableCard(table)}
                    </View>
                  );
                })
              }
            </View>
            {tables.filter(table => getTableDisplayStatus(table) === 'occupied').length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="apps-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyStateTitle}>No Occupied Tables</Text>
                <Text style={styles.emptyStateText}>All tables are currently available</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchTables}>
                  <Text style={styles.retryText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Table Orders Modal */}
      <Modal
        visible={showOrderModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowOrderModal(false)} style={styles.closeButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedTable?.number || selectedTable?.name} Orders
            </Text>
            <TouchableOpacity style={styles.addOrderButton} onPress={handleNewOrderForTable}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedTable && (() => {
              const tableOrders = getTableOrders(selectedTable.number || selectedTable.name || `Table ${selectedTable.id}`);
              
              if (tableOrders.length === 0) {
                return (
                  <View style={styles.emptyOrdersState}>
                    <Ionicons name="receipt-outline" size={48} color="#CCCCCC" />
                    <Text style={styles.emptyOrdersTitle}>No Active Orders</Text>
                    <Text style={styles.emptyOrdersText}>This table has no current orders</Text>
                    <TouchableOpacity style={styles.newOrderButton} onPress={handleNewOrderForTable}>
                      <Text style={styles.newOrderButtonText}>Create New Order</Text>
                    </TouchableOpacity>
                  </View>
                );
              }

              return tableOrders.map((order) => {
                const timeAgo = order.timestamp ? Math.floor((Date.now() - order.timestamp.getTime()) / (1000 * 60)) : 0;
                return (
                  <View key={order.id} style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                      <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                      <View style={[
                        styles.orderStatusBadge,
                        order.status === 'preparing' && styles.statusPreparing,
                        order.status === 'ready' && styles.statusReady,
                      ]}>
                        <Text style={[
                          styles.orderStatusText,
                          order.status === 'preparing' && styles.statusTextPreparing,
                          order.status === 'ready' && styles.statusTextReady,
                        ]}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.orderTime}>{timeAgo} minutes ago</Text>
                    <Text style={styles.orderTotal}>Total: ₹{(order.total || 0).toFixed(0)}</Text>

                    <View style={styles.orderItemsList}>
                      {order.items.map((item) => (
                        <View key={item.id} style={styles.orderItemRow}>
                          <Text style={styles.orderItemName}>{item.name}</Text>
                          <Text style={styles.orderItemQty}>×{item.quantity}</Text>
                          <Text style={styles.orderItemPrice}>₹{((item.price || 0) * item.quantity).toFixed(0)}</Text>
                        </View>
                      ))}
                    </View>

                    {order.guestInfo && (
                      <View style={styles.guestInfo}>
                        <Text style={styles.guestName}>Guest: {order.guestInfo.name}</Text>
                        {order.guestInfo.whatsapp && (
                          <Text style={styles.guestWhatsapp}>WhatsApp: {order.guestInfo.whatsapp}</Text>
                        )}
                      </View>
                    )}

                    <TouchableOpacity 
                      style={styles.updateOrderButton}
                      onPress={() => handleEditOrder(order)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.updateOrderButtonText}>Update Order</Text>
                    </TouchableOpacity>
                  </View>
                );
              });
            })()}
          </ScrollView>
        </View>
      </Modal>

      {/* Order Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.closeButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Edit Order #{editingOrder?.orderNumber}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Customer Info */}
            <View style={styles.customerInfoSection}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <TextInput
                style={styles.customerInput}
                placeholder="Customer Name"
                value={editedCustomerName}
                onChangeText={setEditedCustomerName}
              />
              <TextInput
                style={styles.customerInput}
                placeholder="Customer Phone"
                value={editedCustomerPhone}
                onChangeText={setEditedCustomerPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Current Items */}
            <View style={styles.currentItemsSection}>
              <Text style={styles.sectionTitle}>Current Items</Text>
              {editingOrder?.items.map((item: any) => {
                const menuItem = menuItems.find(m => m._id === (typeof item.menuid === 'string' ? item.menuid : item.menuid?._id));
                const itemId = typeof item.menuid === 'string' 
                  ? item.menuid 
                  : (item.menuid?._id || item.id || item._id);
                const currentQty = editedItems[itemId] || 0;
                
                return (
                  <View key={item.id || item._id} style={styles.editItemContainer}>
                    <View style={styles.editItemRow}>
                      <View style={styles.editItemInfo}>
                        <Text style={styles.editItemName}>{item.name || menuItem?.name}</Text>
                        <Text style={styles.editItemPrice}>₹{((item.price || menuItem?.price || 0) * currentQty).toFixed(0)}</Text>
                      </View>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => adjustItemQuantity(itemId, -1)}
                        >
                          <Ionicons name="remove" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{currentQty}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => adjustItemQuantity(itemId, 1)}
                        >
                          <Ionicons name="add" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {currentQty > 0 && (
                      <TextInput
                        style={styles.instructionsInput}
                        placeholder="Add special instructions (optional)"
                        value={editedItemInstructions[itemId] || ''}
                        onChangeText={(text) => updateItemInstructions(itemId, text)}
                        multiline
                        numberOfLines={2}
                      />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Add New Items */}
            <View style={styles.addItemsSection}>
              <Text style={styles.sectionTitle}>Add New Items</Text>
              
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  clearButtonMode="while-editing"
                />
              </View>

              {menuItems.length === 0 ? (
                <View style={styles.menuLoadingContainer}>
                  <Text style={styles.noItemsText}>Loading menu items...</Text>
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={fetchMenuItems}
                  >
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.menuItemsContainer}>
                  <ScrollView 
                    style={styles.menuItemsScrollView}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    {menuItems
                      .filter(item => {
                        // Filter by search query
                        const matchesSearch = searchQuery === '' || 
                          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
                        
                        // Filter out items already in the order
                        const notInOrder = !editingOrder?.items.some((orderItem: any) => {
                          const orderItemId = typeof orderItem.menuid === 'string' 
                            ? orderItem.menuid 
                            : (orderItem.menuid?._id || orderItem.id || orderItem._id);
                          return orderItemId === item._id;
                        });
                        
                        return matchesSearch && notInOrder;
                      })
                      .map((item) => {
                        const currentQty = editedItems[item._id] || 0;
                        
                        if (currentQty === 0) {
                          return (
                            <TouchableOpacity
                              key={item._id}
                              style={styles.addItemRow}
                              onPress={() => adjustItemQuantity(item._id, 1)}
                            >
                              <View style={styles.addItemInfo}>
                                <Text style={styles.addItemName}>{item.name}</Text>
                                <Text style={styles.addItemDescription}>{item.description || 'No description'}</Text>
                                <View style={styles.addItemPriceRow}>
                                  <Text style={styles.addItemPrice}>₹{item.price}</Text>
                                  {item.isVegetarian && (
                                    <View style={styles.vegIndicator}>
                                      <Text style={styles.vegText}>VEG</Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                              <Ionicons name="add-circle-outline" size={24} color="#2C2C2C" />
                            </TouchableOpacity>
                          );
                        } else {
                          return (
                            <View key={item._id} style={styles.editItemContainer}>
                              <View style={styles.editItemRow}>
                                <View style={styles.editItemInfo}>
                                  <Text style={styles.editItemName}>{item.name}</Text>
                                  <Text style={styles.editItemPrice}>₹{(item.price * currentQty).toFixed(0)} (₹{item.price} each)</Text>
                                </View>
                                <View style={styles.quantityControls}>
                                  <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => adjustItemQuantity(item._id, -1)}
                                  >
                                    <Ionicons name="remove" size={16} color="#FFFFFF" />
                                  </TouchableOpacity>
                                  <Text style={styles.quantityText}>{currentQty}</Text>
                                  <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => adjustItemQuantity(item._id, 1)}
                                  >
                                    <Ionicons name="add" size={16} color="#FFFFFF" />
                                  </TouchableOpacity>
                                </View>
                              </View>
                              <TextInput
                                style={styles.instructionsInput}
                                placeholder="Add special instructions (optional)"
                                value={editedItemInstructions[item._id] || ''}
                                onChangeText={(text) => updateItemInstructions(item._id, text)}
                                multiline
                                numberOfLines={2}
                              />
                            </View>
                          );
                        }
                      })
                    }
                    {menuItems
                      .filter(item => {
                        const matchesSearch = searchQuery === '' || 
                          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
                        
                        const notInOrder = !editingOrder?.items.some((orderItem: any) => {
                          const orderItemId = typeof orderItem.menuid === 'string' 
                            ? orderItem.menuid 
                            : (orderItem.menuid?._id || orderItem.id || orderItem._id);
                          return orderItemId === item._id;
                        });
                        
                        return matchesSearch && notInOrder;
                      }).length === 0 && (
                        <View style={styles.noSearchResults}>
                          <Ionicons name="search-outline" size={48} color="#CCCCCC" />
                          <Text style={styles.noSearchResultsText}>
                            {searchQuery ? `No items found for "${searchQuery}"` : 'All menu items are already in the order'}
                          </Text>
                        </View>
                      )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Order Total */}
            <View style={styles.totalSection}>
              <Text style={styles.totalText}>
                Updated Total: ₹{Object.entries(editedItems).reduce((total, [menuid, quantity]) => {
                  const menuItem = menuItems.find(m => m._id === menuid);
                  const existingItem = editingOrder?.items.find((item: any) => (item.menuid || item.id) === menuid);
                  const price = menuItem?.price || existingItem?.price || 0;
                  return total + (price * quantity);
                }, 0).toFixed(0)}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.updateButton, isUpdating && styles.disabledButton]}
              onPress={handleUpdateOrder}
              disabled={isUpdating}
            >
              <Text style={styles.updateButtonText}>
                {isUpdating ? 'Updating Order...' : 'Update Order'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
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
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: width * 0.05,
  },
  headerTitle: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: responsiveFontSize(14),
    color: '#E0E0E0',
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
    marginBottom: height * 0.02,
  },
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tableCardOccupied: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  tableCardAvailable: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  tableCardReserved: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  tableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tableNumber: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusOccupied: {
    backgroundColor: '#EF4444',
  },
  statusAvailable: {
    backgroundColor: '#22C55E',
  },
  statusReserved: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: responsiveFontSize(10),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusTextOccupied: {
    color: '#FFFFFF',
  },
  statusTextAvailable: {
    color: '#FFFFFF',
  },
  statusTextReserved: {
    color: '#FFFFFF',
  },
  tableCapacity: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
    marginBottom: 8,
  },
  tableOrderInfo: {
    marginBottom: 8,
  },
  orderCount: {
    fontSize: responsiveFontSize(12),
    color: '#2C2C2C',
    fontWeight: '600',
  },
  orderAmount: {
    fontSize: responsiveFontSize(14),
    color: '#EF4444',
    fontWeight: 'bold',
  },
  tableCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tableCardAction: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: responsiveFontSize(16),
    color: '#666666',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: '600',
    color: '#2C2C2C',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
  },
  messageContainer: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.012,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  messageText: {
    fontSize: responsiveFontSize(13),
    textAlign: 'center',
  },
  messageError: {
    backgroundColor: '#FFEAE9',
    borderColor: '#FFB8B0',
  },
  messageSuccess: {
    backgroundColor: '#E9FFEF',
    borderColor: '#B6F2C9',
  },
  messageInfo: {
    backgroundColor: '#F2F9FF',
    borderColor: '#CFE9FF',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    backgroundColor: '#2C2C2C',
    paddingTop: height * 0.03,
    paddingBottom: height * 0.025,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
    marginBottom: 10,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  addOrderButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalTitle: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: width * 0.05,
    marginBottom: height * 0.02,
  },
  emptyOrdersState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyOrdersTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: '600',
    color: '#2C2C2C',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyOrdersText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  newOrderButton: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  newOrderButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  orderStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPreparing: {
    backgroundColor: '#FFF3CD',
  },
  statusReady: {
    backgroundColor: '#D1ECF1',
  },
  orderStatusText: {
    fontSize: responsiveFontSize(11),
    fontWeight: '600',
  },
  statusTextPreparing: {
    color: '#856404',
  },
  statusTextReady: {
    color: '#0C5460',
  },
  orderTime: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  orderItemsList: {
    marginBottom: 12,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  orderItemName: {
    flex: 1,
    fontSize: responsiveFontSize(12),
    color: '#2C2C2C',
  },
  orderItemQty: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
    marginHorizontal: 8,
  },
  orderItemPrice: {
    fontSize: responsiveFontSize(12),
    fontWeight: '600',
    color: '#2C2C2C',
  },
  guestInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  guestName: {
    fontSize: responsiveFontSize(12),
    color: '#2C2C2C',
    fontWeight: '600',
  },
  guestWhatsapp: {
    fontSize: responsiveFontSize(11),
    color: '#666666',
  },
  updateOrderButton: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  updateOrderButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(12),
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  customerInfoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customerInput: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: responsiveFontSize(14),
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
  },
  currentItemsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  editItemContainer: {
    marginBottom: 12,
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: responsiveFontSize(12),
    backgroundColor: '#F9F9F9',
    marginTop: 8,
    textAlignVertical: 'top',
  },
  editItemInfo: {
    flex: 1,
  },
  editItemName: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: '#2C2C2C',
  },
  editItemPrice: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    backgroundColor: '#2C2C2C',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: '#2C2C2C',
    minWidth: 30,
    textAlign: 'center',
  },
  addItemsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  addItemInfo: {
    flex: 1,
  },
  addItemName: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: '#2C2C2C',
  },
  addItemPrice: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
    marginTop: 2,
  },
  addItemDescription: {
    fontSize: responsiveFontSize(11),
    color: '#999999',
    marginTop: 2,
  },
  noItemsText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    textAlign: 'center',
    padding: 20,
  },
  updateButton: {
    backgroundColor: '#2C2C2C',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  totalSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2C2C2C',
  },
  totalText: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#2C2C2C',
    textAlign: 'center',
  },
  menuLoadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: responsiveFontSize(14),
    color: '#2C2C2C',
    paddingVertical: 4,
  },
  menuItemsContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  menuItemsScrollView: {
    maxHeight: height * 0.4, // Limit height to 40% of screen
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addItemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  vegIndicator: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vegText: {
    fontSize: responsiveFontSize(9),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  noSearchResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noSearchResultsText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  modalFooter: {
    backgroundColor: '#FFFFFF',
    paddingTop: 15,
    paddingBottom: 10,
    paddingHorizontal: width * 0.05,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});