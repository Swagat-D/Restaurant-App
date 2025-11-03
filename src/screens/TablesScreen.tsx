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

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

export default function TablesScreen({ onBack, onNewOrder }: TablesScreenProps) {
  const { orders } = useOrders();
  const [tables, setTables] = useState<TableOption[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableOption | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

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

        setTables(formattedTables);
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

  // Get orders for a specific table
  const getTableOrders = (tableNumber: string) => {
    return orders.filter(order => 
      order.tableNumber === tableNumber && order.status !== 'served'
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

  const renderTableCard = (table: TableOption) => {
    const displayStatus = getTableDisplayStatus(table);
    const tableOrders = getTableOrders(table.number || table.name || `Table ${table.id}`);
    const totalAmount = tableOrders.reduce((sum, order) => sum + order.total, 0);

    return (
      <TouchableOpacity
        key={table.id}
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
            <Text style={styles.headerSubtitle}>{tables.length} tables available</Text>
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
              {tables.map(renderTableCard)}
            </View>
            {tables.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="apps-outline" size={48} color="#CCCCCC" />
                <Text style={styles.emptyStateTitle}>No Tables Found</Text>
                <Text style={styles.emptyStateText}>No tables are available at the moment</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchTables}>
                  <Text style={styles.retryText}>Retry</Text>
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
                const timeAgo = Math.floor((Date.now() - order.timestamp.getTime()) / (1000 * 60));
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
                    <Text style={styles.orderTotal}>Total: ₹{order.total.toFixed(0)}</Text>

                    <View style={styles.orderItemsList}>
                      {order.items.map((item) => (
                        <View key={item.id} style={styles.orderItemRow}>
                          <Text style={styles.orderItemName}>{item.name}</Text>
                          <Text style={styles.orderItemQty}>×{item.quantity}</Text>
                          <Text style={styles.orderItemPrice}>₹{(item.price * item.quantity).toFixed(0)}</Text>
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
                  </View>
                );
              });
            })()}
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
    paddingTop: height * 0.06,
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
});