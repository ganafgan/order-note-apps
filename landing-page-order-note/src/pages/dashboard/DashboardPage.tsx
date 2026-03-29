import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { getOrderStats } from '../../api/orderApi';
import type { OrderStats, OrderItem } from '../../api/orderApi';

const STATUS_COLORS: Record<string, string> = {
  Selesai: '#8CB3A1',
  Diproses: '#F0A3B5',
  Menunggu: '#F4C494',
  Dibatalkan: '#E28787',
};

const STATUS_BADGE: Record<string, string> = {
  completed: 'success',
  processing: 'processing',
  pending: 'pending',
  cancelled: 'cancelled',
};

const STATUS_LABEL: Record<string, string> = {
  completed: 'Selesai',
  processing: 'Diproses',
  pending: 'Menunggu',
  cancelled: 'Dibatalkan',
};

function formatRupiah(val: number) {
  return 'Rp ' + Number(val).toLocaleString('id-ID');
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color || entry.fill }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrderStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="empty-state" style={{ marginTop: 80 }}>
          <span>⏳</span><p>Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="dashboard-page">
        <div className="empty-state" style={{ marginTop: 80 }}>
          <span>⚠️</span><p>{error || 'Gagal memuat data.'}</p>
        </div>
      </div>
    );
  }

  const revenueMillions = (stats.totalAmount / 1000000).toFixed(1);
  
  // Transform statusCounts to breakdown array for Recharts
  const statusBreakdown = Object.keys(stats.statusCounts).map(key => ({
    name: STATUS_LABEL[key] || key,
    value: stats.statusCounts[key]
  })).filter(s => s.value > 0);

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Ringkasan performa order note Anda</p>
        </div>
        <div className="page-header-actions">
          <div className="page-header-date">
            <span>📅</span>
            <span>{today}</span>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/dashboard/orders/new')}
            id="btn-quick-order"
            style={{ padding: '8px 16px', fontSize: '0.875rem', marginTop: '16px' }}
          >
            + Buat Order
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(240,163,181,0.15)', color: 'var(--clr-primary)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Order</p>
            <p className="stat-value">{stats.totalOrders}</p>
            <p className="stat-change positive">{stats.statusCounts.completed || 0} selesai</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(140,179,161,0.15)', color: 'var(--clr-success)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Pendapatan</p>
            <p className="stat-value">{stats.totalAmount >= 1000000 ? `Rp ${revenueMillions} Jt` : formatRupiah(stats.totalAmount)}</p>
            <p className="stat-change positive">dari {stats.statusCounts.completed || 0} order selesai</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(140,179,161,0.15)', color: 'var(--clr-success)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Keuntungan</p>
            <p className="stat-value">{formatRupiah(stats.totalProfit)}</p>
            <p className="stat-change positive">akumulasi keuntungan</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(240,163,181,0.15)', color: 'var(--clr-primary)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Pelanggan</p>
            <p className="stat-value">{stats.totalCustomers}</p>
            <p className="stat-change positive">pelanggan unik</p>
          </div>
        </div>
      </div>

      {/* Charts Row: Pie + Bar */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Pie / Donut */}
        <div className="chart-card w-full lg:w-[340px] shrink-0">
          <h3 className="chart-title">Status Order</h3>
          <p className="chart-subtitle">Distribusi status semua order</p>
          {statusBreakdown.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <span>📊</span><p>Belum ada data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusBreakdown.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[statusBreakdown[index].name] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val} order`, '']} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar: orders by status */}
        <div className="chart-card flex-1 w-full lg:w-auto">
          <h3 className="chart-title">Ringkasan Order</h3>
          <p className="chart-subtitle">Jumlah order berdasarkan status</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[
                { label: 'Menunggu', count: stats.statusCounts.pending || 0 },
                { label: 'Diproses', count: stats.statusCounts.processing || 0 },
                { label: 'Selesai', count: stats.statusCounts.completed || 0 },
                { label: 'Dibatalkan', count: stats.statusCounts.cancelled || 0 },
              ]}
              barSize={36}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
              <XAxis dataKey="label" tick={{ fill: '#8E787C', fontSize: 13 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8E787C', fontSize: 13 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Order" fill="#F0A3B5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Area chart: recent 5 order trend (value) */}
      {stats.recentOrders.length > 1 && (
        <div className="chart-card">
          <h3 className="chart-title">Nilai 5 Order Terbaru</h3>
          <p className="chart-subtitle">Total amount per order</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={[...stats.recentOrders].reverse().map((o) => ({
                label: o.orderNumber.slice(-7),
                value: Number(o.totalAmount),
              }))}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F0A3B5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F0A3B5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
              <XAxis dataKey="label" tick={{ fill: '#8E787C', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#8E787C', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip formatter={(v: any) => [formatRupiah(Number(v)), 'Total']} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#F0A3B5"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={{ r: 4, fill: '#F0A3B5', strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="chart-card" style={{ overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h3 className="chart-title">Order Terbaru</h3>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard/orders')}
            id="btn-view-all-orders"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Lihat Semua →
          </button>
        </div>
        <p className="chart-subtitle">5 order paling baru</p>
        {stats.recentOrders.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <span>📋</span><p>Belum ada order. <button className="link-btn" onClick={() => navigate('/dashboard/orders/new')}>Buat sekarang</button></p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Pelanggan</th>
                <th>Produk</th>
                <th>Total</th>
                <th>Status</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order: OrderItem) => (
                <tr key={order.id}>
                  <td className="order-id">{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>
                      {order.items?.map((it, idx) => (
                        <div key={idx}>{it.clothType} ({it.quantity})</div>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatRupiah(order.totalAmount)}</td>
                  <td>
                    <span className={`order-badge ${STATUS_BADGE[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td className="order-date">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
