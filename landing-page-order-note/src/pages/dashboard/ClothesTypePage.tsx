import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getClothesTypes, createClothesType, deleteClothesType } from '../../api/clothesTypeApi';
import type { ClothesTypeItem } from '../../api/clothesTypeApi';
import ConfirmDialog from '../../components/ConfirmDialog';

function formatRupiah(val: number) {
  return 'Rp ' + Number(val).toLocaleString('id-ID');
}

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, 'Nama minimal 3 karakter')
    .required('Nama pakaian wajib diisi'),
  basePrice: Yup.number()
    .min(0, 'Harga dasar tidak boleh negatif')
    .required('Harga dasar wajib diisi'),
  sellingPrice: Yup.number()
    .min(Yup.ref('basePrice'), 'Harga jual harus lebih besar dari harga dasar')
    .required('Harga jual wajib diisi'),
  sizes: Yup.array()
    .min(1, 'Minimal harus ada 1 ukuran')
    .required('Ukuran wajib ada'),
});

export default function ClothesTypePage() {
  const [items, setItems] = useState<ClothesTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Custom dialog state
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: '',
  });

  const [sizeInput, setSizeInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getClothesTypes();
      setItems(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: '',
      basePrice: '' as any,
      sellingPrice: '' as any,
      sizes: [] as string[],
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setSubmitting(true);
        setServerError('');
        await createClothesType({
          name: values.name,
          basePrice: Number(values.basePrice),
          sellingPrice: Number(values.sellingPrice),
          sizes: values.sizes,
        });
        setIsModalOpen(false);
        resetForm();
        fetchItems();
      } catch (err: any) {
        setServerError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleAddSize = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && sizeInput.trim()) {
      e.preventDefault();
      const val = sizeInput.trim().toUpperCase();
      if (!formik.values.sizes.includes(val)) {
        formik.setFieldValue('sizes', [...formik.values.sizes, val]);
      }
      setSizeInput('');
    }
  };

  const removeSize = (s: string) => {
    formik.setFieldValue('sizes', formik.values.sizes.filter(x => x !== s));
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await deleteClothesType(confirmDelete.id);
      setConfirmDelete({ isOpen: false, id: '', name: '' });
      fetchItems();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const profit = (Number(formik.values.sellingPrice) || 0) - (Number(formik.values.basePrice) || 0);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Master Jenis Pakaian</h1>
          <p className="page-subtitle">Kelola daftar jenis pakaian dan kalkulasi keuntungan</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Tambah Jenis
        </button>
      </div>

      <div className="chart-card">
        {loading ? (
          <div className="empty-state"><span>⏳</span><p>Memuat data...</p></div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <span>👕</span>
            <p>Belum ada data jenis pakaian. Klik "+ Tambah Jenis" untuk memulai.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Nama Pakaian</th>
                  <th>Ukuran</th>
                  <th>Harga Dasar</th>
                  <th>Harga Jual</th>
                  <th>Keuntungan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const itemProfit = item.sellingPrice - item.basePrice;
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {item.sizes.map(s => (
                            <span key={s} className="size-badge">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td>{formatRupiah(item.basePrice)}</td>
                      <td>{formatRupiah(item.sellingPrice)}</td>
                      <td>
                        <span style={{ color: itemProfit >= 0 ? 'var(--clr-success)' : 'var(--clr-danger)', fontWeight: 600 }}>
                          {formatRupiah(itemProfit)}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="action-btn delete" 
                          onClick={() => setConfirmDelete({ isOpen: true, id: item.id, name: item.name })}
                          title="Hapus"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Addition Modal */}
      {isModalOpen && (
        <div className="dialog-overlay">
          <div className="dialog-box" style={{ maxWidth: 500 }}>
            <div className="dialog-header">
              <h3>Tambah Jenis Pakaian</h3>
              <button className="close-btn" onClick={() => { setIsModalOpen(false); formik.resetForm(); }}>✕</button>
            </div>
            
            <form onSubmit={formik.handleSubmit} className="order-form">
              {serverError && <div className="alert-danger" style={{ marginBottom: 12 }}>{serverError}</div>}
              
              <div className="form-group">
                <label>Nama Pakaian</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Kemeja Knit"
                  {...formik.getFieldProps('name')}
                  className={formik.touched.name && formik.errors.name ? 'input-error' : ''}
                />
                {formik.touched.name && formik.errors.name && <div className="error-text">{formik.errors.name}</div>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Harga Dasar (Rp)</label>
                  <input 
                    type="number" 
                    placeholder="100000"
                    {...formik.getFieldProps('basePrice')}
                    className={formik.touched.basePrice && formik.errors.basePrice ? 'input-error' : ''}
                  />
                  {formik.touched.basePrice && formik.errors.basePrice && <div className="error-text">{String(formik.errors.basePrice)}</div>}
                </div>
                <div className="form-group">
                  <label>Harga Jual (Rp)</label>
                  <input 
                    type="number" 
                    placeholder="150000"
                    {...formik.getFieldProps('sellingPrice')}
                    className={formik.touched.sellingPrice && formik.errors.sellingPrice ? 'input-error' : ''}
                  />
                  {formik.touched.sellingPrice && formik.errors.sellingPrice && <div className="error-text">{String(formik.errors.sellingPrice)}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>Rangkuman Keuntungan</label>
                <div style={{ 
                  padding: '12px 16px', 
                  background: 'var(--clr-bg-alt)', 
                  borderRadius: 8,
                  fontWeight: 600,
                  color: profit >= 0 ? 'var(--clr-success)' : 'var(--clr-danger)',
                  border: '1px dashed var(--clr-border)'
                }}>
                  Estimasi Keuntungan: {formatRupiah(profit)}
                </div>
              </div>

              <div className="form-group">
                <label>Ukuran (Tekan Enter untuk menambah)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {formik.values.sizes.map(s => (
                    <span key={s} className="size-badge" style={{ 
                      padding: '4px 10px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6,
                      background: 'var(--clr-primary)',
                      color: '#fff'
                    }}>
                      {s} <span onClick={() => removeSize(s)} style={{ cursor: 'pointer', opacity: 0.8 }}>✕</span>
                    </span>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={sizeInput} 
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={handleAddSize}
                  placeholder="Ketik S, M, L, dll"
                  className={formik.touched.sizes && formik.errors.sizes ? 'input-error' : ''}
                />
                {formik.touched.sizes && formik.errors.sizes && <div className="error-text">{formik.errors.sizes as string}</div>}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary btn-full" onClick={() => { setIsModalOpen(false); formik.resetForm(); }}>Batal</button>
                <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Jenis Pakaian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Hapus Jenis Pakaian"
        message={`Apakah Anda yakin ingin menghapus "${confirmDelete.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: '', name: '' })}
        isLoading={submitting}
      />
    </div>
  );
}
