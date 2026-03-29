import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createOrder } from '../../api/orderApi';
import { getClothesTypes } from '../../api/clothesTypeApi';
import type { ClothesTypeItem } from '../../api/clothesTypeApi';
import ErrorDialog from '../../components/ErrorDialog';

function formatRupiah(val: number) {
  return 'Rp ' + val.toLocaleString('id-ID');
}

const validationSchema = Yup.object({
  customerName: Yup.string()
    .min(3, 'Nama minimal 3 karakter')
    .required('Nama pemesan wajib diisi'),
  phoneNumber: Yup.string()
    .matches(/^[0-9+\-\s]{8,15}$/, 'Format nomor telepon tidak valid')
    .required('Nomor telepon wajib diisi'),
  address: Yup.string()
    .min(10, 'Alamat minimal 10 karakter')
    .required('Alamat wajib diisi'),
  items: Yup.array()
    .min(1, 'Minimal harus ada 1 item dalam pesanan')
    .required('Items wajib ada'),
});

export default function NewOrderPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Master data
  const [clothesTypes, setClothesTypes] = useState<ClothesTypeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Local state for "current item" being picked
  const [picker, setPicker] = useState({
    clothType: '',
    size: '',
    color: '',
    quantity: 1,
  });

  useEffect(() => {
    getClothesTypes()
      .then(setClothesTypes)
      .catch(err => setServerError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formik = useFormik({
    initialValues: {
      customerName: '',
      phoneNumber: '',
      address: '',
      items: [] as any[], // { clothType, size, quantity, price }
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setSubmitting(true);
        const res = await createOrder(values);
        setSuccessMsg(`Order ${res.order.orderNumber} berhasil dibuat!`);
        resetForm();
        setPicker({ clothType: '', size: '', color: '', quantity: 1 });
        setTimeout(() => navigate('/dashboard/orders'), 1500);
      } catch (err: any) {
        setServerError(err.message || 'Terjadi kesalahan pada server.');
        setIsDialogOpen(true);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const selectedCloth = clothesTypes.find(c => c.name === picker.clothType);
  const unitPrice = selectedCloth?.sellingPrice ?? 0;
  const availableSizes = Array.isArray(selectedCloth?.sizes) ? selectedCloth.sizes : [];

  const handleAddItem = () => {
    if (!picker.clothType || !picker.size || picker.quantity < 1) return;
    
    const newItem = {
      clothType: picker.clothType,
      size: picker.size,
      color: picker.color,
      quantity: picker.quantity,
      price: unitPrice,
      subtotal: unitPrice * picker.quantity,
    };

    formik.setFieldValue('items', [...formik.values.items, newItem]);
    
    // Reset picker to initial state
    setPicker({ clothType: '', size: '', color: '', quantity: 1 });
  };

  const removeItem = (index: number) => {
    const newItems = [...formik.values.items];
    newItems.splice(index, 1);
    formik.setFieldValue('items', newItems);
  };

  const totalAmount = formik.values.items.reduce((sum, item) => sum + item.subtotal, 0);

  if (loading) return <div className="dashboard-page"><div className="empty-state">⏳ Memuat data...</div></div>;

  return (
    <div className="dashboard-page">
      <ErrorDialog
        isOpen={isDialogOpen}
        message={serverError}
        onClose={() => setIsDialogOpen(false)}
      />

      <div className="page-header">
        <div>
          <h1 className="page-title">Buat Order Baru</h1>
          <p className="page-subtitle">Isi detail pelanggan dan daftar pesanan</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard/orders')}>
          ← Kembali
        </button>
      </div>

      {successMsg && <div className="alert-success" style={{ marginBottom: 24 }}>✅ {successMsg}</div>}

      <div className="order-form-layout" style={{ alignItems: 'flex-start', gap: 32 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Section: Customer Info */}
          <div className="chart-card">
            <div className="form-section-header">
              <div className="icon-bg">👤</div>
              <h3 className="chart-title" style={{ marginBottom: 0 }}>Data Pelanggan</h3>
            </div>
            
            <form className="order-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="customerName">Nama Pemesan <span className="required">*</span></label>
                <input
                  id="customerName"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  {...formik.getFieldProps('customerName')}
                  className={formik.touched.customerName && formik.errors.customerName ? 'input-error' : ''}
                />
                {formik.touched.customerName && formik.errors.customerName && <div className="error-text">{formik.errors.customerName}</div>}
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="form-group">
                  <label htmlFor="phoneNumber">Nomor Telepon <span className="required">*</span></label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    placeholder="0812..."
                    {...formik.getFieldProps('phoneNumber')}
                    className={formik.touched.phoneNumber && formik.errors.phoneNumber ? 'input-error' : ''}
                  />
                  {formik.touched.phoneNumber && formik.errors.phoneNumber && <div className="error-text">{formik.errors.phoneNumber}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="address">Alamat Pengiriman <span className="required">*</span></label>
                  <input
                    id="address"
                    type="text"
                    placeholder="Jl. Merdeka No..."
                    {...formik.getFieldProps('address')}
                    className={formik.touched.address && formik.errors.address ? 'input-error' : ''}
                  />
                  {formik.touched.address && formik.errors.address && <div className="error-text">{formik.errors.address}</div>}
                </div>
              </div>
            </form>
          </div>

          {/* Section: Add Items */}
          <div className="chart-card">
            <div className="form-section-header">
              <div className="icon-bg">👕</div>
              <h3 className="chart-title" style={{ marginBottom: 0 }}>Tambah Item Pakaian</h3>
            </div>
            
            <div className="item-picker-box">
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>Pilih Jenis Pakaian</label>
                <select
                  className="form-select"
                  value={picker.clothType}
                  onChange={(e) => setPicker({ ...picker, clothType: e.target.value, size: '' })}
                >
                  <option value="">-- Silakan Pilih Produk --</option>
                  {clothesTypes.map((t) => (
                    <option key={t.id} value={t.name}>{t.name} ({formatRupiah(t.sellingPrice)})</option>
                  ))}
                </select>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 24, marginBottom: 24 }}>
                <div className="form-group">
                  <label>Pilih Ukuran</label>
                  <div className="size-options">
                    {availableSizes.length === 0 ? (
                      <p style={{ fontSize: '0.875rem', color: 'var(--clr-text-muted)', padding: '8px 0' }}>
                        {!picker.clothType ? 'Pilih jenis pakaian untuk melihat ukuran' : 'Maaf, ukuran tidak tersedia'}
                      </p>
                    ) : (
                      availableSizes.map((s) => (
                        <label key={s} className={`size-option ${picker.size === s ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="picker-size"
                            value={s}
                            checked={picker.size === s}
                            onChange={() => setPicker({ ...picker, size: s })}
                          />
                          {s}
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Warna / Varian</label>
                  <input
                    type="text"
                    placeholder="Contoh: Navy, Cream"
                    className="form-control"
                    value={picker.color}
                    onChange={(e) => setPicker({ ...picker, color: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={picker.quantity}
                    onChange={(e) => setPicker({ ...picker, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-full"
                onClick={handleAddItem}
                disabled={!picker.clothType || !picker.size}
              >
                + Tambahkan ke Daftar Pesanan
              </button>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              Daftar Pesanan Saat Ini 
              <span style={{ fontSize: '0.8rem', background: 'var(--clr-secondary)', color: 'var(--clr-primary)', padding: '2px 8px', borderRadius: 'var(--radius-btn)' }}>
                {formik.values.items.length} Item
              </span>
            </h4>
            
            <div className="table-wrapper" style={{ border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-btn)', overflow: 'hidden' }}>
              <table className="orders-table" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ background: 'var(--clr-bg-alt)' }}>
                    <th>Produk</th>
                    <th>Ukuran</th>
                    <th>Qty</th>
                    <th>Harga</th>
                    <th>Subtotal</th>
                    <th style={{ width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {formik.values.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--clr-text-muted)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 8 }}>🛒</div>
                        Keranjang masih kosong. Tambahkan item di atas.
                      </td>
                    </tr>
                  ) : (
                    formik.values.items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>
                          {item.clothType} {item.color ? `- ${item.color}` : ''}
                        </td>
                        <td><span className="size-badge">{item.size}</span></td>
                        <td>{item.quantity}</td>
                        <td>{formatRupiah(item.price)}</td>
                        <td style={{ fontWeight: 600, color: 'var(--clr-primary)' }}>{formatRupiah(item.subtotal)}</td>
                        <td>
                          <button className="action-btn delete" onClick={() => removeItem(idx)}>🗑</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {formik.touched.items && formik.errors.items && (
              <div className="error-text" style={{ marginTop: 12 }}>{formik.errors.items as string}</div>
            )}
          </div>
        </div>

        {/* Floating Summary Panel */}
        <div className="order-summary-panel" style={{ width: 340, position: 'sticky', top: 24 }}>
          <div className="chart-card">
            <h3 className="chart-title">Ringkasan Pesanan</h3>
            <p className="chart-subtitle" style={{ marginBottom: 24 }}>
              {formik.values.customerName ? `Atas nama: ${formik.values.customerName}` : 'Masukkan data pelanggan'}
            </p>

            <div className="summary-row">
              <span>Total Qty</span>
              <span style={{ fontWeight: 600 }}>{formik.values.items.reduce((sum, item) => sum + item.quantity, 0)} pcs</span>
            </div>
            
            <div className="summary-row">
              <span>Total Jenis</span>
              <span style={{ fontWeight: 600 }}>{formik.values.items.length} jenis</span>
            </div>
            
            <div className="summary-divider" />
            
            <div className="summary-row total">
              <span>Total Bayar</span>
              <span className="price">{formatRupiah(totalAmount)}</span>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-full"
              style={{ marginTop: 24, height: 52, fontSize: '1.05rem' }}
              disabled={formik.isSubmitting || formik.values.items.length === 0}
              onClick={() => formik.handleSubmit()}
            >
              {formik.isSubmitting ? '📦 Memproses...' : '✔ Selesaikan Order'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: 12 }}>
              Pastikan semua data sudah benar sebelum menyimpan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
