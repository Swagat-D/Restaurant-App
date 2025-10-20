import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

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

export default function OrdersScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Orders</Text>
        <View style={styles.ordersList}>
          <RecentOrder orderId="1024" table="Table 5" items={3} amount="₹280" status="preparing" time="2 min ago" />
          <RecentOrder orderId="1023" table="Table 2" items={2} amount="₹150" status="ready" time="5 min ago" />
          <RecentOrder orderId="1022" table="Table 8" items={4} amount="₹420" status="served" time="8 min ago" />
          <RecentOrder orderId="1021" table="Table 1" items={1} amount="₹95" status="served" time="12 min ago" />
          <RecentOrder orderId="1020" table="Table 7" items={5} amount="₹650" status="served" time="15 min ago" />
          <RecentOrder orderId="1019" table="Table 3" items={2} amount="₹240" status="served" time="18 min ago" />
          <RecentOrder orderId="1018" table="Table 6" items={4} amount="₹380" status="served" time="22 min ago" />
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
  sectionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: height * 0.015,
  },
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