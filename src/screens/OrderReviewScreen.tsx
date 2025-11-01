import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar, ScrollView, Dimensions, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const responsiveFontSize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;
  return Math.round(newSize);
};

interface ReviewItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  instruction?: string;
}

interface OrderReviewScreenProps {
  orderNumber: string;
  tableNumber: string;
  items: ReviewItem[];
  specialInstruction?: string;
  guestInfo?: { name: string; whatsapp: string };
  onConfirm: () => void;
  onEdit: (itemId: string, newQuantity: number, newInstruction?: string) => void;
  onDelete: (itemId: string) => void;
  onBack: () => void;
}

export default function OrderReviewScreen({ orderNumber, tableNumber, items, specialInstruction, guestInfo, onConfirm, onEdit, onDelete, onBack }: OrderReviewScreenProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ReviewItem | null>(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editInstruction, setEditInstruction] = useState('');

  const handleEditItem = (item: ReviewItem) => {
    setEditingItem(item);
    setEditQuantity(item.quantity);
    setEditInstruction(item.instruction || '');
    setShowEditModal(true);
  };

  const confirmEdit = () => {
    if (editingItem) {
      if (editQuantity <= 0) {
        // If quantity is 0 or less, delete the item
        onDelete(editingItem.id);
      } else {
        // Otherwise, update the item
        onEdit(editingItem.id, editQuantity, editInstruction);
      }
    }
    setShowEditModal(false);
    setEditingItem(null);
  };
  const renderItem = ({ item }: { item: ReviewItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.instruction ? (
          <Text style={styles.itemInstruction}>Note: {item.instruction}</Text>
        ) : null}
        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>₹ {item.price.toFixed(2)} each</Text>
          <View style={styles.itemActions}>
            <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color="#D32F2F" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEditItem(item)} style={styles.editBtn}>
              <Ionicons name="create-outline" size={18} color="#2C2C2C" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.quantitySection}>
        <Text style={styles.itemQty}>x{item.quantity}</Text>
        <Text style={styles.itemTotal}>₹ {(item.price * item.quantity).toFixed(2)}</Text>
      </View>
    </View>
  );

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
            <Text style={styles.greetingText}>Order Review</Text>
            <Text style={styles.subtitleText}>Order #{orderNumber} • {tableNumber}</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({items.length})</Text>
          {items.map((item) => (
            <View key={item.id}>
              {renderItem({ item })}
            </View>
          ))}
        </View>

        {guestInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guest Information</Text>
            <View style={styles.guestInfoCard}>
              <View style={styles.guestInfoRow}>
                <Text style={styles.guestInfoLabel}>Name:</Text>
                <Text style={styles.guestInfoValue}>{guestInfo.name}</Text>
              </View>
              {guestInfo.whatsapp && (
                <View style={styles.guestInfoRow}>
                  <Text style={styles.guestInfoLabel}>WhatsApp:</Text>
                  <Text style={styles.guestInfoValue}>{guestInfo.whatsapp}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ...existing code... */}
      </ScrollView>

      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹ {total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
          <Text style={styles.confirmText}>Confirm Order</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Item Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Item</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            {editingItem && (
              <View style={styles.editForm}>
                <Text style={styles.itemNameEdit}>{editingItem.name}</Text>
                
                <View style={styles.quantityEditSection}>
                  <Text style={styles.editLabel}>Quantity</Text>
                  <View style={styles.quantityEditControls}>
                    <TouchableOpacity 
                      style={styles.quantityBtn}
                      onPress={() => setEditQuantity(Math.max(0, editQuantity - 1))}
                    >
                      <Ionicons name="remove" size={16} color="#2C2C2C" />
                    </TouchableOpacity>
                    <Text style={styles.quantityEditText}>{editQuantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityBtn}
                      onPress={() => setEditQuantity(editQuantity + 1)}
                    >
                      <Ionicons name="add" size={16} color="#2C2C2C" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.instructionEditSection}>
                  <Text style={styles.editLabel}>Special Instructions</Text>
                  <TextInput
                    style={styles.instructionEditInput}
                    value={editInstruction}
                    onChangeText={setEditInstruction}
                    placeholder="Any special instructions..."
                    multiline
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.cancelBtn}
                    onPress={() => setShowEditModal(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.saveBtn}
                    onPress={confirmEdit}
                  >
                    <Text style={styles.saveText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  headerPlaceholder: {
    width: 40,
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
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  itemInstruction: {
    fontSize: responsiveFontSize(12),
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: responsiveFontSize(14),
    color: '#2C2C2C',
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    padding: 6,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  quantitySection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
  },
  itemQty: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  // ...existing code...
  orderSummary: {
    backgroundColor: '#FFFFFF',
    padding: width * 0.05,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#333333',
  },
  totalValue: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  confirmBtn: {
    backgroundColor: '#2C2C2C',
    borderRadius: 25,
    paddingVertical: height * 0.018,
    alignItems: 'center',
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#333333',
  },
  editForm: {
    gap: 16,
  },
  itemNameEdit: {
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  quantityEditSection: {
    gap: 8,
  },
  editLabel: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: '#333333',
  },
  quantityEditControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  quantityBtn: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityEditText: {
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    color: '#2C2C2C',
    minWidth: 40,
    textAlign: 'center',
  },
  instructionEditSection: {
    gap: 8,
  },
  instructionEditInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: responsiveFontSize(14),
    color: '#333333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: '#666666',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveText: {
    fontSize: responsiveFontSize(14),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  guestInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guestInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestInfoLabel: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: '#666666',
  },
  guestInfoValue: {
    fontSize: responsiveFontSize(14),
    fontWeight: '500',
    color: '#333333',
  },
});
