import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

interface LoginScreenProps {
  onEmailVerify: (email: string) => void;
  // onOTPVerify now receives token string when verification succeeds
  onOTPVerify: (token: string) => void;
}

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

export default function LoginScreen({ onEmailVerify, onOTPVerify }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
  const [hasOTPError, setHasOTPError] = useState(false); // Track if OTP verification failed
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  
  const isOTPComplete = otp.every(digit => digit !== '');
  const isEmailValid = email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleOTPSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) return;

    setIsVerifyingOTP(true);
    setHasOTPError(false); // Reset error state before verification
    try {
      // call verify-otp endpoint
      const response = await api.verifyOtp(email.trim(), otpString);
      setIsVerifyingOTP(false);
      if (response?.success) {
        const token = response.token || response.data?.token || '';
        if (token) {
          // store token and notify app
          await AsyncStorage.setItem('auth_token', token);
          setMessage({ type: 'success', text: response.message || 'Successfully signed in' });
          onOTPVerify(token);
        } else {
          setHasOTPError(true); // Set error state
          setMessage({ type: 'error', text: response.message || 'Authentication failed' });
        }
      } else {
        setHasOTPError(true); // Set error state
        setMessage({ type: 'error', text: response?.message || 'Invalid code or user not registered' });
      }
    } catch (err: any) {
      setIsVerifyingOTP(false);
      setHasOTPError(true); // Set error state
      setMessage({ type: 'error', text: err?.message || 'Network error while verifying code' });
    }
  };

  useEffect(() => {
    // Only auto-submit if OTP is complete, showing OTP screen, not verifying, and no previous error
    if (isOTPComplete && showOTP && !isVerifyingOTP && !hasOTPError) {
      handleOTPSubmit();
    }
  }, [isOTPComplete, showOTP, isVerifyingOTP, hasOTPError]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOTP && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOTP, timer]);

  const handleEmailSubmit = async () => {
    if (!email.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid business email address' });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const response = await api.sendOtp(email.trim());
      setIsLoading(false);
      if (response?.success) {
        setShowOTP(true);
        setTimer(30);
        // inform parent about email so app can display user name
        onEmailVerify(email.trim());
        setMessage({ type: 'info', text: response.message || 'Verification code sent. Check your email.' });
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      } else {
        setMessage({ type: 'error', text: response?.message || 'You are not registered as an employee. Please contact your employer.' });
      }
    } catch (err: any) {
      setIsLoading(false);
      setMessage({ type: 'error', text: err?.message || 'Network error while sending code' });
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    // Clear error state when user starts editing OTP after an error
    if (hasOTPError) {
      setHasOTPError(false);
      setMessage(null);
    }

    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const newOtp = value.split('');
      setOtp(newOtp);
      setTimeout(() => {
        inputRefs.current[5]?.focus();
      }, 100);
      return;
    }
    
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = () => {
    // call send-otp again
    setMessage(null);
    setOtp(['', '', '', '', '', '']);
    setHasOTPError(false); // Reset error state
    setIsLoading(true);
    api.sendOtp(email.trim())
      .then((response) => {
        setIsLoading(false);
        if (response?.success) {
          setTimer(30);
          setMessage({ type: 'info', text: response.message || 'Verification code resent.' });
          setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } else {
          setMessage({ type: 'error', text: response?.message || 'Unable to resend code' });
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setMessage({ type: 'error', text: err?.message || 'Network error while resending code' });
      });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Buddy !</Text>
            <Text style={styles.subtitle}>
              {showOTP ? 'Let\'s get back to work 😉' : 'Give us a moment to verify your identity'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[styles.input, showOTP && styles.inputDisabled]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#666666"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!showOTP && !isLoading}
              />
            </View>

            {showOTP && (
              <View style={styles.otpContainer}>
                <Text style={styles.otpLabel}>
                  Verification Code
                  <Text style={styles.otpHint}> (sent to {email})</Text>
                </Text>
                <View style={styles.otpInputContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => { inputRefs.current[index] = ref; }}
                      style={[
                        styles.otpInput,
                        digit && styles.otpInputFilled,
                      ]}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                      keyboardType="numeric"
                      maxLength={6} // Allow paste of 6 digits
                      textAlign="center"
                      editable={!isVerifyingOTP} // Allow editing when not verifying (including after errors)
                    />
                  ))}
                </View>
                
                <View style={styles.resendContainer}>
                  {timer > 0 ? (
                    <Text style={styles.timerText}>
                      Resend code in {timer}s
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOTP} activeOpacity={0.7}>
                      <Text style={styles.resendText}>Resend Code</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {message && (
              <View style={[styles.messageContainer, message.type === 'error' ? styles.messageError : message.type === 'success' ? styles.messageSuccess : styles.messageInfo]}>
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            )}

            {(!showOTP || !isOTPComplete || hasOTPError) && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  (!isEmailValid && !showOTP) || 
                  (showOTP && !isOTPComplete && !hasOTPError) || 
                  isLoading || isVerifyingOTP ? styles.actionButtonDisabled : null
                ]}
                onPress={showOTP ? handleOTPSubmit : handleEmailSubmit}
                disabled={
                  (!isEmailValid && !showOTP) || 
                  (showOTP && !isOTPComplete && !hasOTPError) || 
                  isLoading || isVerifyingOTP
                }
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>
                  {isLoading ? 'Sending Code...' : 
                   isVerifyingOTP ? 'Verifying...' :
                   showOTP ? 'Let\'s Go!' : 'Send Verification Code'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Show verifying message when OTP is complete and no error */}
            {showOTP && isOTPComplete && !hasOTPError && (
              <View style={styles.verifyingContainer}>
                <Text style={styles.verifyingText}>
                  {isVerifyingOTP ? 'Verifying your code...' : 'Code verified! ✓'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {showOTP 
                ? 'You can paste the entire 6-digit code at once or type digit by digit' 
                : 'We\'ll send you a secure verification code to get you back to business'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.07,
    paddingVertical: height * 0.03,
    justifyContent: 'center',
    minHeight: height * 0.85,
  },
  header: {
    marginBottom: height * 0.04,
    alignItems: 'center',
  },
  title: {
    fontSize: responsiveFontSize(26),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: height * 0.008,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: responsiveFontSize(14),
    color: '#555555',
    textAlign: 'center',
    lineHeight: responsiveFontSize(20),
  },
  formContainer: {
    marginBottom: height * 0.03,
  },
  inputContainer: {
    marginBottom: height * 0.025,
    position: 'relative',
  },
  inputLabel: {
    fontSize: responsiveFontSize(13),
    fontWeight: '600',
    color: '#000000',
    marginBottom: height * 0.008,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.016,
    fontSize: responsiveFontSize(15),
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputDisabled: {
    backgroundColor: '#F0F0F0',
    borderColor: '#D0D0D0',
    opacity: 0.7,
  },
  otpContainer: {
    marginBottom: height * 0.02,
  },
  otpLabel: {
    fontSize: responsiveFontSize(13),
    fontWeight: '600',
    color: '#000000',
    marginBottom: height * 0.015,
    letterSpacing: 0.2,
  },
  otpHint: {
    fontSize: responsiveFontSize(11),
    color: '#666666',
    fontWeight: '400',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.015,
  },
  otpInput: {
    width: width * 0.11,
    height: width * 0.11,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  otpInputFilled: {
    backgroundColor: '#EEEEEE',
    borderColor: '#CCCCCC',
    shadowOpacity: 0.08,
    elevation: 3,
  },
  resendContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: responsiveFontSize(12),
    color: '#888888',
  },
  resendText: {
    fontSize: responsiveFontSize(12),
    color: '#000000',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  actionButton: {
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingVertical: height * 0.018,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    marginTop: height * 0.015,
  },
  actionButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    fontSize: responsiveFontSize(15),
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    marginTop: height * 0.02,
  },
  footerText: {
    fontSize: responsiveFontSize(11),
    color: '#777777',
    textAlign: 'center',
    lineHeight: responsiveFontSize(16),
    paddingHorizontal: width * 0.08,
  },
  verifyingContainer: {
    padding: height * 0.02,
    alignItems: 'center',
  },
  verifyingText: {
    fontSize: responsiveFontSize(16),
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  messageContainer: {
    marginTop: height * 0.015,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.012,
    borderRadius: 10,
    alignItems: 'center',
  },
  messageText: {
    fontSize: responsiveFontSize(13),
    color: '#222',
    textAlign: 'center',
  },
  messageError: {
    backgroundColor: '#FFEAE9',
    borderColor: '#FFB8B0',
  },
  messageSuccess: {
    backgroundColor: '#E9FFEF',
    borderColor: '#B6F2C9',
  },
  messageInfo: {
    backgroundColor: '#F2F9FF',
    borderColor: '#CFE9FF',
  },
});