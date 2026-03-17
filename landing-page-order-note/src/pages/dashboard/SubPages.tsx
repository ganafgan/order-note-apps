// Placeholder pages — to be implemented with real data later

export function TrackingPage() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tracking Order</h1>
          <p className="page-subtitle">Pantau status order secara realtime</p>
        </div>
      </div>
      <div className="chart-card">
        <div className="empty-state">
          <span>📍</span>
          <p>Fitur tracking order akan segera hadir.</p>
        </div>
      </div>
    </div>
  );
}

export function CustomersPage() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pelanggan</h1>
          <p className="page-subtitle">Data seluruh pelanggan Anda</p>
        </div>
        <button className="btn btn-primary" id="btn-add-customer">+ Tambah Pelanggan</button>
      </div>
      <div className="chart-card">
        <div className="empty-state">
          <span>👥</span>
          <p>Belum ada pelanggan tercatat.</p>
        </div>
      </div>
    </div>
  );
}

export function InvoicesPage() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoice</h1>
          <p className="page-subtitle">Kelola invoice dan tagihan</p>
        </div>
        <button className="btn btn-primary" id="btn-create-invoice">+ Buat Invoice</button>
      </div>
      <div className="chart-card">
        <div className="empty-state">
          <span>🧾</span>
          <p>Belum ada invoice yang dibuat.</p>
        </div>
      </div>
    </div>
  );
}

export function PaymentsPage() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pembayaran</h1>
          <p className="page-subtitle">Rekap dan riwayat pembayaran</p>
        </div>
      </div>
      <div className="chart-card">
        <div className="empty-state">
          <span>💳</span>
          <p>Belum ada data pembayaran.</p>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : { fullname: '', email: '' };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Informasi akun Anda</p>
        </div>
      </div>
      <div className="chart-card" style={{ maxWidth: 560 }}>
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {user.fullname ? user.fullname.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
          </div>
          <div>
            <h3>{user.fullname}</h3>
            <p>{user.email}</p>
          </div>
        </div>
        <div className="profile-form">
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input type="text" defaultValue={user.fullname} readOnly className="readonly-input" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" defaultValue={user.email} readOnly className="readonly-input" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengaturan</h1>
          <p className="page-subtitle">Konfigurasi aplikasi Anda</p>
        </div>
      </div>
      <div className="chart-card" style={{ maxWidth: 560 }}>
        <div className="empty-state">
          <span>⚙️</span>
          <p>Halaman pengaturan akan segera tersedia.</p>
        </div>
      </div>
    </div>
  );
}
