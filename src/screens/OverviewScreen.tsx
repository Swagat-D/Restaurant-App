import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NewOrderScreen from './NewOrderScreen';

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
  status: 'preparing' | 'ready' | 'served';
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
    </View>
  </View>
);


interface OverviewScreenProps {
  onNewOrder?: () => void;
}

export default function OverviewScreen({ onNewOrder }: OverviewScreenProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Stats Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <StatsCard title="Total Orders" value="24" subtitle="+3 from yesterday" color="#000000" />
          <StatsCard title="Revenue" value="₹2,840" subtitle="+12% from yesterday" color="#000000" />
          <StatsCard title="Active Tables" value="8/12" subtitle="Tables occupied" color="#000000" />
          <StatsCard title="Avg. Order" value="₹118" subtitle="Per order value" color="#000000" />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={onNewOrder} activeOpacity={0.8}>
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.actionTitle}>New Order</Text>
            <Text style={styles.actionSubtitle}>Take order manually</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="restaurant-outline" size={24} color="#FFFFFF" />
            <Text style={styles.actionTitle}>Kitchen</Text>
            <Text style={styles.actionSubtitle}>Check order status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="apps-outline" size={24} color="#FFFFFF" />
            <Text style={styles.actionTitle}>Tables</Text>
            <Text style={styles.actionSubtitle}>Manage tables</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="bar-chart-outline" size={24} color="#FFFFFF" />
            <Text style={styles.actionTitle}>Reports</Text>
            <Text style={styles.actionSubtitle}>Daily summary</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.ordersList}>
          <RecentOrder orderId="1024" table="Table 5" items={3} amount="₹280" status="preparing" time="2 min ago" />
          <RecentOrder orderId="1023" table="Table 2" items={2} amount="₹150" status="ready" time="5 min ago" />
          <RecentOrder orderId="1022" table="Table 8" items={4} amount="₹420" status="served" time="8 min ago" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
    marginBottom: height * 0.015,
  },
  viewAllText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    fontWeight: '500',
  },
  // Stats Cards
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: (width - width * 0.12) / 2,
    backgroundColor: '#F8F8F8',
    padding: width * 0.04,
    borderRadius: 12,
    marginBottom: height * 0.015,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statsTitle: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
    marginBottom: height * 0.005,
    fontWeight: '500',
  },
  statsValue: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    marginBottom: height * 0.002,
  },
  statsSubtitle: {
    fontSize: responsiveFontSize(10),
    color: '#888888',
    fontWeight: '400',
  },
  // Action Cards
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - width * 0.12) / 2,
    backgroundColor: '#000000',
    padding: width * 0.04,
    borderRadius: 12,
    marginBottom: height * 0.015,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height * 0.1,
  },
  actionTitle: {
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: height * 0.005,
    textAlign: 'center',
    marginTop: height * 0.008,
  },
  actionSubtitle: {
    fontSize: responsiveFontSize(11),
    color: '#CCCCCC',
    fontWeight: '400',
    textAlign: 'center',
  },
  // Orders
  ordersList: {
    gap: height * 0.015,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: width * 0.04,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
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
    color: '#000000',
    marginBottom: height * 0.003,
  },
  orderDetails: {
    fontSize: responsiveFontSize(13),
    color: '#333333',
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
    color: '#000000',
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
});