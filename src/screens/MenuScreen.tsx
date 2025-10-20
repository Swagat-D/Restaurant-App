import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface MenuItemProps {
  name: string;
  price: string;
  status: 'available' | 'out-of-stock';
  orders?: number;
}

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

const MenuItem = ({ name, price, status, orders }: MenuItemProps) => (
  <View style={styles.menuItem}>
    <View style={styles.menuItemLeft}>
      <Text style={styles.menuItemName}>{name}</Text>
      <Text style={styles.menuItemPrice}>{price}</Text>
      {orders && <Text style={styles.menuItemOrders}>{orders} orders today</Text>}
    </View>
    <View style={[
      styles.statusBadge,
      status === 'available' ? styles.statusAvailable : styles.statusUnavailable
    ]}>
      <Text style={[
        styles.statusText,
        status === 'available' ? styles.statusTextAvailable : styles.statusTextUnavailable
      ]}>
        {status === 'available' ? 'Available' : 'Out of Stock'}
      </Text>
    </View>
  </View>
);

export default function MenuScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Items</Text>
        <View style={styles.menuList}>
          <MenuItem name="Butter Chicken" price="₹180" status="available" orders={8} />
          <MenuItem name="Dal Makhani" price="₹120" status="available" orders={6} />
          <MenuItem name="Paneer Tikka" price="₹160" status="out-of-stock" orders={4} />
          <MenuItem name="Naan" price="₹40" status="available" orders={12} />
          <MenuItem name="Biryani" price="₹200" status="available" orders={5} />
          <MenuItem name="Roti" price="₹25" status="available" orders={15} />
          <MenuItem name="Dal Tadka" price="₹100" status="available" orders={7} />
          <MenuItem name="Jeera Rice" price="₹80" status="available" orders={9} />
          <MenuItem name="Palak Paneer" price="₹140" status="out-of-stock" orders={3} />
          <MenuItem name="Chicken Curry" price="₹160" status="available" orders={6} />
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
  menuList: {
    gap: height * 0.015,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: width * 0.04,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  menuItemLeft: {
    flex: 1,
  },
  menuItemName: {
    fontSize: responsiveFontSize(15),
    fontWeight: '600',
    color: '#000000',
    marginBottom: height * 0.003,
  },
  menuItemPrice: {
    fontSize: responsiveFontSize(14),
    color: '#333333',
    fontWeight: '500',
    marginBottom: height * 0.002,
  },
  menuItemOrders: {
    fontSize: responsiveFontSize(11),
    color: '#666666',
    fontWeight: '400',
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
});