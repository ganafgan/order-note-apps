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
  monthlyStats: Array<{ name: string; count: number }>;
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

export async function getOrders(params?: { 
  month?: string; 
  year?: string; 
  startDate?: string; 
  endDate?: string; 
}): Promise<OrderItem[]> {
  let url = `${API_BASE}/orders`;
  if (params) {
    const query = new URLSearchParams();
    if (params.month) query.append('month', params.month);
    if (params.year) query.append('year', params.year);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (query.toString()) url += `?${query.toString()}`;
  }
  
  const res = await fetch(url, { headers: getHeaders() });
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
