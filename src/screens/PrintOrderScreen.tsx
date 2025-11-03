import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../context/OrderContext';

const { width, height } = Dimensions.get('window');

interface PrintOrderScreenProps {
  order: Order;
  onBack: () => void;
  onPrintComplete: () => void;
}

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

export default function PrintOrderScreen({ order, onBack, onPrintComplete }: PrintOrderScreenProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printCompleted, setPrintCompleted] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    
    setTimeout(() => {
      setIsPrinting(false);
      setPrintCompleted(true);
      onPrintComplete();
      
      setTimeout(() => {
        Alert.alert(
          'Print Successful',
          'Order has been sent to the kitchen printer.',
          [{ text: 'OK', onPress: onBack }]
        );
      }, 500);
    }, 2000); // 2 second printing simulation
  };

  const timeAgo = Math.floor((Date.now() - order.timestamp.getTime()) / (1000 * 60));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C2C2C" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Print Order</Text>
            <Text style={styles.headerSubtitle}>#{order.orderNumber}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.printButton, isPrinting && styles.printButtonDisabled]}
            onPress={handlePrint}
            disabled={isPrinting || printCompleted}
          >
            {isPrinting ? (
              <Ionicons name="hourglass-outline" size={24} color="#FFFFFF" />
            ) : printCompleted ? (
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            ) : (
              <Ionicons name="print" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Print Preview */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.printPreview}>
          <View style={styles.receiptContainer}>
            
            {/* Restaurant Header */}
            <View style={styles.receiptHeader}>
              <Text style={styles.restaurantName}>ELITE CAFÉ</Text>
              <Text style={styles.kotTitle}>KITCHEN ORDER TICKET</Text>
              <Text style={styles.dottedLine}>................................</Text>
            </View>

            {/* Order Info - Compact */}
            <View style={styles.orderInfo}>
              <View style={styles.orderInfoLine}>
                <Text style={styles.orderLabel}>ORDER:</Text>
                <Text style={styles.orderValue}>#{order.orderNumber}</Text>
                <Text style={styles.tableLabel}>TABLE:</Text>
                <Text style={styles.tableValue}>{order.tableNumber}</Text>
              </View>
              <View style={styles.orderInfoLine}>
                <Text style={styles.timeLabel}>TIME:</Text>
                <Text style={styles.timeValue}>{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={styles.dateLabel}>DATE:</Text>
                <Text style={styles.dateValue}>{new Date().toLocaleDateString('en-GB')}</Text>
              </View>
              <Text style={styles.dottedLine}>................................</Text>
            </View>

            {/* Order Items - Thermal Receipt Style */}
            <View style={styles.itemsSection}>
              {order.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemLine}>
                    <Text style={styles.itemQty}>{item.quantity}</Text>
                    <Text style={styles.itemName}>{item.name.toUpperCase()}</Text>
                  </View>
                  {item.instruction && (
                    <View style={styles.instructionLine}>
                      <Text style={styles.instructionPrefix}>  NOTE:</Text>
                      <Text style={styles.itemInstruction}>{item.instruction.toUpperCase()}</Text>
                    </View>
                  )}
                </View>
              ))}
              <Text style={styles.dottedLine}>................................</Text>
            </View>

            {/* Summary Section */}
            <View style={styles.summarySection}>
              <View style={styles.summaryLine}>
                <Text style={styles.summaryLabel}>TOTAL ITEMS:</Text>
                <Text style={styles.summaryValue}>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</Text>
              </View>
              <Text style={styles.dottedLine}>................................</Text>
            </View>

            {/* Special Notes if any */}
            {order.items.some(item => item.instruction) && (
              <View style={styles.notesSection}>
                <Text style={styles.notesHeader}>** SPECIAL NOTES **</Text>
                {order.items
                  .filter(item => item.instruction)
                  .map((item, index) => (
                    <Text key={index} style={styles.noteText}>
                      {item.name.toUpperCase()}: {item.instruction?.toUpperCase() || ''}
                    </Text>
                  ))}
                <Text style={styles.dottedLine}>................................</Text>
              </View>
            )}

            {/* Footer */}
            <View style={styles.receiptFooter}>
              <Text style={styles.priorityNote}>** PREPARE IMMEDIATELY **</Text>
              <Text style={styles.kitchenCopy}>KITCHEN COPY</Text>
            </View>

          </View>
        </View>

        {/* Print Status */}
        {isPrinting && (
          <View style={styles.printingStatus}>
            <Ionicons name="print" size={32} color="#2C2C2C" />
            <Text style={styles.printingText}>Sending to printer...</Text>
          </View>
        )}

        {printCompleted && (
          <View style={styles.printSuccess}>
            <Ionicons name="checkmark-circle" size={32} color="#28A745" />
            <Text style={styles.successText}>Order sent to kitchen!</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.printActionButton]}
          onPress={handlePrint}
          disabled={isPrinting || printCompleted}
        >
          {isPrinting ? (
            <>
              <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Printing...</Text>
            </>
          ) : printCompleted ? (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Printed</Text>
            </>
          ) : (
            <>
              <Ionicons name="print" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Print Order</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    paddingTop: height * 0.03,
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
  printButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  printButtonDisabled: {
    opacity: 0.6,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: width * 0.05,
  },
  headerTitle: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: responsiveFontSize(14),
    color: '#E0E0E0',
  },
  content: {
    flex: 1,
  },
  printPreview: {
    padding: width * 0.05,
    alignItems: 'center',
  },
  receiptContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 12,
    width: width * 0.75,
    maxWidth: 250,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  kotTitle: {
    fontSize: responsiveFontSize(10),
    color: '#000000',
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  dottedLine: {
    fontSize: responsiveFontSize(8),
    color: '#000000',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginVertical: 4,
  },
  orderInfo: {
    marginBottom: 12,
  },
  orderInfoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  orderLabel: {
    fontSize: responsiveFontSize(9),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    flex: 1,
  },
  orderValue: {
    fontSize: responsiveFontSize(9),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'left',
  },
  tableLabel: {
    fontSize: responsiveFontSize(9),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
  },
  tableValue: {
    fontSize: responsiveFontSize(9),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
  },
  timeLabel: {
    fontSize: responsiveFontSize(9),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    flex: 1,
  },
  timeValue: {
    fontSize: responsiveFontSize(9),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'left',
  },
  dateLabel: {
    fontSize: responsiveFontSize(9),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
  },
  dateValue: {
    fontSize: responsiveFontSize(9),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
  },
  statusText: {
    color: '#000000',
  },
  itemsSection: {
    marginBottom: 12,
  },
  itemsHeader: {
    fontSize: responsiveFontSize(12),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  itemRow: {
    marginBottom: 6,
  },
  itemLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemQty: {
    fontSize: responsiveFontSize(11),
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'monospace',
    width: 25,
  },
  itemName: {
    fontSize: responsiveFontSize(11),
    color: '#000000',
    fontFamily: 'monospace',
    flex: 1,
    fontWeight: 'bold',
  },
  instructionLine: {
    flexDirection: 'row',
    marginTop: 2,
    alignItems: 'flex-start',
  },
  instructionPrefix: {
    fontSize: responsiveFontSize(9),
    color: '#000000',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    width: 50,
  },
  itemInstruction: {
    fontSize: responsiveFontSize(9),
    color: '#000000',
    fontFamily: 'monospace',
    flex: 1,
  },
  summarySection: {
    marginBottom: 12,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: responsiveFontSize(10),
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'monospace',
  },
  summaryValue: {
    fontSize: responsiveFontSize(10),
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'monospace',
  },
  notesSection: {
    marginBottom: 12,
  },
  notesHeader: {
    fontSize: responsiveFontSize(10),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  noteText: {
    fontSize: responsiveFontSize(9),
    color: '#000000',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  receiptFooter: {
    alignItems: 'center',
    marginTop: 8,
  },
  priorityNote: {
    fontSize: responsiveFontSize(10),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  kitchenCopy: {
    fontSize: responsiveFontSize(9),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  printingStatus: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    margin: width * 0.05,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  printingText: {
    fontSize: responsiveFontSize(16),
    color: '#2C2C2C',
    marginTop: 8,
    fontWeight: '600',
  },
  printSuccess: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0FDF4',
    margin: width * 0.05,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  successText: {
    fontSize: responsiveFontSize(16),
    color: '#28A745',
    marginTop: 8,
    fontWeight: '600',
  },
  bottomActions: {
    padding: width * 0.05,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  printActionButton: {
    backgroundColor: '#2C2C2C',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
  },
});