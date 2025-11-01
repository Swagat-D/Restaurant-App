import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

interface ProfileScreenProps {
  onBack?: () => void;
}

export default function ProfileScreen({ onBack }: ProfileScreenProps) {
  const userData = {
    name: 'John Doe',
    email: 'john.doe@restaurant.com',
    employeeId: 'EMP001',
    role: 'Waiter',
    restaurantName: 'Delicious Restaurant',
    shift: 'Morning Shift (9 AM - 5 PM)',
    joinDate: 'January 15, 2024',
  };

  const profileOptions = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: 'person-outline',
      onPress: () => console.log('Edit Profile'),
    },
    {
      id: '2',
      title: 'Change Password',
      icon: 'lock-closed-outline',
      onPress: () => console.log('Change Password'),
    },
    {
      id: '3',
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => console.log('Notifications'),
    },
    {
      id: '4',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => console.log('Help & Support'),
    },
    {
      id: '5',
      title: 'Logout',
      icon: 'log-out-outline',
      onPress: () => console.log('Logout'),
      isLogout: true,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.greetingText}>Profile</Text>
            <Text style={styles.subtitleText}>Manage your account</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="menu-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color="#2C2C2C" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userData.name}</Text>
              <Text style={styles.userRole}>{userData.role} • {userData.employeeId}</Text>
              <Text style={styles.userEmail}>{userData.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Restaurant</Text>
              <Text style={styles.detailValue}>{userData.restaurantName}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Shift</Text>
              <Text style={styles.detailValue}>{userData.shift}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Join Date</Text>
              <Text style={styles.detailValue}>{userData.joinDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.optionsCard}>
            {profileOptions.map((option, index) => (
              <View key={option.id}>
                <TouchableOpacity 
                  style={[
                    styles.optionItem,
                    option.isLogout && styles.logoutOption
                  ]} 
                  onPress={option.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLeft}>
                    <Ionicons 
                      name={option.icon as any} 
                      size={20} 
                      color={option.isLogout ? '#D32F2F' : '#2C2C2C'} 
                    />
                    <Text style={[
                      styles.optionTitle,
                      option.isLogout && styles.logoutText
                    ]}>
                      {option.title}
                    </Text>
                  </View>
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={option.isLogout ? '#D32F2F' : '#CCCCCC'} 
                  />
                </TouchableOpacity>
                {index < profileOptions.length - 1 && !option.isLogout && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2C2C2C',
    paddingTop: height * 0.06,
    paddingBottom: height * 0.025,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: width * 0.05,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  greetingText: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: responsiveFontSize(14),
    color: '#E0E0E0',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: width * 0.05,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  userRole: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: responsiveFontSize(12),
    color: '#999999',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailItem: {
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: responsiveFontSize(12),
    color: '#999999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: responsiveFontSize(14),
    color: '#333333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  optionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: responsiveFontSize(14),
    color: '#333333',
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutOption: {
    backgroundColor: '#FFF5F5',
  },
  logoutText: {
    color: '#D32F2F',
  },
});
