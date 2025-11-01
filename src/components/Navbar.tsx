import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface NavbarProps {
  userEmail: string;
  onLogout: () => void;
  title?: string;
  showProfile?: boolean;
  onProfilePress?: () => void;
}

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const formatEmail = (email: string) => {
  const name = email.split('@')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export default function Navbar({ 
  userEmail, 
  onLogout, 
  title, 
  showProfile = true,
  onProfilePress 
}: NavbarProps) {
  const greeting = getGreeting();
  const userName = formatEmail(userEmail);

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.navbar}>
        <View style={styles.navbarContent}>
          <View style={styles.leftSection}>
            {title ? (
              <Text style={styles.titleText}>{title}</Text>
            ) : (
              <>
                <Text style={styles.greetingText}>{greeting},</Text>
                <Text style={styles.userNameText}>Swagat! </Text>
              </>
            )}
          </View>

          <View style={styles.rightSection}>
            {showProfile && (
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={handleProfilePress}
                activeOpacity={0.7}
              >
                <Ionicons name="person-outline" size={20} color="#666666" />
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={onLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.borderGradient} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: '#FFFFFF',
    paddingTop: height * 0.05,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
    zIndex: 1000,
    marginBottom: 10,
  },
  navbarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.025,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.03,
  },
  greetingText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    fontWeight: '400',
    marginBottom: 2,
  },
  userNameText: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  titleText: {
    fontSize: responsiveFontSize(22),
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  iconButton: {
    width: width * 0.11,
    height: width * 0.11,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.012,
    borderRadius: 16,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    gap: width * 0.02,
  },

  logoutText: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  borderGradient: {
    height: 0,
  },
});