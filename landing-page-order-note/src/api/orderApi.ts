import { API_BASE_URL } from './config';

const API_BASE = API_BASE_URL;

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface OrderItemDetail {
  id?: string;
  clothType: string;
  size: string;
  color?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  items: OrderItemDetail[];
  createdAt: string;
}

export interface OrderStats {
  totalOrders: number;
  totalAmount: number;
  totalProfit: number;
  totalCustomers: number;
  statusCounts: Record<string, number>;
  recentOrders: OrderItem[];
}

export async function createOrder(data: {
  customerName: string;
  phoneNumber: string;
  address: string;
  items: Omit<OrderItemDetail, 'id' | 'subtotal'>[];
}): Promise<{ message: string; order: OrderItem }> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal membuat order.');
  return json;
}

export async function getOrders(): Promise<OrderItem[]> {
  const res = await fetch(`${API_BASE}/orders`, { headers: getHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal mengambil data order.');
  return json;
}

export async function getOrderStats(): Promise<any> {
  const res = await fetch(`${API_BASE}/orders/stats`, { headers: getHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal mengambil statistik.');
  return json;
}

export async function updateOrderStatus(id: string, status: string): Promise<any> {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui status.');
  return json;
}

export async function deleteOrder(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal menghapus order.');
  return json;
}
