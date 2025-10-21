import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';

const { width, height } = Dimensions.get('window');

type EmployeeRole = 'waiter' | 'kitchen_staff';

interface EmployeeData {
  name: string;
  email: string;
  employeeId: string;
  role: EmployeeRole;
  restaurantName: string;
  shift: string;
  joinDate: string;
  isClockIn: boolean;
}

interface AttendanceRecord {
  date: string;
  clockIn: string;
  clockOut: string;
  hoursWorked: number;
  status: 'present' | 'late' | 'absent';
}

interface LeaveRequest {
  id: string;
  type: 'sick' | 'personal' | 'vacation';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

export default function ProfileScreen() {
  const [employeeData] = useState<EmployeeData>({
    name: 'Swagat Kumar',
    email: 'swagat@restaurant.com',
    employeeId: 'EMP001',
    role: 'waiter',
    restaurantName: 'Taste of India',
    shift: 'Morning Shift (9 AM - 6 PM)',
    joinDate: '15 Jan 2024',
    isClockIn: false,
  });

  const [isClockIn, setIsClockIn] = useState(employeeData.isClockIn);
  
  const [recentAttendance] = useState<AttendanceRecord[]>([
    { date: '20 Oct 2025', clockIn: '9:00 AM', clockOut: '6:00 PM', hoursWorked: 8.5, status: 'present' },
    { date: '19 Oct 2025', clockIn: '9:15 AM', clockOut: '6:05 PM', hoursWorked: 8.2, status: 'late' },
    { date: '18 Oct 2025', clockIn: '8:55 AM', clockOut: '6:00 PM', hoursWorked: 8.8, status: 'present' },
  ]);

  const [leaveRequests] = useState<LeaveRequest[]>([
    { id: '1', type: 'sick', startDate: '25 Oct 2025', endDate: '26 Oct 2025', reason: 'Fever', status: 'pending' },
    { id: '2', type: 'vacation', startDate: '15 Nov 2025', endDate: '17 Nov 2025', reason: 'Family function', status: 'approved' },
  ]);

  const handleClockInOut = () => {
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    if (!isClockIn) {
      Alert.alert(
        'Clock In',
        `Clocked in at ${currentTime}`,
        [{ text: 'OK' }]
      );
      setIsClockIn(true);
    } else {
      Alert.alert(
        'Clock Out',
        `Clocked out at ${currentTime}`,
        [{ text: 'OK' }]
      );
      setIsClockIn(false);
    }
  };

  const handleApplyLeave = () => {
    Alert.alert(
      'Apply for Leave',
      'Leave application form would open here',
      [{ text: 'OK' }]
    );
  };

  const handleViewSchedule = () => {
    Alert.alert(
      'Work Schedule',
      `Your schedule: ${employeeData.shift}`,
      [{ text: 'OK' }]
    );
  };

  const handleTaskUpdate = () => {
    const taskType = employeeData.role === 'waiter' ? 'table service' : 'kitchen orders';
    Alert.alert(
      'Task Update',
      `Update ${taskType} status`,
      [{ text: 'OK' }]
    );
  };

  const renderWaiterFeatures = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Waiter Functions</Text>
      <View style={styles.featureGrid}>
        <TouchableOpacity style={styles.featureCard} onPress={handleTaskUpdate}>
          <Text style={styles.featureIcon}>🍽️</Text>
          <Text style={styles.featureTitle}>Table Service</Text>
          <Text style={styles.featureSubtitle}>Update table status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureIcon}>📋</Text>
          <Text style={styles.featureTitle}>Take Orders</Text>
          <Text style={styles.featureSubtitle}>New customer orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureIcon}>💳</Text>
          <Text style={styles.featureTitle}>Process Payment</Text>
          <Text style={styles.featureSubtitle}>Handle billing</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureIcon}>🔔</Text>
          <Text style={styles.featureTitle}>Customer Requests</Text>
          <Text style={styles.featureSubtitle}>Handle special requests</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderKitchenFeatures = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Kitchen Functions</Text>
      <View style={styles.featureGrid}>
        <TouchableOpacity style={styles.featureCard} onPress={handleTaskUpdate}>
          <Text style={styles.featureIcon}>👨‍🍳</Text>
          <Text style={styles.featureTitle}>Order Queue</Text>
          <Text style={styles.featureSubtitle}>View pending orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureIcon}>✅</Text>
          <Text style={styles.featureTitle}>Mark Ready</Text>
          <Text style={styles.featureSubtitle}>Complete orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureIcon}>📦</Text>
          <Text style={styles.featureTitle}>Inventory</Text>
          <Text style={styles.featureSubtitle}>Check ingredients</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureCard}>
          <Text style={styles.featureIcon}>⏰</Text>
          <Text style={styles.featureTitle}>Prep Tasks</Text>
          <Text style={styles.featureSubtitle}>Daily preparations</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{employeeData.name.split(' ').map(n => n[0]).join('')}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.employeeName}>{employeeData.name}</Text>
          <Text style={styles.employeeRole}>{employeeData.role.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.employeeId}>ID: {employeeData.employeeId}</Text>
        </View>
        <View style={[styles.statusBadge, isClockIn ? styles.clockedIn : styles.clockedOut]}>
          <Text style={[styles.statusText, isClockIn ? styles.clockedInText : styles.clockedOutText]}>
            {isClockIn ? 'CLOCKED IN' : 'CLOCKED OUT'}
          </Text>
        </View>
      </View>

      {/* Employee Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Employee Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{employeeData.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Restaurant</Text>
            <Text style={styles.infoValue}>{employeeData.restaurantName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Shift</Text>
            <Text style={styles.infoValue}>{employeeData.shift}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Join Date</Text>
            <Text style={styles.infoValue}>{employeeData.joinDate}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, isClockIn ? styles.clockOutCard : styles.clockInCard]} 
            onPress={handleClockInOut}
          >
            <Text style={styles.actionIcon}>{isClockIn ? '⏰' : '▶️'}</Text>
            <Text style={[styles.actionTitle, { color: '#FFFFFF' }]}>
              {isClockIn ? 'Clock Out' : 'Clock In'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={handleApplyLeave}>
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionTitle}>Apply Leave</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={handleViewSchedule}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionTitle}>View Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>💰</Text>
            <Text style={styles.actionTitle}>Payslip</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Role-based Features */}
      {employeeData.role === 'waiter' ? renderWaiterFeatures() : renderKitchenFeatures()}

      {/* Recent Attendance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Attendance</Text>
        <View style={styles.attendanceList}>
          {recentAttendance.map((record, index) => (
            <View key={index} style={styles.attendanceItem}>
              <View style={styles.attendanceLeft}>
                <Text style={styles.attendanceDate}>{record.date}</Text>
                <Text style={styles.attendanceTime}>{record.clockIn} - {record.clockOut}</Text>
              </View>
              <View style={styles.attendanceRight}>
                <Text style={styles.hoursWorked}>{record.hoursWorked}h</Text>
                <View style={[
                  styles.attendanceStatus,
                  record.status === 'present' && styles.statusPresent,
                  record.status === 'late' && styles.statusLate,
                ]}>
                  <Text style={[
                    styles.attendanceStatusText,
                    record.status === 'present' && styles.statusPresentText,
                    record.status === 'late' && styles.statusLateText,
                  ]}>
                    {record.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Leave Requests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leave Requests</Text>
        <View style={styles.leaveList}>
          {leaveRequests.map((leave) => (
            <View key={leave.id} style={styles.leaveItem}>
              <View style={styles.leaveLeft}>
                <Text style={styles.leaveType}>{leave.type.toUpperCase()}</Text>
                <Text style={styles.leaveDates}>{leave.startDate} - {leave.endDate}</Text>
                <Text style={styles.leaveReason}>{leave.reason}</Text>
              </View>
              <View style={[
                styles.leaveStatus,
                leave.status === 'approved' && styles.statusApproved,
                leave.status === 'pending' && styles.statusPending,
                leave.status === 'rejected' && styles.statusRejected,
              ]}>
                <Text style={[
                  styles.leaveStatusText,
                  leave.status === 'approved' && styles.statusApprovedText,
                  leave.status === 'pending' && styles.statusPendingText,
                  leave.status === 'rejected' && styles.statusRejectedText,
                ]}>
                  {leave.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileHeader: {
    backgroundColor: '#F8F8F8',
    padding: width * 0.05,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.04,
  },
  avatarText: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: height * 0.005,
  },
  employeeRole: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    marginBottom: height * 0.003,
  },
  employeeId: {
    fontSize: responsiveFontSize(12),
    color: '#888888',
  },
  statusBadge: {
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.008,
    borderRadius: 6,
  },
  clockedIn: {
    backgroundColor: '#E8F5E8',
  },
  clockedOut: {
    backgroundColor: '#FFE8E8',
  },
  statusText: {
    fontSize: responsiveFontSize(10),
    fontWeight: 'bold',
  },
  clockedInText: {
    color: '#2D7D2D',
  },
  clockedOutText: {
    color: '#D73A2A',
  },
  section: {
    padding: width * 0.05,
    marginBottom: height * 0.01,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: height * 0.02,
  },
  infoGrid: {
    gap: height * 0.015,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: width * 0.04,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: responsiveFontSize(14),
    color: '#666666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: responsiveFontSize(14),
    color: '#000000',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - width * 0.15) / 2,
    backgroundColor: '#000000',
    padding: width * 0.04,
    borderRadius: 12,
    marginBottom: height * 0.015,
    alignItems: 'center',
    minHeight: height * 0.1,
    justifyContent: 'center',
  },
  clockInCard: {
    backgroundColor: '#2D7D2D',
  },
  clockOutCard: {
    backgroundColor: '#D73A2A',
  },
  actionIcon: {
    fontSize: responsiveFontSize(24),
    marginBottom: height * 0.008,
  },
  actionTitle: {
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - width * 0.15) / 2,
    backgroundColor: '#F8F8F8',
    padding: width * 0.04,
    borderRadius: 12,
    marginBottom: height * 0.015,
    alignItems: 'center',
    minHeight: height * 0.1,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  featureIcon: {
    fontSize: responsiveFontSize(24),
    marginBottom: height * 0.008,
  },
  featureTitle: {
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: height * 0.003,
  },
  featureSubtitle: {
    fontSize: responsiveFontSize(11),
    color: '#666666',
    textAlign: 'center',
  },
  attendanceList: {
    gap: height * 0.012,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: width * 0.04,
    borderRadius: 12,
  },
  attendanceLeft: {
    flex: 1,
  },
  attendanceDate: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: '#000000',
    marginBottom: height * 0.003,
  },
  attendanceTime: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
  },
  attendanceRight: {
    alignItems: 'flex-end',
  },
  hoursWorked: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: height * 0.005,
  },
  attendanceStatus: {
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.003,
    borderRadius: 4,
  },
  statusPresent: {
    backgroundColor: '#E8F5E8',
  },
  statusLate: {
    backgroundColor: '#FFF3CD',
  },
  attendanceStatusText: {
    fontSize: responsiveFontSize(10),
    fontWeight: 'bold',
  },
  statusPresentText: {
    color: '#2D7D2D',
  },
  statusLateText: {
    color: '#856404',
  },
  leaveList: {
    gap: height * 0.012,
  },
  leaveItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: width * 0.04,
    borderRadius: 12,
  },
  leaveLeft: {
    flex: 1,
  },
  leaveType: {
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: height * 0.003,
  },
  leaveDates: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
    marginBottom: height * 0.002,
  },
  leaveReason: {
    fontSize: responsiveFontSize(11),
    color: '#888888',
  },
  leaveStatus: {
    paddingHorizontal: width * 0.025,
    paddingVertical: height * 0.005,
    borderRadius: 6,
    minWidth: width * 0.2,
    alignItems: 'center',
  },
  statusApproved: {
    backgroundColor: '#E8F5E8',
  },
  statusPending: {
    backgroundColor: '#FFF3CD',
  },
  statusRejected: {
    backgroundColor: '#FFE8E8',
  },
  leaveStatusText: {
    fontSize: responsiveFontSize(10),
    fontWeight: 'bold',
  },
  statusApprovedText: {
    color: '#2D7D2D',
  },
  statusPendingText: {
    color: '#856404',
  },
  statusRejectedText: {
    color: '#D73A2A',
  },
});