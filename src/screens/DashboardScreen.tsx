import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Navbar from '../components/Navbar';
import TabComponent from '../components/TabComponent';
import NewOrderScreen from './NewOrderScreen';

interface DashboardScreenProps {
  userEmail: string;
  onLogout: () => void;
}

export default function DashboardScreen({ userEmail, onLogout }: DashboardScreenProps) {
  const [showNewOrder, setShowNewOrder] = useState(false);

  const handleNewOrder = () => {
    setShowNewOrder(true);
  };

  const handleBackToDashboard = () => {
    setShowNewOrder(false);
  };

  if (showNewOrder) {
    return <NewOrderScreen onBack={handleBackToDashboard} />;
  }

  return (
    <View style={styles.container}>
      <Navbar 
        userEmail={userEmail} 
        onLogout={onLogout} 
        showProfile={true}
      />
      <TabComponent onNewOrder={handleNewOrder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});