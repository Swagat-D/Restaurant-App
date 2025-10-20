import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface StatItemProps {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

const StatItem = ({ label, value, change, isPositive }: StatItemProps) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {change && (
      <Text style={[
        styles.statChange,
        isPositive ? styles.statChangePositive : styles.statChangeNegative
      ]}>
        {change}
      </Text>
    )}
  </View>
);

export default function AnalyticsScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Performance</Text>
        <View style={styles.statsGrid}>
          <StatItem label="Total Sales" value="₹15,240" change="+12%" isPositive={true} />
          <StatItem label="Orders" value="48" change="+8%" isPositive={true} />
          <StatItem label="Avg Order" value="₹317" change="-2%" isPositive={false} />
          <StatItem label="Tables Served" value="32" change="+15%" isPositive={true} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Overview</Text>
        <View style={styles.weeklyStats}>
          <View style={styles.weekStat}>
            <Text style={styles.weekDay}>Mon</Text>
            <View style={[styles.bar, { height: height * 0.05 }]} />
            <Text style={styles.weekValue}>₹8.2k</Text>
          </View>
          <View style={styles.weekStat}>
            <Text style={styles.weekDay}>Tue</Text>
            <View style={[styles.bar, { height: height * 0.07 }]} />
            <Text style={styles.weekValue}>₹11.5k</Text>
          </View>
          <View style={styles.weekStat}>
            <Text style={styles.weekDay}>Wed</Text>
            <View style={[styles.bar, { height: height * 0.06 }]} />
            <Text style={styles.weekValue}>₹9.8k</Text>
          </View>
          <View style={styles.weekStat}>
            <Text style={styles.weekDay}>Thu</Text>
            <View style={[styles.bar, { height: height * 0.08 }]} />
            <Text style={styles.weekValue}>₹13.2k</Text>
          </View>
          <View style={styles.weekStat}>
            <Text style={styles.weekDay}>Fri</Text>
            <View style={[styles.bar, { height: height * 0.09 }]} />
            <Text style={styles.weekValue}>₹15.6k</Text>
          </View>
          <View style={styles.weekStat}>
            <Text style={styles.weekDay}>Sat</Text>
            <View style={[styles.bar, { height: height * 0.1 }]} />
            <Text style={styles.weekValue}>₹18.3k</Text>
          </View>
          <View style={styles.weekStat}>
            <Text style={styles.weekDay}>Sun</Text>
            <View style={[styles.bar, { height: height * 0.04 }]} />
            <Text style={styles.weekValue}>₹7.1k</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Performing Items</Text>
        <View style={styles.topItems}>
          <View style={styles.topItem}>
            <Text style={styles.topItemName}>Butter Chicken</Text>
            <Text style={styles.topItemSales}>₹2,880 (18 orders)</Text>
          </View>
          <View style={styles.topItem}>
            <Text style={styles.topItemName}>Biryani</Text>
            <Text style={styles.topItemSales}>₹2,000 (10 orders)</Text>
          </View>
          <View style={styles.topItem}>
            <Text style={styles.topItemName}>Dal Makhani</Text>
            <Text style={styles.topItemSales}>₹1,680 (14 orders)</Text>
          </View>
          <View style={styles.topItem}>
            <Text style={styles.topItemName}>Paneer Tikka</Text>
            <Text style={styles.topItemSales}>₹1,440 (9 orders)</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Insights</Text>
        <View style={styles.insights}>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Peak Hours</Text>
            <Text style={styles.insightValue}>7:30 PM - 9:00 PM</Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Avg Table Turnover</Text>
            <Text style={styles.insightValue}>45 minutes</Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Customer Rating</Text>
            <Text style={styles.insightValue}>4.6/5.0</Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>Repeat Customers</Text>
            <Text style={styles.insightValue}>68%</Text>
          </View>
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
    marginBottom: height * 0.02,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: width * 0.03,
  },
  statItem: {
    backgroundColor: '#F8F8F8',
    padding: width * 0.04,
    borderRadius: 12,
    width: (width - width * 0.14) / 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statValue: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: height * 0.005,
  },
  statLabel: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
    marginBottom: height * 0.003,
  },
  statChange: {
    fontSize: responsiveFontSize(11),
    fontWeight: '600',
  },
  statChangePositive: {
    color: '#2D7D2D',
  },
  statChangeNegative: {
    color: '#D73A2A',
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: '#F8F8F8',
    padding: width * 0.04,
    borderRadius: 12,
    height: height * 0.18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  weekStat: {
    alignItems: 'center',
    flex: 1,
  },
  weekDay: {
    fontSize: responsiveFontSize(11),
    color: '#666666',
    marginBottom: height * 0.01,
  },
  bar: {
    backgroundColor: '#000000',
    width: width * 0.02,
    borderRadius: 2,
    marginBottom: height * 0.01,
  },
  weekValue: {
    fontSize: responsiveFontSize(10),
    color: '#333333',
    fontWeight: '500',
  },
  topItems: {
    gap: height * 0.01,
  },
  topItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    padding: width * 0.04,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  topItemName: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: '#000000',
  },
  topItemSales: {
    fontSize: responsiveFontSize(13),
    color: '#666666',
  },
  insights: {
    gap: height * 0.015,
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    padding: width * 0.04,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  insightLabel: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
  },
  insightValue: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: '#000000',
  },
});