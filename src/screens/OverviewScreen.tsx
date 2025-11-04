import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NewOrderScreen from './NewOrderScreen';
import { useOrders } from '../context/OrderContext';

const { width, height } = Dimensions.get('window');

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
}

interface RecentOrderProps {
  orderId: string;
  table: string;
  items: number;
  amount: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'done' | 'cancelled';
  time: string;
}

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

const StatsCard = ({ title, value, subtitle, color = '#000000' }: StatsCardProps) => (
  <View style={styles.statsCard}>
    <Text style={styles.statsTitle}>{title}</Text>
    <Text style={[styles.statsValue, { color }]}>{value}</Text>
    {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
  </View>
);

const RecentOrder = ({ orderId, table, items, amount, status, time }: RecentOrderProps) => (
  <View style={styles.orderItem}>
    <View style={styles.orderLeft}>
      <Text style={styles.orderId}>#{orderId}</Text>
      <Text style={styles.orderDetails}>{table} • {items} items</Text>
      <Text style={styles.orderTime}>{time}</Text>
    </View>
    <View style={styles.orderRight}>
      <Text style={styles.orderAmount}>{amount}</Text>
      <View style={[
        styles.orderStatusBadge,
        status === 'pending' && styles.statusPending,
        status === 'preparing' && styles.statusPreparing,
        status === 'ready' && styles.statusReady,
        status === 'served' && styles.statusServed,
        status === 'done' && styles.statusDone,
        status === 'cancelled' && styles.statusCancelled,
      ]}>
        <Text style={[
          styles.orderStatusText,
          status === 'pending' && styles.statusTextPending,
          status === 'preparing' && styles.statusTextPreparing,
          status === 'ready' && styles.statusTextReady,
          status === 'served' && styles.statusTextServed,
          status === 'done' && styles.statusTextDone,
          status === 'cancelled' && styles.statusTextCancelled,
        ]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    </View>
  </View>
);


interface OverviewScreenProps {
  onNewOrder?: () => void;
  onNavigateToTables?: () => void;
}

export default function OverviewScreen({ onNewOrder, onNavigateToTables }: OverviewScreenProps) {
  const { orders, updateOrderStatus } = useOrders();
  const [showAllOrdersModal, setShowAllOrdersModal] = useState(false);
  
  // Filter out only cancelled and done orders from active orders 
  // Active = orders that are still editable (pending, preparing, ready, served)
  const activeOrders = orders.filter(order => !['cancelled', 'done'].includes(order.status));
  
  // Kitchen active orders = orders that need kitchen attention (exclude served)
  const kitchenActiveOrders = orders.filter(order => !['served', 'cancelled', 'done'].includes(order.status));
  
  // Filter today's orders (include ALL orders of today for complete stats)
  const todayOrders = orders.filter(order => {
    const today = new Date().toDateString();
    const orderDate = order.timestamp ? order.timestamp.toDateString() : new Date(order.orderDate || Date.now()).toDateString();
    return orderDate === today; // Include ALL orders of today
  });
  
  const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);

  const handleStatusUpdate = (orderId: string, newStatus: 'preparing' | 'ready' | 'served') => {
    updateOrderStatus(orderId, newStatus);
  };

  const statsData = [
    { 
      title: "Today's Orders", 
      value: todayOrders.length.toString(), 
      subtitle: "Total orders", 
      color: "#2C2C2C",
      icon: "receipt-outline"
    },
    { 
      title: "Kitchen Orders", 
      value: kitchenActiveOrders.length.toString(), 
      subtitle: "In progress", 
      color: "#FF6B35",
      icon: "restaurant-outline"
    },
    { 
      title: "Revenue", 
      value: `₹${todayRevenue.toFixed(0)}`, 
      subtitle: "Today's total", 
      color: "#28A745",
      icon: "card-outline"
    },
    { 
      title: "Avg Order", 
      value: todayOrders.length > 0 ? `₹${(todayRevenue / todayOrders.length).toFixed(0)}` : '₹0', 
      subtitle: "Per order", 
      color: "#6C63FF",
      icon: "trending-up-outline"
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Stats Cards - Horizontal Scroll */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContainer}
        >
          {statsData.map((stat, index) => (
            <View key={index} style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                <Text style={styles.statsTitle}>{stat.title}</Text>
              </View>
              <Text style={[styles.statsValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statsSubtitle}>{stat.subtitle}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Active Orders Management - Simplified */}
      {activeOrders.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Orders ({activeOrders.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {activeOrders.map((order) => (
              <View key={order._id || order.id} style={styles.activeOrderCard}>
                <View style={styles.orderCardHeader}>
                  <Text style={styles.orderCardNumber}>#{order.orderNumber || order.orderid}</Text>
                  <Text style={styles.orderCardTable}>{order.tableNumber}</Text>
                </View>
                
                <Text style={styles.orderCardTotal}>₹{(order.total || order.totalAmount || 0).toFixed(0)}</Text>
                <Text style={styles.orderCardItems}>{order.items.length} items</Text>
                
                <View style={[
                  styles.orderStatusIndicator,
                  order.status === 'pending' && styles.statusPending,
                  order.status === 'preparing' && styles.statusPreparing,
                  order.status === 'ready' && styles.statusReady,
                  order.status === 'served' && styles.statusServed,
                  order.status === 'done' && styles.statusDone,
                  order.status === 'cancelled' && styles.statusCancelled,
                ]}>
                  <Text style={[
                    styles.orderStatusText,
                    order.status === 'pending' && styles.statusTextPending,
                    order.status === 'preparing' && styles.statusTextPreparing,
                    order.status === 'ready' && styles.statusTextReady,
                    order.status === 'served' && styles.statusTextServed,
                    order.status === 'done' && styles.statusTextDone,
                    order.status === 'cancelled' && styles.statusTextCancelled,
                  ]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionCard} onPress={onNewOrder} activeOpacity={0.8}>
            <Ionicons name="add-circle-outline" size={28} color="#2C2C2C" />
            <Text style={styles.quickActionTitle}>New Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <Ionicons name="restaurant-outline" size={28} color="#2C2C2C" />
            <Text style={styles.quickActionTitle}>Kitchen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} onPress={onNavigateToTables}>
            <Ionicons name="apps-outline" size={28} color="#2C2C2C" />
            <Text style={styles.quickActionTitle}>Tables</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => setShowAllOrdersModal(true)}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.ordersList}>
          {todayOrders.slice(0, 5).map((order) => {
            const timeAgo = order.timestamp ? Math.floor((Date.now() - order.timestamp.getTime()) / (1000 * 60)) : 0;
            return (
              <RecentOrder 
                key={order.id}
                orderId={order.orderNumber || 'Unknown'} 
                table={String(order.tableNumber || 0)} 
                items={order.items?.length || 0} 
                amount={`₹${(order.total || 0).toFixed(0)}`} 
                status={order.status as 'pending' | 'preparing' | 'ready' | 'served' | 'done' | 'cancelled'} 
                time={`${timeAgo} min ago`} 
              />
            );
          })}
          {todayOrders.length === 0 && (
            <View style={styles.emptyOrdersState}>
              <Ionicons name="receipt-outline" size={48} color="#CCCCCC" />
              <Text style={styles.emptyOrdersTitle}>No Orders Yet</Text>
              <Text style={styles.emptyOrdersText}>Start taking orders to see them here</Text>
            </View>
          )}
        </View>
      </View>

      {/* Enhanced Modal with Better Styling */}
      <Modal
        visible={showAllOrdersModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAllOrdersModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAllOrdersModal(false)} style={styles.closeButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Today's Orders</Text>
            <View style={styles.modalBadge}>
              <Text style={styles.modalBadgeText}>{todayOrders.length}</Text>
            </View>
          </View>
          
          {todayOrders.length === 0 ? (
            <View style={styles.modalEmptyState}>
              <Ionicons name="receipt-outline" size={80} color="#CCCCCC" />
              <Text style={styles.modalEmptyTitle}>No Orders Today</Text>
              <Text style={styles.modalEmptyText}>Orders will appear here as they come in</Text>
            </View>
          ) : (
            <FlatList
              data={todayOrders}
              keyExtractor={(item) => item.id || Math.random().toString()}
              renderItem={({ item }) => {
                const timeAgo = item.timestamp ? Math.floor((Date.now() - item.timestamp.getTime()) / (1000 * 60)) : 0;
                return (
                  <View style={styles.modalOrderItem}>
                    <RecentOrder 
                      orderId={item.orderNumber || 'Unknown'} 
                      table={String(item.tableNumber || 0)} 
                      items={item.items?.length || 0} 
                      amount={`₹${(item.total || 0).toFixed(0)}`} 
                      status={item.status as 'pending' | 'preparing' | 'ready' | 'served' | 'done' | 'cancelled'} 
                      time={`${timeAgo} min ago`} 
                    />
                  </View>
                );
              }}
              contentContainerStyle={styles.modalOrdersList}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    padding: width * 0.04,
    marginBottom: height * 0.01,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: height * 0.015,
  },
  viewAllText: {
    fontSize: responsiveFontSize(14),
    color: '#2C2C2C',
    fontWeight: '600',
  },
  statsScrollContainer: {
    paddingRight: width * 0.04,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: width * 0.04,
    marginRight: width * 0.03,
    minWidth: width * 0.4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  statsTitle: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
    marginLeft: 8,
    fontWeight: '600',
  },
  statsValue: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    marginBottom: height * 0.005,
  },
  statsSubtitle: {
    fontSize: responsiveFontSize(11),
    color: '#888888',
    fontWeight: '400',
  },
  // Active Orders Cards
  activeOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginRight: 12,
    minWidth: width * 0.45,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderCardNumber: {
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  orderCardTable: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
  },
  orderCardTotal: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  orderCardItems: {
    fontSize: responsiveFontSize(11),
    color: '#666666',
    marginBottom: 8,
  },
  orderStatusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: width * 0.02,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: width * 0.04,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.08,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionTitle: {
    fontSize: responsiveFontSize(12),
    fontWeight: '600',
    color: '#2C2C2C',
    marginTop: 6,
    textAlign: 'center',
  },
  ordersList: {
    gap: height * 0.015,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: width * 0.04,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  orderLeft: {
    flex: 1,
  },
  orderRight: {
    alignItems: 'flex-end',
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
  statusDone: {
    backgroundColor: '#E2E3E5',
  },
  statusCancelled: {
    backgroundColor: '#F8D7DA',
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
  statusTextDone: {
    color: '#6C757D',
  },
  statusTextCancelled: {
    color: '#721C24',
  },
  emptyOrdersState: {
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
  emptyOrdersText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.025,
    paddingBottom: height * 0.02,
    backgroundColor: '#2C2C2C',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
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
  modalTitle: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  modalOrdersList: {
    padding: width * 0.04,
  },
  emptyOrdersTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: '600',
    color: '#2C2C2C',
    textAlign: 'center',
    marginBottom: height * 0.01,
  },
  // Modal Enhancement Styles
  modalBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.005,
    borderRadius: 12,
    alignSelf: 'flex-end',
    marginBottom: height * 0.015,
  },
  modalBadgeText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(12),
    fontWeight: '600',
  },
  modalEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.05,
  },
  modalEmptyTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: height * 0.01,
  },
  modalEmptyText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    textAlign: 'center',
  },
  modalOrderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.015,
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
});