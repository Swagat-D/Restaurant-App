import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import OverviewScreen from '../screens/OverviewScreen';
import OrdersScreen from '../screens/OrdersScreen';
import MenuScreen from '../screens/MenuScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

const { width, height } = Dimensions.get('window');

interface TabComponentProps {
  onTabChange?: (tabIndex: number) => void;
}

export default function TabComponent({ onTabChange }: TabComponentProps) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, title: 'Overview', iconActive: 'home', iconInactive: 'home-outline' },
    { id: 1, title: 'Orders', iconActive: 'receipt', iconInactive: 'receipt-outline' },
    { id: 2, title: 'Menu', iconActive: 'restaurant', iconInactive: 'restaurant-outline' },
    { id: 3, title: 'Analytics', iconActive: 'bar-chart', iconInactive: 'bar-chart-outline' },
  ] as const;

  const handleTabPress = (tabIndex: number) => {
    setActiveTab(tabIndex);
    if (onTabChange) {
      onTabChange(tabIndex);
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 0:
        return <OverviewScreen />;
      case 1:
        return <OrdersScreen />;
      case 2:
        return <MenuScreen />;
      case 3:
        return <AnalyticsScreen />;
      default:
        return <OverviewScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => handleTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === tab.id ? tab.iconActive : tab.iconInactive as any}
              size={24}
              color={activeTab === tab.id ? '#000000' : '#888888'}
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.id && styles.activeTabLabel
            ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.02,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    paddingBottom: height * 0.025,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.02,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#F8F8F8',
  },
  tabLabel: {
    fontSize: responsiveFontSize(11),
    color: '#888888',
    marginTop: height * 0.005,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#000000',
    fontWeight: '600',
  },
});