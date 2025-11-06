import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

export interface OrderItem {
  _id?: string;
  menuid: string;
  notes?: string;
  quantity: number;
  // Client-side fields for display
  id?: string;
  name?: string;
  price?: number;
  instruction?: string;
}

export interface Order {
  _id: string;
  orderid: string;
  tableid: string;
  tableNumber: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'done';
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'refunded';
  paymentMethod?: string;
  employeeId?: string;
  employeeName?: string;
  orderDate: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Client-side fields for compatibility
  id?: string;
  orderNumber?: string;
  total?: number;
  timestamp?: Date;
  guestInfo?: {
    name: string;
    whatsapp: string;
  };
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  addOrder: (orderData: any) => Promise<boolean>;
  updateOrderStatus: (orderid: string, status: Order['status']) => Promise<boolean>;
  updateFullOrder: (orderData: any) => Promise<boolean>;
  getActiveOrders: () => Order[];
  fetchOrders: () => Promise<void>;
  fetchOrdersByDate: (date: string) => Promise<void>;
  fetchOrdersByStatus: (status: string) => Promise<void>;
  fetchOrdersByDateAndStatus: (date: string, status: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to normalize order data for client compatibility
  const normalizeOrder = (order: any): Order => {
    return {
      ...order,
      id: order._id,
      orderNumber: order.orderid,
      total: order.totalAmount,
      timestamp: new Date(order.orderDate),
      items: order.items.map((item: any) => ({
        ...item,
        id: item._id,
        name: item.menuid?.name || 'Unknown Item',
        price: item.menuid?.price || 0,
        instruction: item.notes,
        // Keep the original menuid string for API calls
        menuid: typeof item.menuid === 'string' ? item.menuid : item.menuid?._id
      })),
      guestInfo: order.customerName ? {
        name: order.customerName,
        whatsapp: order.customerPhone || ''
      } : undefined
    };
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        console.log('OrderContext: No auth token found');
        setError('Authentication required');
        return;
      }

      const response = await api.getAllOrders(token);
      console.log('OrderContext: API response:', response);
      if (response?.success && response.orders) {
        const normalizedOrders = response.orders.map(normalizeOrder);
        setOrders(normalizedOrders);
      } else {
        console.log('OrderContext: Failed response:', response?.message);
        setError(response?.message || 'Failed to load orders');
        setOrders([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while loading orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersByDate = async (date: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await api.getOrdersByDate(token, date);
      if (response?.success && response.orders) {
        const normalizedOrders = response.orders.map(normalizeOrder);
        setOrders(normalizedOrders);
      } else {
        setError(response?.message || 'Failed to load orders by date');
        setOrders([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while loading orders by date');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersByStatus = async (status: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await api.getOrdersByStatus(token, status);
      if (response?.success && response.orders) {
        const normalizedOrders = response.orders.map(normalizeOrder);
        setOrders(normalizedOrders);
      } else {
        setError(response?.message || 'Failed to load orders by status');
        setOrders([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while loading orders by status');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersByDateAndStatus = async (date: string, status: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await api.getOrdersByDateAndStatus(token, date, status);
      if (response?.success && response.orders) {
        const normalizedOrders = response.orders.map(normalizeOrder);
        setOrders(normalizedOrders);
      } else {
        setError(response?.message || 'Failed to load orders by date and status');
        setOrders([]);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while loading orders by date and status');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData: any): Promise<boolean> => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required');
        return false;
      }

      // Transform order data to match backend schema
      const backendOrderData = {
        tableid: orderData.tableid || orderData.tableId,
        tableNumber: orderData.tableNumber,
        customerName: orderData.guestInfo?.name || orderData.customerName,
        customerPhone: orderData.guestInfo?.whatsapp || orderData.customerPhone,
        items: orderData.items.map((item: any) => ({
          menuid: item.menuid || item.id,
          notes: item.instruction || item.notes,
          quantity: item.quantity
        })),
        subtotal: orderData.subtotal || orderData.total
      };

      const response = await api.createOrder(token, backendOrderData);
      if (response?.success && response.order) {
        const normalizedOrder = normalizeOrder(response.order);
        setOrders(prev => [normalizedOrder, ...prev]);
        return true;
      } else {
        setError(response?.message || 'Failed to create order');
        return false;
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while creating order');
      return false;
    }
  };

  const updateOrderStatus = async (orderid: string, status: Order['status']): Promise<boolean> => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required');
        return false;
      }

      // Find the current order
      const currentOrder = orders.find(order => order.orderid === orderid);
      if (!currentOrder) {
        setError('Order not found');
        return false;
      }

      // Prepare update data in the correct backend format
      const updateData = {
        tableid: currentOrder.tableid,
        tableNumber: currentOrder.tableNumber,
        customerName: currentOrder.customerName,
        customerPhone: currentOrder.customerPhone,
        orderid: currentOrder.orderid,
        items: currentOrder.items.map((item: any) => ({
          menuid: typeof item.menuid === 'string' ? item.menuid : (item.menuid?._id || item.id || item._id),
          notes: item.notes || item.instruction || '',
          quantity: item.quantity
        })),
        subtotal: currentOrder.subtotal,
        tax: currentOrder.tax || 0,
        discount: currentOrder.discount || 0,
        totalAmount: currentOrder.totalAmount || currentOrder.total || currentOrder.subtotal,
        status
      };

      const response = await api.updateOrder(token, updateData);
      
      if (response?.success) {
        // Update local state
        setOrders(prev => 
          prev.map(order => 
            order.orderid === orderid 
              ? { ...order, status: status as Order['status'] }
              : order
          )
        );
        return true;
      } else {
        setError(response?.message || 'Failed to update order status');
        return false;
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while updating order status');
      return false;
    }
  };

  const updateFullOrder = async (orderData: any): Promise<boolean> => {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        setError(null);
        const token = await AsyncStorage.getItem('auth_token');
        if (!token) {
          setError('Authentication required');
          return false;
        }

        const response = await api.updateOrder(token, orderData);
        
        if (response?.success) {
          // Refresh orders to get the latest data from server
          await fetchOrders();
          return true;
        } else {
          setError(response?.message || 'Failed to update order');
          return false;
        }
      } catch (err: any) {
        attempt++;
        if (attempt >= maxRetries) {
          setError(`Network error after ${maxRetries} attempts: ${err?.message}`);
          return false;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    return false;
  };

  const refreshOrders = async () => {
    await fetchOrders();
  };

  const getActiveOrders = () => {
    // Changed to match OrdersScreen logic - only exclude cancelled and done orders
    return orders.filter(order => !['cancelled', 'done'].includes(order.status));
  };

  // Load orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <OrderContext.Provider 
      value={{ 
        orders, 
        loading,
        error,
        addOrder, 
        updateOrderStatus,
        updateFullOrder,
        getActiveOrders,
        fetchOrders,
        fetchOrdersByDate,
        fetchOrdersByStatus,
        fetchOrdersByDateAndStatus,
        refreshOrders
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};