import { createContext, useContext, useState, ReactNode } from 'react';
import { orderApi } from '../utils/api';
import { Gift } from './GiftContext';

interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface OrderContextType {
  selectedGift: Gift | null;
  quantity: number;
  shippingAddress: ShippingAddress | null;
  selectGift: (gift: Gift) => void;
  setQuantity: (quantity: number) => void;
  setShippingAddress: (address: ShippingAddress) => void;
  submitOrder: (orderData: any) => Promise<string>; // Returns order ID
  clearOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [quantity, setQuantityState] = useState<number>(1);
  const [shippingAddress, setShippingAddressState] = useState<ShippingAddress | null>(null);

  const selectGift = (gift: Gift) => {
    setSelectedGift(gift);
  };

  const setQuantity = (newQuantity: number) => {
    setQuantityState(newQuantity);
  };

  const setShippingAddress = (address: ShippingAddress) => {
    setShippingAddressState(address);
  };

  const submitOrder = async (orderData: any): Promise<string> => {
    try {
      const { order } = await orderApi.create({
        ...orderData,
        gift: selectedGift,
        quantity,
        shippingAddress,
      });
      
      // Clear the order after successful submission
      clearOrder();
      
      return order.id;
    } catch (error: any) {
      console.error('Failed to submit order:', error);
      throw new Error(error.message || 'Failed to submit order');
    }
  };

  const clearOrder = () => {
    setSelectedGift(null);
    setQuantityState(1);
    setShippingAddressState(null);
  };

  return (
    <OrderContext.Provider
      value={{
        selectedGift,
        quantity,
        shippingAddress,
        selectGift,
        setQuantity,
        setShippingAddress,
        submitOrder,
        clearOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
}