import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const { width, height } = Dimensions.get('window');

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

interface ProfileScreenProps {
  onBack?: () => void;
  userEmail?: string;
  onLogout?: () => void;
}

interface EmployeeData {
  name: string;
  username: string;
  email: string;
  role: string;
  img?: string;
  empid: string;
  resname: string;
  joinDate: string;
  shift: string;
  createdAt?: string;
}

export default function ProfileScreen({ onBack, userEmail, onLogout }: ProfileScreenProps) {
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<EmployeeData>>({});
  const [message, setMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token || !userEmail) {
        setMessage({ type: 'error', text: 'Authentication required' });
        setLoading(false);
        return;
      }

      const response = await api.getEmployeeProfile(userEmail, token);
      setLoading(false);
      if (response?.success && response.data) {
        setEmployee(response.data);
        setEditData(response.data);
      } else {
        setMessage({ type: 'error', text: response?.message || 'Failed to load profile' });
      }
    } catch (err: any) {
      setLoading(false);
      setMessage({ type: 'error', text: err?.message || 'Network error' });
    }
  };

  const handleSave = async () => {
    if (!editData || !employee) return;
    
    setSaving(true);
    setMessage(null);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required' });
        setSaving(false);
        return;
      }

      const response = await api.updateEmployeeProfile(editData, token);
      setSaving(false);
      if (response?.success) {
        setEmployee({ ...employee, ...editData });
        setEditing(false);
        setMessage({ type: 'success', text: response.message || 'Profile updated successfully' });
      } else {
        setMessage({ type: 'error', text: response?.message || 'Failed to update profile' });
      }
    } catch (err: any) {
      setSaving(false);
      setMessage({ type: 'error', text: err?.message || 'Network error while saving' });
    }
  };

  const handleCancel = () => {
    setEditData(employee || {});
    setEditing(false);
    setMessage(null);
  };

  if (loading) {
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
              <Text style={styles.subtitleText}>Loading...</Text>
            </View>
            <View style={styles.menuButton} />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!employee) {
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
              <Text style={styles.subtitleText}>Error</Text>
            </View>
            <View style={styles.menuButton} />
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchEmployeeData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setEditing(!editing)}
            disabled={saving}
          >
            <Ionicons name={editing ? "close" : "create-outline"} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {message && (
          <View style={styles.section}>
            <View style={[styles.messageContainer, message.type === 'error' ? styles.messageError : message.type === 'success' ? styles.messageSuccess : styles.messageInfo]}>
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color="#2C2C2C" />
            </View>
            <View style={styles.profileInfo}>
              {editing ? (
                <TextInput
                  style={styles.editInput}
                  value={editData.name || ''}
                  onChangeText={(text) => setEditData({ ...editData, name: text })}
                  placeholder="Name"
                />
              ) : (
                <Text style={styles.userName}>{employee.name}</Text>
              )}
              <Text style={styles.userRole}>{employee.role} • {employee.empid}</Text>
              <Text style={styles.userEmail}>{employee.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Restaurant</Text>
              {editing ? (
                <TextInput
                  style={styles.editInput}
                  value={editData.resname || ''}
                  onChangeText={(text) => setEditData({ ...editData, resname: text })}
                  placeholder="Restaurant Name"
                />
              ) : (
                <Text style={styles.detailValue}>{employee.resname}</Text>
              )}
            </View>
            <View style={styles.divider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Shift</Text>
              {editing ? (
                <TextInput
                  style={styles.editInput}
                  value={editData.shift || ''}
                  onChangeText={(text) => setEditData({ ...editData, shift: text })}
                  placeholder="Shift"
                />
              ) : (
                <Text style={styles.detailValue}>{employee.shift}</Text>
              )}
            </View>
            <View style={styles.divider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Join Date</Text>
              <Text style={styles.detailValue}>
                {employee.createdAt 
                  ? new Date(employee.createdAt).toLocaleDateString()
                  : employee.joinDate 
                    ? new Date(employee.joinDate).toLocaleDateString()
                    : 'Not available'
                }
              </Text>
            </View>
          </View>
        </View>

        {editing && (
          <View style={styles.section}>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]} 
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton, saving && styles.disabledButton]} 
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutCard} 
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <View style={styles.logoutContent}>
              <Ionicons name="log-out-outline" size={24} color="#D32F2F" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </View>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  loadingText: {
    fontSize: responsiveFontSize(16),
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  errorText: {
    fontSize: responsiveFontSize(16),
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  retryButton: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.015,
    borderRadius: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
  },
  messageContainer: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.012,
    borderRadius: 10,
    borderWidth: 1,
  },
  messageText: {
    fontSize: responsiveFontSize(13),
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
  editInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.01,
    fontSize: responsiveFontSize(14),
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: width * 0.03,
  },
  actionButton: {
    flex: 1,
    paddingVertical: height * 0.015,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  cancelButtonText: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2C2C2C',
  },
  saveButtonText: {
    fontSize: responsiveFontSize(14),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  logoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFF5F5',
  },
  logoutButtonText: {
    fontSize: responsiveFontSize(16),
    color: '#D32F2F',
    fontWeight: '600',
    marginLeft: 12,
  },
});
