import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../context/OrderContext';

const { width, height } = Dimensions.get('window');

interface OrderItemProps {
  orderId: string;
  orderNumber: string;
  table: string;
  items: number;
  amount: string;
  status: 'preparing' | 'ready' | 'served';
  time: string;
  onStatusChange: (orderId: string, newStatus: 'preparing' | 'ready' | 'served') => void;
  onRemove: (orderId: string) => void;
}

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

const OrderItem = ({ orderId, orderNumber, table, items, amount, status, time, onStatusChange, onRemove }: OrderItemProps) => {
  const getNextStatus = () => {
    if (status === 'preparing') return 'ready';
    if (status === 'ready') return 'served';
    return 'served';
  };

  const getButtonText = () => {
    if (status === 'preparing') return 'Mark Ready';
    if (status === 'ready') return 'Mark Served';
    return 'Served';
  };

  const handleStatusUpdate = () => {
    const nextStatus = getNextStatus();
    if (nextStatus === 'served') {
      // Remove from list when marked as served
      onRemove(orderId);
    } else {
      onStatusChange(orderId, nextStatus);
    }
  };

  return (
    <View style={styles.orderItem}>
      <View style={styles.orderLeft}>
        <Text style={styles.orderId}>#{orderNumber}</Text>
        <Text style={styles.orderDetails}>{table} • {items} items</Text>
        <Text style={styles.orderTime}>{time}</Text>
      </View>
      <View style={styles.orderRight}>
        <Text style={styles.orderAmount}>{amount}</Text>
        <View style={[
          styles.orderStatusBadge,
          status === 'preparing' && styles.statusPreparing,
          status === 'ready' && styles.statusReady,
          status === 'served' && styles.statusServed,
        ]}>
          <Text style={[
            styles.orderStatusText,
            status === 'preparing' && styles.statusTextPreparing,
            status === 'ready' && styles.statusTextReady,
            status === 'served' && styles.statusTextServed,
          ]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
        {status !== 'served' && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              status === 'preparing' && styles.preparingButton,
              status === 'ready' && styles.readyButton,
            ]}
            onPress={handleStatusUpdate}
          >
            <Text style={styles.actionButtonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function OrdersScreen() {
  const [selectedFilter, setSelectedFilter] = useState('active');
  const { orders, updateOrderStatus } = useOrders();
  const [localOrders, setLocalOrders] = useState(orders);

  // Filter out served orders for active view
  const activeOrders = localOrders.filter(order => order.status !== 'served');
  const preparingOrders = activeOrders.filter(order => order.status === 'preparing');
  const readyOrders = activeOrders.filter(order => order.status === 'ready');
  
  const filters = [
    { id: 'active', label: 'Active Orders', count: activeOrders.length },
    { id: 'preparing', label: 'Preparing', count: preparingOrders.length },
    { id: 'ready', label: 'Ready', count: readyOrders.length },
  ];

  const handleStatusChange = (orderId: string, newStatus: 'preparing' | 'ready' | 'served') => {
    updateOrderStatus(orderId, newStatus);
    setLocalOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleRemoveOrder = (orderId: string) => {
    // Remove order from local state when marked as served
    setLocalOrders(prev => prev.filter(order => order.id !== orderId));
    updateOrderStatus(orderId, 'served');
  };

  const getFilteredOrders = () => {
    if (selectedFilter === 'active') return activeOrders;
    if (selectedFilter === 'preparing') return preparingOrders;
    if (selectedFilter === 'ready') return readyOrders;
    return activeOrders;
  };

  const filteredOrders = getFilteredOrders();

  // Update local orders when context orders change
  React.useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.sectionTitle}>
            {selectedFilter === 'active' ? 'Active Orders' : filters.find(f => f.id === selectedFilter)?.label}
          </Text>
          <View style={styles.ordersList}>
            {filteredOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No orders found</Text>
              </View>
            ) : (
              filteredOrders.map((order) => {
                const timeAgo = Math.floor((Date.now() - order.timestamp.getTime()) / (1000 * 60));
                return (
                  <OrderItem
                    key={order.id}
                    orderId={order.id}
                    orderNumber={order.orderNumber}
                    table={order.tableNumber}
                    items={order.items.length}
                    amount={`₹${order.total.toFixed(0)}`}
                    status={order.status}
                    time={`${timeAgo} min ago`}
                    onStatusChange={handleStatusChange}
                    onRemove={handleRemoveOrder}
                  />
                );
              })
            )}
          </View>
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
  statusTextPreparing: {
    color: '#856404',
  },
  statusTextReady: {
    color: '#0C5460',
  },
  statusTextServed: {
    color: '#155724',
  },
  actionButton: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  preparingButton: {
    backgroundColor: '#FFA500',
  },
  readyButton: {
    backgroundColor: '#28A745',
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
});