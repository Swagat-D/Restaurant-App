import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';

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

  useEffect(() => {
    const initializeApp = async () => {
      try {
        
        // Show splash for 1.8 seconds then go to login
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

  const handleOTPVerify = async (otp: string) => {
    // In a real app, verify OTP with backend
    console.log('OTP verified:', otp);
    
    try {
      
      setAppState('dashboard');
    } catch (error) {
      console.log('Error saving login session:', error);
      setAppState('dashboard');
    }
  };

  const handleLogout = async () => {
    try {
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
      <View style={styles.container}>
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
      <LoginScreen 
        onEmailVerify={handleEmailVerify} 
        onOTPVerify={handleOTPVerify}
      />
    );
  }

  if (appState === 'dashboard') {
    return (
      <DashboardScreen 
        userEmail={userEmail}
        onLogout={handleLogout}
      />
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