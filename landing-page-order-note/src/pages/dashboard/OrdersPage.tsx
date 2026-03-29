import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { getOrders, deleteOrder } from '../../api/orderApi';
import type { OrderItem } from '../../api/orderApi';
import ConfirmDialog from '../../components/ConfirmDialog';

function formatRupiah(val: number) {
  return 'Rp ' + Number(val).toLocaleString('id-ID');
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // Filters state
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  // Custom dialog state
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; num: string }>({
    isOpen: false,
    id: '',
    num: '',
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterMonth) params.month = filterMonth;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      
      const data = await getOrders(params);
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filterMonth, filterStartDate, filterEndDate]);

  const resetFilters = () => {
    setFilterMonth('');
    setFilterStartDate('');
    setFilterEndDate('');
    setSearchTerm('');
  };

  const filteredOrders = orders
    .filter((order) => 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const handleDelete = async () => {
    try {
      setActionLoading(confirmDelete.id);
      await deleteOrder(confirmDelete.id);
      setConfirmDelete({ isOpen: false, id: '', num: '' });
      await fetchOrders();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportPDF = (order: OrderItem) => {
    const doc = new jsPDF();
    const fileName = `${order.customerName}-${order.orderNumber}.pdf`;

    // --- 1. Branding Header ---
    doc.setFillColor(99, 103, 255);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('NoteOrder.', 15, 26);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('DETAIL PESANAN PELANGGAN', 155, 25);
    doc.text(`${order.orderNumber}`, 155, 31);

    // --- 2. Watermark ---
    doc.setTextColor(245, 245, 245);
    doc.setFontSize(80);
    doc.setFont('helvetica', 'bold');
    doc.text('NoteOrder.', 35, 160, { angle: 45 });
    
    let currentY = 55;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DIPESAN OLEH:', 15, currentY);
    currentY += 8;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.text(order.customerName, 15, currentY);
    currentY += 15;
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text('DAFTAR PESANAN:', 15, currentY);
    currentY += 10;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    order.items.forEach((item) => {
      const itemLine = `• ${item.clothType}${item.color ? ' - ' + item.color : ''} - ${item.size}`;
      const qtyLine = `${item.quantity} pcs`;
      doc.text(itemLine, 20, currentY);
      doc.text(qtyLine, 180, currentY, { align: 'right' });
      currentY += 8;
    });

    currentY += 15;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ALAMAT PENGIRIMAN:', 15, currentY);
    currentY += 8;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const splitAddress = doc.splitTextToSize(order.address, 180);
    doc.text(splitAddress, 15, currentY);
    const addressHeight = splitAddress.length * 6;
    currentY += addressHeight + 12;

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('NOMOR TELEPON:', 15, currentY);
    currentY += 7;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.text(order.phoneNumber, 15, currentY);

    doc.setDrawColor(230, 230, 230);
    doc.line(15, 280, 195, 280);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('Catatan: Dokumen ini dihasilkan secara otomatis oleh sistem NoteOrder.', 15, 287);
    doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')}`, 195, 287, { align: 'right' });
    doc.save(fileName);
  };

  const months = [
    { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' }, { value: '4', label: 'April' },
    { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' }, { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
  ];

  const activeFiltersCount = [filterMonth, filterStartDate, filterEndDate, searchTerm].filter(Boolean).length;

  return (
    <div className="dashboard-page">
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Daftar Order</h1>
          <p className="page-subtitle">Kelola semua order masuk — total {orders.length} order</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard/orders/new')}
          id="btn-new-order"
          style={{ boxShadow: '0 4px 12px rgba(99, 103, 255, 0.25)' }}
        >
          + Buat Order Baru
        </button>
      </div>

      <div className="filters-container">
        <div className="filters-header">
          <span className="filters-header-title">🔍 Filter & Pencarian</span>
          {activeFiltersCount > 0 && (
            <div className="filter-tag">
              {activeFiltersCount} Filter Aktif
              <button onClick={resetFilters} title="Reset">✕</button>
            </div>
          )}
          <button 
            className="link-btn" 
            style={{ fontSize: '0.8rem', color: 'var(--clr-primary)', fontWeight: 600 }}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '⬆️ Sembunyikan Filter' : '⚙️ Filter Lanjutan'}
          </button>
        </div>

        <div className="filters-body">
          <div className="filter-group-row">
            <div className="filter-item">
              <label className="filter-label">Cari Pelanggan</label>
              <div className="filter-input-wrapper">
                <span className="filter-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Ketik nama pelanggan..."
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-item medium">
              <label className="filter-label">Pilih Bulan</label>
              <div className="filter-input-wrapper">
                <span className="filter-icon">🗓️</span>
                <select 
                  className="form-control"
                  value={filterMonth}
                  onChange={(e) => {
                    setFilterMonth(e.target.value);
                    setFilterStartDate('');
                    setFilterEndDate('');
                  }}
                >
                  <option value="">Semua Bulan</option>
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>

            <button 
              className="btn btn-secondary" 
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              style={{ height: 44, padding: '0 20px', borderRadius: 'var(--radius-sm)', display: 'flex', gap: 10, alignItems: 'center' }}
            >
              <span style={{ fontSize: '1.1rem' }}>{sortOrder === 'desc' ? '🔽' : '🔼'}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
            </button>
          </div>

          {showAdvanced && (
            <div className="filter-group-row" style={{ paddingTop: 20, borderTop: '1px solid var(--clr-bg-alt)' }}>
              <div className="filter-item small">
                <label className="filter-label">Dari Tanggal</label>
                <div className="filter-input-wrapper">
                  <span className="filter-icon">📅</span>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={filterStartDate}
                    onChange={(e) => {
                      setFilterStartDate(e.target.value);
                      setFilterMonth('');
                    }}
                  />
                </div>
              </div>
              <div className="filter-item small">
                <label className="filter-label">Sampai Tanggal</label>
                <div className="filter-input-wrapper">
                  <span className="filter-icon">📅</span>
                  <input 
                    type="date" 
                    className="form-control"
                    value={filterEndDate}
                    onChange={(e) => {
                      setFilterEndDate(e.target.value);
                      setFilterMonth('');
                    }}
                  />
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginBottom: 12, fontStyle: 'italic' }}>
                * Filter rentang tanggal akan mengabaikan filter bulan.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="chart-card" style={{ overflow: 'auto' }}>
        {loading ? (
          <div className="empty-state"><span>⏳</span><p>Memuat data...</p></div>
        ) : error ? (
          <div className="empty-state"><span>⚠️</span><p>{error}</p></div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <span>📋</span>
            <p>{searchTerm ? 'Tidak ada order yang cocok dengan pencarian.' : 'Belum ada order. Klik "Buat Order Baru" untuk memulai.'}</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Pelanggan</th>
                <th>Telepon</th>
                <th>Produk</th>
                <th>Ukuran</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{order.phoneNumber}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      {order.items.map((it, idx) => (
                        <div key={idx}>
                          {it.clothType}{it.color ? ` - ${it.color}` : ''}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {Array.from(new Set(order.items.map(it => it.size))).map(s => (
                        <span key={s} className="size-badge">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td>{order.items.reduce((sum, it) => sum + it.quantity, 0)}</td>
                  <td style={{ fontWeight: 600 }}>{formatRupiah(order.totalAmount)}</td>
                  <td className="order-date">{formatDate(order.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn advance"
                        onClick={() => handleExportPDF(order)}
                        title="Export PDF"
                        id={`btn-export-${order.id}`}
                        style={{ color: 'var(--clr-primary)' }}
                      >
                        📄
                      </button>
                      <button
                        className="action-btn delete"
                        disabled={actionLoading === order.id}
                        onClick={() => setConfirmDelete({ isOpen: true, id: order.id, num: order.orderNumber })}
                        title="Hapus Order"
                        id={`btn-delete-${order.id}`}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Order"
        message={`Apakah Anda yakin ingin menghapus order ${confirmDelete.num}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: '', num: '' })}
        isLoading={actionLoading === confirmDelete.id}
      />
    </div>
  );
}
