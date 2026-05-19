export interface Category {
  id: string;
  name: string;
  icon: string;
  desc: string;
  status: 'active' | 'hidden';
  img: string | null;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  name: string;
}

export interface Product {
  id: string;
  cat: string;
  icon: string;
  name: string;
  desc: string;
  price: number;
  disc: number;
  status: 'active' | 'hidden';
  badge: string;
  orders: number;
  media: MediaItem[];
}

export interface Discount {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  expiry: string;
  maxUse: number | null;
  used: number;
  note: string;
}

export interface OrderItem {
  icon: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  name: string;
  phone: string;
  gov: string;
  address: string;
  note: string;
  items: OrderItem[];
  total: number;
  status: 'new' | 'processing' | 'shipped' | 'done' | 'cancelled';
  date: string;
}
