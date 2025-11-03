import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { OrderProvider } from './src/context/OrderContext';
import { useNavigationHeight } from './src/hooks/useNavigationHeight';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './src/utils/api';

const { width, height } = Dimensions.get('window');

type AppState = 'splash' | 'login' | 'dashboard';

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

export default function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [userEmail, setUserEmail] = useState('');
  const appHeight = useNavigationHeight();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          try {
            const response = await api.verifyToken(token);
            if (response?.success) {
              const email = response.data?.email || response.email || response?.data?.employee?.email || '';
              setUserEmail(email);
              setAppState('dashboard');
              return;
            }
          } catch (err) {
            console.log('Token verify failed', err);
          }
        }

        setTimeout(() => {
          setAppState('login');
        }, 1800);
      } catch (error) {
        console.log('Error checking login session:', error);
        setTimeout(() => {
          setAppState('login');
        }, 1800);
      }
    };

    initializeApp();
  }, []);

  const handleEmailVerify = (email: string) => {
    setUserEmail(email);
  };

  const handleOTPVerify = async (token: string) => {
    console.log('Received auth token from login flow');
    try {
      const response = await api.verifyToken(token);
      if (response?.success) {
        const email = response.data?.email || response.email || response?.data?.employee?.email || '';
        if (email) setUserEmail(email);
      }
      setAppState('dashboard');
    } catch (error) {
      console.log('Error saving login session:', error);
      setAppState('dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      setUserEmail('');
      setAppState('login');
    } catch (error) {
      console.log('Error clearing login session:', error);
      setUserEmail('');
      setAppState('login');
    }
  };

  if (appState === 'splash') {
    return (
      <View style={[styles.container, { height: appHeight }]}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('./assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.appName}>Restaurant Manager</Text>
          
          <Text style={styles.tagline}>Streamline Your Restaurant Operations 🍽️</Text>
        </View>

        <View style={styles.buildingContainer}>
          <Image
            source={require('./assets/building.png')}
            style={styles.buildingImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.bottomContainer}>
          <Text style={styles.footerText}>
            Powered by <Text style={styles.brandText}>DevSomeware</Text>
          </Text>
          <Text style={styles.subFooter}>
            Built for Excellence. Trusted by Restaurants.
          </Text>
        </View>
      </View>
    );
  }

  if (appState === 'login') {
    return (
      <View style={[styles.container, { height: appHeight }]}>
        <LoginScreen 
          onEmailVerify={handleEmailVerify} 
          onOTPVerify={handleOTPVerify}
        />
      </View>
    );
  }

  if (appState === 'dashboard') {
    return (
      <OrderProvider>
        <DashboardScreen 
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      </OrderProvider>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%',
  },
  logoContainer: {
    width: width * 0.35, 
    height: width * 0.35, 
    justifyContent: 'center',
    marginBottom: -(height * 0.03),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: responsiveFontSize(28),
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: height * 0.01,
    letterSpacing: 0.5,
    paddingHorizontal: '10%',
  },
  tagline: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: '10%',
    lineHeight: responsiveFontSize(20),
  },
  bottomContainer: {
    paddingBottom: height * 0.05,
    alignItems: 'center',
    paddingHorizontal: '5%',
  },
  buildingContainer: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  buildingImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 16 / 6,
    borderRadius: 0,
  },
  footerText: {
    fontSize: responsiveFontSize(13),
    color: '#666666',
    textAlign: 'center',
    marginBottom: height * 0.01,
  },
  brandText: {
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subFooter: {
    fontSize: responsiveFontSize(11),
    color: '#999999',
    textAlign: 'center',
  },
});