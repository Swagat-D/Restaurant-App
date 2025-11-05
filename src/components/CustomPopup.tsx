import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface CustomPopupProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: string;
  iconColor?: string;
  buttons?: {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
}

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

export default function CustomPopup({
  visible,
  onClose,
  title,
  message,
  icon = 'information-circle-outline',
  iconColor = '#2C2C2C',
  buttons = [{ text: 'OK', onPress: onClose, style: 'default' }]
}: CustomPopupProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={48} color={iconColor} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'cancel' && styles.cancelButton,
                  button.style === 'destructive' && styles.destructiveButton,
                  buttons.length === 1 ? styles.singleButton : styles.multiButton
                ]}
                onPress={button.onPress}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.buttonText,
                  button.style === 'cancel' && styles.cancelButtonText,
                  button.style === 'destructive' && styles.destructiveButtonText,
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  popupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: width * 0.06,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
    maxWidth: width * 0.85,
    minWidth: width * 0.75,
  },
  iconContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#2C2C2C',
    textAlign: 'center',
    marginBottom: height * 0.015,
  },
  message: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    textAlign: 'center',
    lineHeight: responsiveFontSize(20),
    marginBottom: height * 0.025,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: width * 0.03,
    width: '100%',
  },
  button: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.06,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
  },
  singleButton: {
    flex: 1,
  },
  multiButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  destructiveButton: {
    backgroundColor: '#D32F2F',
  },
  buttonText: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#666666',
  },
  destructiveButtonText: {
    color: '#FFFFFF',
  },
});