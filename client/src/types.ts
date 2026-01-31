export interface Category {
  id: string;
  name: string;
  orderIndex?: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface OrderItem {
  id: string; // menu item id
  name: string;
  qty: number;
  price: number;
  completedQty?: number;
}

export interface Order {
  id: string;
  tableId: number;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'completed';
  paymentStatus: 'unpaid' | 'paid';
  paymentMethod?: string;
  createdAt: string;
}

export interface Table {
  id: number;
  name: string;
  status: 'available' | 'occupied';
  seats?: number;
}
