import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrders, Order } from '../context/OrderContext';
import PrintOrderScreen from './PrintOrderScreen';

const { width, height } = Dimensions.get('window');

interface OrderItemProps {
  orderId: string;
  orderNumber: string;
  table: string;
  items: number;
  amount: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'done';
  time: string;
  order: Order;
  isPrinted: boolean;
  isUpdating?: boolean;
  onStatusChange: (orderId: string, newStatus: 'preparing' | 'ready' | 'served' | 'done') => void;
  onCancel: (orderId: string) => void;
  onRemove: (orderId: string) => void;
  onViewOrder: (order: Order) => void;
  onPrintOrder: (order: Order) => void;
}

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

const OrderItem = ({ orderId, orderNumber, table, items, amount, status, time, order, isPrinted, isUpdating = false, onStatusChange, onCancel, onRemove, onViewOrder, onPrintOrder }: OrderItemProps) => {
  const getNextStatus = () => {
    if (status === 'pending') return 'preparing';
    if (status === 'preparing') return 'ready';
    if (status === 'ready') return 'served';
    // No next status for served - employees cannot mark as done
    return status;
  };

  const getButtonText = () => {
    if (status === 'pending') return 'Start Preparing';
    if (status === 'preparing') return 'Mark Ready';
    if (status === 'ready') return 'Mark Served';
    return '';
  };

  const handleStatusUpdate = () => {
    if (isUpdating) return;
    
    const nextStatus = getNextStatus();
    if (nextStatus === 'done') {
      // Remove from list when marked as done (admin only action)
      onRemove(orderId);
    } else {
      onStatusChange(orderId, nextStatus);
    }
  };

  const handleCancel = () => {
    if (isUpdating) return;
    onCancel(orderId);
  };

  return (
    <View style={styles.orderItem}>
      <View style={styles.orderLeft}>
        <Text style={styles.orderId}>#{orderNumber}</Text>
        <Text style={styles.orderDetails}>{table} • {items} items</Text>
        <Text style={styles.orderTime}>{time}</Text>
        
        {/* New Action Buttons Row */}
        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.viewOrderButton}
            onPress={() => onViewOrder(order)}
          >
            <Ionicons name="eye-outline" size={14} color="#2C2C2C" />
            <Text style={styles.viewOrderText}>View Order</Text>
          </TouchableOpacity>
          
          {/* Show print button only for non-pending orders */}
          {status !== 'pending' && (
            <TouchableOpacity
              style={styles.printOrderButton}
              onPress={() => onPrintOrder(order)}
            >
              <Ionicons name={isPrinted ? "checkmark-circle" : "print-outline"} size={14} color={isPrinted ? "#28A745" : "#2C2C2C"} />
              <Text style={[styles.printOrderText, isPrinted && styles.printedOrderText]}>
                {isPrinted ? "Printed" : "Print Order"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.orderRight}>
        <Text style={styles.orderAmount}>{amount}</Text>
        <View style={[
          styles.orderStatusBadge,
          status === 'pending' && styles.statusPending,
          status === 'preparing' && styles.statusPreparing,
          status === 'ready' && styles.statusReady,
          status === 'served' && styles.statusServed,
        ]}>
          <Text style={[
            styles.orderStatusText,
            status === 'pending' && styles.statusTextPending,
            status === 'preparing' && styles.statusTextPreparing,
            status === 'ready' && styles.statusTextReady,
            status === 'served' && styles.statusTextServed,
          ]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
        <View style={styles.orderButtonsContainer}>
          {status === 'pending' && order.createdAt === order.updatedAt && (
            <TouchableOpacity
              style={[styles.cancelButton, isUpdating && styles.disabledButton]}
              onPress={handleCancel}
              disabled={isUpdating}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={responsiveFontSize(12)} color="#FFFFFF" />
              <Text style={styles.cancelButtonText}>
                {isUpdating ? 'Cancelling...' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          )}
          {/* Show status update button for non-done orders, but hide for served orders */}
          {status !== 'done' && status !== 'served' && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                status === 'pending' && styles.pendingButton,
                status === 'preparing' && styles.preparingButton,
                status === 'ready' && styles.readyButton,
                isUpdating && styles.disabledButton,
              ]}
              onPress={handleStatusUpdate}
              disabled={isUpdating}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>
                {isUpdating ? 'Updating...' : getButtonText()}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default function OrdersScreen() {
  const [selectedFilter, setSelectedFilter] = useState('active');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const { orders, updateOrderStatus, loading, error, refreshOrders, fetchOrdersByDate, fetchOrdersByStatus, fetchOrdersByDateAndStatus } = useOrders();
  const [localOrders, setLocalOrders] = useState(orders);
  const [showChefView, setShowChefView] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printedOrders, setPrintedOrders] = useState<Set<string>>(new Set());
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState<Set<string>>(new Set());

  // Filter out only cancelled and done orders for active view (keep served orders visible)
  const activeOrders = localOrders.filter(order => !['cancelled', 'done'].includes(order.status));
  const pendingOrders = activeOrders.filter(order => order.status === 'pending');
  const preparingOrders = activeOrders.filter(order => order.status === 'preparing');
  const readyOrders = activeOrders.filter(order => order.status === 'ready');
  const servedOrders = activeOrders.filter(order => order.status === 'served');
  
  const filters = [
    { id: 'active', label: 'Active Orders', count: activeOrders.length },
    { id: 'pending', label: 'Pending', count: pendingOrders.length },
    { id: 'preparing', label: 'Preparing', count: preparingOrders.length },
    { id: 'ready', label: 'Ready', count: readyOrders.length },
    { id: 'served', label: 'Served', count: servedOrders.length },
  ];

  const handleCancelOrder = async (orderid: string) => {
    try {
      setUpdatingOrderStatus(prev => new Set([...prev, orderid]));
      
      const success = await updateOrderStatus(orderid, 'cancelled');
      if (success) {
        // Remove order from local state when cancelled
        setLocalOrders(prev => prev.filter(order => order.orderid !== orderid));
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
    } finally {
      setUpdatingOrderStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderid);
        return newSet;
      });
    }
  };

  const handleStatusChange = async (orderid: string, newStatus: 'preparing' | 'ready' | 'served' | 'done') => {
    try {
      setUpdatingOrderStatus(prev => new Set([...prev, orderid]));
      
      const success = await updateOrderStatus(orderid, newStatus);
      if (success) {
        setLocalOrders(prev => 
          prev.map(order => 
            order.orderid === orderid ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdatingOrderStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderid);
        return newSet;
      });
    }
  };

  const handleRemoveOrder = async (orderid: string) => {
    try {
      setUpdatingOrderStatus(prev => new Set([...prev, orderid]));
      
      const success = await updateOrderStatus(orderid, 'done');
      if (success) {
        // Remove order from local state when marked as done (admin action)
        setLocalOrders(prev => prev.filter(order => order.orderid !== orderid));
      }
    } catch (err) {
      console.error('Failed to mark order as done:', err);
    } finally {
      setUpdatingOrderStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderid);
        return newSet;
      });
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowChefView(true);
  };

  const handlePrintOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowPrintView(true);
  };

  const handlePrintComplete = () => {
    if (selectedOrder) {
      setPrintedOrders(prev => new Set([...prev, selectedOrder.orderid]));
    }
  };

  const handleClosePrintView = () => {
    setShowPrintView(false);
    setSelectedOrder(null);
  };

  const handleRefresh = async () => {
    if (selectedDate && selectedStatus) {
      await fetchOrdersByDateAndStatus(selectedDate, selectedStatus);
    } else if (selectedDate) {
      await fetchOrdersByDate(selectedDate);
    } else if (selectedStatus) {
      await fetchOrdersByStatus(selectedStatus);
    } else {
      await refreshOrders();
    }
  };

  // Load today's orders by default
  React.useEffect(() => {
    refreshOrders();
  }, []);

  const getFilteredOrders = () => {
    if (selectedFilter === 'active') return activeOrders;
    if (selectedFilter === 'pending') return pendingOrders;
    if (selectedFilter === 'preparing') return preparingOrders;
    if (selectedFilter === 'ready') return readyOrders;
    if (selectedFilter === 'served') return servedOrders;
    return activeOrders;
  };

  const filteredOrders = getFilteredOrders();

  React.useEffect(() => {
    console.log('OrdersScreen: Orders by status:', orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    setLocalOrders(orders);
  }, [orders]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Error Message */}
        {error && (
          <View style={styles.section}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Filter Tabs */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.id && styles.activeFilterTab
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text style={[
                  styles.filterTabText,
                  selectedFilter === filter.id && styles.activeFilterTabText
                ]}>
                  {filter.label} ({filter.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Orders List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === 'active' ? 'Active Orders' : filters.find(f => f.id === selectedFilter)?.label}
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} disabled={loading}>
              <Ionicons name="refresh" size={20} color={loading ? "#CCCCCC" : "#2C2C2C"} />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {filteredOrders.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No orders found</Text>
                </View>
              ) : (
                filteredOrders.map((order) => {
                  const timeAgo = order.timestamp ? 
                    Math.floor((Date.now() - order.timestamp.getTime()) / (1000 * 60)) :
                    Math.floor((Date.now() - new Date(order.orderDate).getTime()) / (1000 * 60));
                  const isPrinted = printedOrders.has(order.orderid);
                  const isUpdating = updatingOrderStatus.has(order.orderid);
                  const orderStatus = order.status as 'pending' | 'preparing' | 'ready' | 'served' | 'done';
                  
                  return (
                    <OrderItem
                      key={order._id}
                      orderId={order.orderid}
                      orderNumber={order.orderNumber || order.orderid}
                      table={order.tableNumber}
                      items={order.items.length}
                      amount={`₹${(order.total || order.totalAmount).toFixed(0)}`}
                      status={orderStatus}
                      time={`${timeAgo} min ago`}
                      order={order}
                      isPrinted={isPrinted}
                      isUpdating={isUpdating}
                      onStatusChange={handleStatusChange}
                      onCancel={handleCancelOrder}
                      onRemove={handleRemoveOrder}
                      onViewOrder={handleViewOrder}
                      onPrintOrder={handlePrintOrder}
                    />
                  );
                })
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Chef Order View Modal */}
      <Modal
        visible={showChefView}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowChefView(false)}
      >
        <View style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />
          
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity style={styles.modalBackButton} onPress={() => setShowChefView(false)} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.modalHeaderCenter}>
                <Text style={styles.modalHeaderTitle}>Kitchen Order</Text>
                <Text style={styles.modalHeaderSubtitle}>#{selectedOrder?.orderNumber}</Text>
              </View>
              <View style={styles.modalHeaderPlaceholder} />
            </View>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedOrder && (
              <>
                {/* Order Info */}
                <View style={styles.modalSection}>
                  <View style={styles.chefOrderInfoCard}>
                    <View style={styles.chefOrderInfoHeader}>
                      <View style={styles.chefOrderInfoLeft}>
                        <Text style={styles.chefOrderNumber}>#{selectedOrder.orderNumber}</Text>
                        <Text style={styles.chefTableNumber}>{selectedOrder.tableNumber}</Text>
                      </View>
                      <View style={styles.chefOrderInfoRight}>
                        <View style={[
                          styles.chefStatusBadge,
                          selectedOrder.status === 'preparing' && styles.statusPreparing,
                          selectedOrder.status === 'ready' && styles.statusReady,
                        ]}>
                          <Text style={[
                            styles.chefStatusText,
                            selectedOrder.status === 'preparing' && styles.statusTextPreparing,
                            selectedOrder.status === 'ready' && styles.statusTextReady,
                          ]}>
                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                          </Text>
                        </View>
                        <Text style={styles.chefOrderTime}>
                          {selectedOrder.timestamp ? 
                            Math.floor((Date.now() - selectedOrder.timestamp.getTime()) / (1000 * 60)) :
                            Math.floor((Date.now() - new Date(selectedOrder.orderDate).getTime()) / (1000 * 60))
                          } min ago
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Order Items */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Order Items</Text>
                  <View style={styles.chefItemsList}>
                    {selectedOrder.items.map((item, index) => (
                      <View key={`${item.id}-${index}`} style={styles.chefItemCard}>
                        <View style={styles.chefItemHeader}>
                          <Text style={styles.chefItemName}>{item.name}</Text>
                          <View style={styles.chefQuantityBadge}>
                            <Text style={styles.chefQuantityText}>×{item.quantity}</Text>
                          </View>
                        </View>
                        
                        {item.instruction && (
                          <View style={styles.chefInstructionContainer}>
                            <Ionicons name="document-text-outline" size={16} color="#F59E0B" />
                            <Text style={styles.chefInstructionText}>{item.instruction}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>

                {/* Special Instructions Summary */}
                {selectedOrder.items.some(item => item.instruction) && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Special Instructions</Text>
                    <View style={styles.chefInstructionsCard}>
                      {selectedOrder.items
                        .filter(item => item.instruction)
                        .map((item, index) => (
                          <View key={index} style={styles.chefInstructionRow}>
                            <Text style={styles.chefInstructionItemName}>{item.name}:</Text>
                            <Text style={styles.chefInstructionItemText}>{item.instruction}</Text>
                          </View>
                        ))}
                    </View>
                  </View>
                )}

                {/* Action Button */}
                <View style={styles.modalSection}>
                  <TouchableOpacity style={styles.chefActionButton} onPress={() => setShowChefView(false)}>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.chefActionButtonText}>Understood</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Print Order Screen */}
      <Modal
        visible={showPrintView}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClosePrintView}
      >
        {selectedOrder && (
          <PrintOrderScreen
            order={selectedOrder}
            onBack={handleClosePrintView}
            onPrintComplete={handlePrintComplete}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: width * 0.05,
    paddingBottom: 12,
  },
  filterContainer: {
    paddingBottom: height * 0.01,
    paddingLeft: width * 0.01,
    marginBottom: -(height * 0.02)
  },
  filterTab: {
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
  activeFilterTab: {
    backgroundColor: '#2C2C2C',
    transform: [{ scale: 1.05 }],
  },
  filterTabText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: height * 0.015,
  },
  ordersList: {
    gap: height * 0.015,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: width * 0.04,
    borderRadius: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderLeft: {
    flex: 1,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  orderId: {
    fontSize: responsiveFontSize(15),
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: height * 0.003,
  },
  orderDetails: {
    fontSize: responsiveFontSize(13),
    color: '#666666',
    marginBottom: height * 0.002,
  },
  orderTime: {
    fontSize: responsiveFontSize(11),
    color: '#666666',
    fontWeight: '400',
  },
  orderAmount: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: height * 0.005,
  },
  orderStatusBadge: {
    paddingHorizontal: width * 0.025,
    paddingVertical: height * 0.005,
    borderRadius: 6,
    minWidth: width * 0.18,
    alignItems: 'center',
  },
  statusPending: {
    backgroundColor: '#F3E8FF',
  },
  statusPreparing: {
    backgroundColor: '#FFF3CD',
  },
  statusReady: {
    backgroundColor: '#D1ECF1',
  },
  statusServed: {
    backgroundColor: '#D4EDDA',
  },
  orderStatusText: {
    fontSize: responsiveFontSize(11),
    fontWeight: '600',
  },
  statusTextPending: {
    color: '#7C3AED',
  },
  statusTextPreparing: {
    color: '#856404',
  },
  statusTextReady: {
    color: '#0C5460',
  },
  statusTextServed: {
    color: '#155724',
  },
  orderButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: width * 0.15,
    gap: 4,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(10),
    fontWeight: '600',
  },
  pendingButton: {
    backgroundColor: '#7C3AED',
  },
  actionButton: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  preparingButton: {
    backgroundColor: '#FFA500',
  },
  readyButton: {
    backgroundColor: '#28A745',
  },
  servedButton: {
    backgroundColor: '#6C757D',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(11),
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
  },
  orderActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  viewOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  viewOrderText: {
    fontSize: responsiveFontSize(10),
    color: '#2C2C2C',
    fontWeight: '600',
  },
  printOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  printOrderText: {
    fontSize: responsiveFontSize(10),
    color: '#2C2C2C',
    fontWeight: '600',
  },
  printedOrderText: {
    color: '#28A745',
  },
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
    marginBottom: 10,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  modalBackButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: width * 0.05,
  },
  modalHeaderTitle: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalHeaderSubtitle: {
    fontSize: responsiveFontSize(14),
    color: '#E0E0E0',
  },
  modalHeaderPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  modalSection: {
    padding: width * 0.05,
    paddingBottom: 16,
  },
  modalSectionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  chefOrderInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chefOrderInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chefOrderInfoLeft: {
    flex: 1,
  },
  chefOrderInfoRight: {
    alignItems: 'flex-end',
  },
  chefOrderNumber: {
    fontSize: responsiveFontSize(24),
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  chefTableNumber: {
    fontSize: responsiveFontSize(16),
    color: '#666666',
    fontWeight: '600',
  },
  chefStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
  },
  chefStatusText: {
    fontSize: responsiveFontSize(12),
    fontWeight: '600',
  },
  chefOrderTime: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
  },
  chefItemsList: {
    gap: 12,
  },
  chefItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chefItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chefItemName: {
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
    color: '#2C2C2C',
    flex: 1,
  },
  chefQuantityBadge: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chefQuantityText: {
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chefInstructionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    gap: 8,
  },
  chefInstructionText: {
    fontSize: responsiveFontSize(14),
    color: '#92400E',
    flex: 1,
    lineHeight: responsiveFontSize(18),
  },
  chefInstructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chefInstructionRow: {
    marginBottom: 12,
  },
  chefInstructionItemName: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  chefInstructionItemText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    lineHeight: responsiveFontSize(18),
  },
  chefActionButton: {
    backgroundColor: '#2C2C2C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  chefActionButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFEAE9',
    borderColor: '#FFB8B0',
    borderWidth: 1,
    borderRadius: 10,
    padding: width * 0.04,
    alignItems: 'center',
  },
  errorText: {
    fontSize: responsiveFontSize(14),
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(12),
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    padding: width * 0.04,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: responsiveFontSize(16),
    color: '#666666',
  },
});