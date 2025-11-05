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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../context/OrderContext';
import CustomPopup from '../components/CustomPopup';
import * as Print from 'expo-print';

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
  const [showPopup, setShowPopup] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState<any[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<any>(null);
  const [showPrinterSelection, setShowPrinterSelection] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    title: '',
    message: '',
    icon: 'checkmark-circle',
    iconColor: '#28A745',
    onConfirm: () => {}
  });

  // Check for available printers on component mount
  useEffect(() => {
    checkAvailablePrinters();
  }, []);

  const checkAvailablePrinters = async () => {
    try {
      // For mobile devices, we'll use the default system printer
      // For web, we'll rely on the browser's print dialog
      if (Platform.OS === 'web') {
        setSelectedPrinter({ name: 'System Default Printer', id: 'default' });
      } else {
        // On mobile, expo-print uses the system's default printer
        setSelectedPrinter({ name: 'Default Mobile Printer', id: 'mobile-default' });
      }
    } catch (error) {
      console.error('Error checking printers:', error);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    
    try {
      // Generate HTML content for printing (thermal printer compatible)
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              @page {
                margin: 5mm;
                size: 80mm auto;
              }
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                margin: 0; 
                padding: 0;
                width: 100%;
                color: #000;
                background: #fff;
              }
              .receipt { 
                width: 100%; 
                max-width: 80mm;
                margin: 0 auto;
                padding: 2mm;
              }
              .header { 
                text-align: center; 
                margin-bottom: 8px; 
                border-bottom: 1px dashed #000;
                padding-bottom: 8px;
              }
              .restaurant-name {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 2px;
              }
              .kot-title {
                font-size: 12px;
                margin-bottom: 4px;
              }
              .order-info {
                margin: 8px 0;
                font-size: 10px;
              }
              .order-line {
                display: flex;
                justify-content: space-between;
                margin: 2px 0;
              }
              .dashed { 
                border-top: 1px dashed #000; 
                margin: 8px 0; 
                width: 100%;
              }
              .items-section {
                margin: 8px 0;
              }
              .item-row { 
                margin: 4px 0; 
                font-size: 11px;
              }
              .item-line {
                display: flex;
                align-items: flex-start;
              }
              .item-qty {
                width: 20px;
                font-weight: bold;
                flex-shrink: 0;
              }
              .item-name {
                font-weight: bold;
                flex: 1;
              }
              .item-notes { 
                margin: 2px 0 2px 20px; 
                font-size: 10px;
                font-style: italic;
                color: #444;
              }
              .summary {
                border-top: 1px dashed #000;
                border-bottom: 1px dashed #000;
                padding: 4px 0;
                margin: 8px 0;
                text-align: center;
                font-weight: bold;
              }
              .footer { 
                text-align: center; 
                margin-top: 8px; 
                font-weight: bold;
                font-size: 11px;
              }
              .priority {
                font-size: 12px;
                margin: 4px 0;
              }
              .copy-text {
                font-size: 10px;
                margin-top: 4px;
              }
              .special-notes {
                margin: 8px 0;
                padding: 4px 0;
                border-top: 1px dashed #000;
                border-bottom: 1px dashed #000;
              }
              .notes-header {
                text-align: center;
                font-weight: bold;
                margin-bottom: 4px;
                font-size: 11px;
              }
              .note-item {
                margin: 2px 0;
                font-size: 10px;
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <div class="restaurant-name">ELITE CAFÉ</div>
                <div class="kot-title">KITCHEN ORDER TICKET</div>
              </div>
              
              <div class="order-info">
                <div class="order-line">
                  <span>ORDER: #${order.orderNumber || order.orderid}</span>
                  <span>TABLE: ${order.tableNumber}</span>
                </div>
                <div class="order-line">
                  <span>TIME: ${new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
                  <span>DATE: ${new Date().toLocaleDateString('en-GB')}</span>
                </div>
                ${order.customerName ? `<div class="order-line"><span>CUSTOMER: ${order.customerName.toUpperCase()}</span></div>` : ''}
              </div>
              
              <div class="dashed"></div>
              
              <div class="items-section">
                ${order.items.map(item => `
                  <div class="item-row">
                    <div class="item-line">
                      <span class="item-qty">${item.quantity}x</span>
                      <span class="item-name">${(item.name || 'Unknown Item').toUpperCase()}</span>
                    </div>
                    ${(item.instruction || item.notes) ? `<div class="item-notes">NOTE: ${(item.instruction || item.notes || '').toUpperCase()}</div>` : ''}
                  </div>
                `).join('')}
              </div>
              
              <div class="summary">
                TOTAL ITEMS: ${order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              
              ${order.items.some(item => item.instruction || item.notes) ? `
                <div class="special-notes">
                  <div class="notes-header">** SPECIAL INSTRUCTIONS **</div>
                  ${order.items
                    .filter(item => item.instruction || item.notes)
                    .map(item => `<div class="note-item">${(item.name || 'Unknown Item').toUpperCase()}: ${(item.instruction || item.notes || '').toUpperCase()}</div>`)
                    .join('')}
                </div>
              ` : ''}
              
              <div class="footer">
                <div class="priority">** PREPARE IMMEDIATELY **</div>
                <div class="copy-text">KITCHEN COPY</div>
              </div>
            </div>
          </body>
        </html>
      `;

      // Print the receipt using expo-print
      try {
        // Print options for thermal/receipt printers
        const printOptions = {
          html: htmlContent,
          width: 216, // 80mm in points (80mm * 2.834 points/mm ≈ 216 points)
          height: 1000, // Auto height
          base64: false,
          margins: {
            left: 5,
            top: 5,
            right: 5,
            bottom: 5,
          },
        };

        // Print the receipt
        await Print.printAsync(printOptions);
        
        // Complete the printing process
        setTimeout(() => {
          setIsPrinting(false);
          setPrintCompleted(true);
          onPrintComplete();
          
          setPopupConfig({
            title: 'Print Successful',
            message: 'Kitchen order ticket has been printed successfully!',
            icon: 'checkmark-circle',
            iconColor: '#28A745',
            onConfirm: () => {
              setShowPopup(false);
              onBack();
            }
          });
          setShowPopup(true);
        }, 1000);
        
      } catch (printError) {
        console.error('Direct print error:', printError);
        throw printError; // Re-throw to be caught by outer catch
      }
      
    } catch (error) {
      console.error('Print error:', error);
      setIsPrinting(false);
      
      // Show fallback options
      Alert.alert(
        'Print Error',
        'Unable to print directly. Would you like to try alternative options?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Save as PDF',
            onPress: () => handleSaveAsPDF()
          },
          {
            text: 'Try Again',
            onPress: () => handlePrint()
          }
        ]
      );
    }
  };

  const handleSaveAsPDF = async () => {
    try {
      setIsPrinting(true);
      
      // Same HTML content as above but generate PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              @page { margin: 10mm; size: A4; }
              body { font-family: 'Courier New', monospace; font-size: 14px; margin: 0; padding: 20px; }
              .receipt { width: 80mm; margin: 0 auto; border: 1px solid #ccc; padding: 10mm; }
              .header { text-align: center; margin-bottom: 15px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
              .restaurant-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
              .kot-title { font-size: 14px; margin-bottom: 5px; }
              .order-info { margin: 10px 0; font-size: 12px; }
              .order-line { display: flex; justify-content: space-between; margin: 3px 0; }
              .dashed { border-top: 2px dashed #000; margin: 10px 0; }
              .item-row { margin: 5px 0; font-size: 13px; }
              .item-line { display: flex; align-items: flex-start; }
              .item-qty { width: 30px; font-weight: bold; }
              .item-name { font-weight: bold; flex: 1; }
              .item-notes { margin: 3px 0 3px 30px; font-size: 11px; font-style: italic; }
              .summary { border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 8px 0; margin: 15px 0; text-align: center; font-weight: bold; }
              .footer { text-align: center; margin-top: 15px; font-weight: bold; }
              .priority { font-size: 14px; margin: 5px 0; }
              .copy-text { font-size: 12px; margin-top: 5px; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <div class="restaurant-name">ELITE CAFÉ</div>
                <div class="kot-title">KITCHEN ORDER TICKET</div>
              </div>
              
              <div class="order-info">
                <div class="order-line">
                  <span>ORDER: #${order.orderNumber || order.orderid}</span>
                  <span>TABLE: ${order.tableNumber}</span>
                </div>
                <div class="order-line">
                  <span>TIME: ${new Date().toLocaleTimeString()}</span>
                  <span>DATE: ${new Date().toLocaleDateString()}</span>
                </div>
              </div>
              
              <div class="dashed"></div>
              
              <div class="items-section">
                ${order.items.map(item => `
                  <div class="item-row">
                    <div class="item-line">
                      <span class="item-qty">${item.quantity}x</span>
                      <span class="item-name">${(item.name || 'Unknown Item').toUpperCase()}</span>
                    </div>
                    ${(item.instruction || item.notes) ? `<div class="item-notes">NOTE: ${(item.instruction || item.notes || '').toUpperCase()}</div>` : ''}
                  </div>
                `).join('')}
              </div>
              
              <div class="summary">
                TOTAL ITEMS: ${order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              
              <div class="footer">
                <div class="priority">** PREPARE IMMEDIATELY **</div>
                <div class="copy-text">KITCHEN COPY</div>
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      setIsPrinting(false);
      
      setPopupConfig({
        title: 'PDF Saved',
        message: `Kitchen order saved as PDF. You can now share or print this file.`,
        icon: 'document',
        iconColor: '#2C2C2C',
        onConfirm: () => {
          setShowPopup(false);
          // You could implement sharing here if needed
        }
      });
      setShowPopup(true);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      setIsPrinting(false);
      
      setPopupConfig({
        title: 'PDF Error',
        message: 'Unable to generate PDF. Please try again.',
        icon: 'alert-circle',
        iconColor: '#DC3545',
        onConfirm: () => setShowPopup(false)
      });
      setShowPopup(true);
    }
  };

  const timeAgo = order.timestamp ? 
    Math.floor((Date.now() - order.timestamp.getTime()) / (1000 * 60)) :
    Math.floor((Date.now() - new Date(order.orderDate || Date.now()).getTime()) / (1000 * 60));

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
            {selectedPrinter && (
              <Text style={styles.printerInfo}>📄 {selectedPrinter.name}</Text>
            )}
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
            </View>

            {/* Order Items - Thermal Receipt Style */}
            <View style={styles.itemsSection}>
              {order.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemLine}>
                    <Text style={styles.itemQty}>{item.quantity}x</Text>
                    <Text style={styles.itemName}>{(item.name || 'Unknown Item').toUpperCase()}</Text>
                  </View>
                  {(item.instruction || item.notes) && (
                    <View style={styles.instructionLine}>
                      <Text style={styles.instructionPrefix}>NOTE:</Text>
                      <Text style={styles.itemInstruction}>{(item.instruction || item.notes || '').toUpperCase()}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Summary Section */}
            <View style={styles.summarySection}>
              <View style={styles.summaryLine}>
                <Text style={styles.summaryLabel}>TOTAL ITEMS:</Text>
                <Text style={styles.summaryValue}>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</Text>
              </View>
            </View>

            {/* Special Notes if any */}
            {order.items.some(item => item.instruction || item.notes) && (
              <View style={styles.notesSection}>
                <Text style={styles.notesHeader}>** SPECIAL NOTES **</Text>
                {order.items
                  .filter(item => item.instruction || item.notes)
                  .map((item, index) => (
                    <Text key={index} style={styles.noteText}>
                      {(item.name || 'Unknown Item').toUpperCase()}: {(item.instruction || item.notes || '').toUpperCase()}
                    </Text>
                  ))}
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

      <CustomPopup
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        title={popupConfig.title}
        message={popupConfig.message}
        icon={popupConfig.icon}
        iconColor={popupConfig.iconColor}
        buttons={[
          {
            text: 'OK',
            onPress: popupConfig.onConfirm,
            style: 'default'
          }
        ]}
      />
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
    borderRadius: 2,
    padding: 8,
    width: 240, // 80mm equivalent (80mm * 3 ≈ 240px for better mobile visibility)
    maxWidth: 240,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderStyle: 'dashed',
  },
  restaurantName: {
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  kotTitle: {
    fontSize: responsiveFontSize(8),
    color: '#000000',
    textAlign: 'center',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  dottedLine: {
    fontSize: responsiveFontSize(6),
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
    marginVertical: 3,
    letterSpacing: 0.5,
  },
  orderInfo: {
    marginBottom: 8,
  },
  orderInfoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  orderLabel: {
    fontSize: responsiveFontSize(7),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
  },
  orderValue: {
    fontSize: responsiveFontSize(7),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
    textAlign: 'left',
  },
  tableLabel: {
    fontSize: responsiveFontSize(7),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
    textAlign: 'right',
  },
  tableValue: {
    fontSize: responsiveFontSize(7),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
    textAlign: 'right',
  },
  timeLabel: {
    fontSize: responsiveFontSize(7),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
  },
  timeValue: {
    fontSize: responsiveFontSize(7),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
    textAlign: 'left',
  },
  dateLabel: {
    fontSize: responsiveFontSize(7),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
    textAlign: 'right',
  },
  dateValue: {
    fontSize: responsiveFontSize(7),
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
    textAlign: 'right',
  },
  statusText: {
    color: '#000000',
  },
  itemsSection: {
    marginBottom: 8,
  },
  itemsHeader: {
    fontSize: responsiveFontSize(10),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  itemRow: {
    marginBottom: 3,
  },
  itemLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemQty: {
    fontSize: responsiveFontSize(9),
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    width: 20,
  },
  itemName: {
    fontSize: responsiveFontSize(9),
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
    fontWeight: 'bold',
    lineHeight: responsiveFontSize(11),
  },
  instructionLine: {
    flexDirection: 'row',
    marginTop: 1,
    alignItems: 'flex-start',
  },
  instructionPrefix: {
    fontSize: responsiveFontSize(7),
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
    width: 40,
  },
  itemInstruction: {
    fontSize: responsiveFontSize(7),
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    flex: 1,
    lineHeight: responsiveFontSize(9),
  },
  summarySection: {
    marginBottom: 8,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'dashed',
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: responsiveFontSize(8),
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  summaryValue: {
    fontSize: responsiveFontSize(8),
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  notesSection: {
    marginBottom: 8,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'dashed',
  },
  notesHeader: {
    fontSize: responsiveFontSize(8),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  noteText: {
    fontSize: responsiveFontSize(7),
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 1,
    lineHeight: responsiveFontSize(9),
  },
  receiptFooter: {
    alignItems: 'center',
    marginTop: 6,
  },
  priorityNote: {
    fontSize: responsiveFontSize(8),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  kitchenCopy: {
    fontSize: responsiveFontSize(7),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
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
  printerInfo: {
    fontSize: responsiveFontSize(12),
    color: '#E0E0E0',
    marginTop: 4,
  },
  printerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    margin: width * 0.05,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  printerStatusText: {
    fontSize: responsiveFontSize(14),
    color: '#15803D',
    fontWeight: '600',
    flex: 1,
  },
});