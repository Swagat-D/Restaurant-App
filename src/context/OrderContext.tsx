import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  instruction?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  items: OrderItem[];
  total: number;
  status: 'preparing' | 'ready' | 'served';
  timestamp: Date;
  guestInfo?: {
    name: string;
    whatsapp: string;
  };
}

interface OrderContextType {
  orders: Order[];
  addOrder: (orderData: Omit<Order, 'id' | 'timestamp'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getActiveOrders: () => Order[];
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

  const addOrder = (orderData: Omit<Order, 'id' | 'timestamp'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const getActiveOrders = () => {
    return orders.filter(order => order.status !== 'served');
  };

  return (
    <OrderContext.Provider 
      value={{ 
        orders, 
        addOrder, 
        updateOrderStatus, 
        getActiveOrders 
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};