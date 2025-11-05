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

const { width, height } = Dimensions.get('window');

interface TabComponentProps {
  onTabChange?: (tabIndex: number) => void;
  onNewOrder?: () => void;
  onNavigateToTables?: () => void;
  currentTab?: number;
}

export default function TabComponent({ onTabChange, onNewOrder, onNavigateToTables, currentTab = 0 }: TabComponentProps) {
  const [activeTab, setActiveTab] = useState(currentTab);

  React.useEffect(() => {
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [currentTab]);

  const tabs = [
    { id: 0, title: 'Overview', iconActive: 'home', iconInactive: 'home-outline' },
    { id: 1, title: 'Orders', iconActive: 'receipt', iconInactive: 'receipt-outline' },
    { id: 2, title: 'Menu', iconActive: 'restaurant', iconInactive: 'restaurant-outline' },
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
        return <OverviewScreen onNewOrder={onNewOrder} onNavigateToTables={onNavigateToTables} />;
      case 1:
        return <OrdersScreen />;
      case 2:
        return <MenuScreen />;
      default:
        return <OverviewScreen onNewOrder={onNewOrder} onNavigateToTables={onNavigateToTables} />;
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
              size={activeTab === tab.id ? 24 : 22}
              color={activeTab === tab.id ? '#2C2C2C' : '#CCCCCC'}
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
    backgroundColor: '#2C2C2C',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
    marginTop: -10,
    
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.02,
    borderRadius: 16,
    minHeight: height * 0.055,
    marginBottom: 10,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    transform: [{ scale: 1.05 }],
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  tabLabel: {
    fontSize: responsiveFontSize(10),
    color: '#CCCCCC',
    marginTop: height * 0.005,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#2C2C2C',
    fontWeight: '700',
  },
});