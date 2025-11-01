import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Navbar from '../components/Navbar';
import TabComponent from '../components/TabComponent';
import NewOrderScreen from './NewOrderScreen';
import ProfileScreen from './ProfileScreen';
import { useNavigationHeight } from '../hooks/useNavigationHeight';

interface DashboardScreenProps {
  userEmail: string;
  onLogout: () => void;
}

export default function DashboardScreen({ userEmail, onLogout }: DashboardScreenProps) {
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const appHeight = useNavigationHeight();

  const handleNewOrder = () => {
    setShowNewOrder(true);
  };

  const handleBackToDashboard = () => {
    setShowNewOrder(false);
  };

  const handleShowProfile = () => {
    setShowProfile(true);
  };

  const handleBackFromProfile = () => {
    setShowProfile(false);
  };

  if (showNewOrder) {
    return (
      <View style={[styles.container, { height: appHeight }]}>
        <NewOrderScreen onBack={handleBackToDashboard} />
      </View>
    );
  }

  if (showProfile) {
    return (
      <View style={[styles.container, { height: appHeight }]}>
        <ProfileScreen onBack={handleBackFromProfile} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: appHeight }]}>
      <Navbar 
        userEmail={userEmail} 
        onLogout={onLogout} 
        showProfile={true}
        onProfilePress={handleShowProfile}
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