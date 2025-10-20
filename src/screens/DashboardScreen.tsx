import React from 'react';
import { View, StyleSheet } from 'react-native';
import Navbar from '../components/Navbar';
import TabComponent from '../components/TabComponent';

interface DashboardScreenProps {
  userEmail: string;
  onLogout: () => void;
}

export default function DashboardScreen({ userEmail, onLogout }: DashboardScreenProps) {
  return (
    <View style={styles.container}>
      <Navbar 
        userEmail={userEmail} 
        onLogout={onLogout} 
        showProfile={true}
      />
      <TabComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});