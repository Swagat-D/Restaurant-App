import React, { useState, useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import Navbar from '../components/Navbar';
import TabComponent from '../components/TabComponent';
import NewOrderScreen from './NewOrderScreen';
import ProfileScreen from './ProfileScreen';
import TablesScreen from './TablesScreen';
import CustomPopup from '../components/CustomPopup';
import { useNavigationHeight } from '../hooks/useNavigationHeight';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

interface DashboardScreenProps {
  userEmail: string;
  onLogout: () => void;
}

export default function DashboardScreen({ userEmail, onLogout }: DashboardScreenProps) {
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTables, setShowTables] = useState(false);
  const [currentTab, setCurrentTab] = useState(0); // Track current tab
  const [userData, setUserData] = useState<{ name?: string; email?: string } | undefined>();
  const [showExitPopup, setShowExitPopup] = useState(false);
  const appHeight = useNavigationHeight();

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, [userEmail]);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token && userEmail) {
        const response = await api.getEmployeeProfile(userEmail, token);
        if (response?.success && response.data) {
          setUserData({
            name: response.data.name,
            email: response.data.email
          });
        }
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
    }
  };

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [showNewOrder, showProfile, showTables, currentTab]); // Include currentTab in dependencies

  const handleBackPress = () => {
    // If on any sub-screen, go back to dashboard
    if (showNewOrder) {
      setShowNewOrder(false);
      return true; // Prevent default back behavior
    }
    if (showProfile) {
      setShowProfile(false);
      return true; // Prevent default back behavior
    }
    if (showTables) {
      setShowTables(false);
      return true; // Prevent default back behavior
    }
    
    // If on main dashboard but not on Overview tab, go back to Overview tab
    if (currentTab !== 0) {
      setCurrentTab(0);
      return true; // Prevent default back behavior
    }
    
    // Only show exit confirmation if on main dashboard Overview tab
    setShowExitPopup(true);
    return true; // Prevent default back behavior
  };

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

  const handleNavigateToTables = () => {
    setShowTables(true);
  };

  const handleBackFromTables = () => {
    setShowTables(false);
  };

  const handleTabChange = (tabIndex: number) => {
    setCurrentTab(tabIndex);
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
        <ProfileScreen onBack={handleBackFromProfile} userEmail={userEmail} onLogout={onLogout} />
      </View>
    );
  }

  if (showTables) {
    return (
      <View style={[styles.container, { height: appHeight }]}>
        <TablesScreen 
          onBack={handleBackFromTables} 
          onNewOrder={(tableNumber: string) => {
            setShowTables(false);
            setShowNewOrder(true);
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: appHeight }]}>
      <Navbar 
        userEmail={userEmail} 
        userData={userData}
        onLogout={onLogout} 
        showProfile={true}
        onProfilePress={handleShowProfile}
      />
      <TabComponent 
        onNewOrder={handleNewOrder} 
        onNavigateToTables={handleNavigateToTables}
        onTabChange={handleTabChange}
        currentTab={currentTab}
      />

      {/* Exit Confirmation Popup */}
      <CustomPopup
        visible={showExitPopup}
        onClose={() => setShowExitPopup(false)}
        title="Exit App"
        message="Are you sure you want to exit the app?"
        icon="exit-outline"
        iconColor="#D32F2F"
        buttons={[
          {
            text: 'Cancel',
            onPress: () => setShowExitPopup(false),
            style: 'cancel'
          },
          {
            text: 'Exit',
            onPress: () => BackHandler.exitApp(),
            style: 'destructive'
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});