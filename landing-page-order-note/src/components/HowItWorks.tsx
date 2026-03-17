export default function HowItWorks() {
  return (
    <section id="cara-kerja" className="info section">
      <div className="container container-flex">
        <div className="info-visual">
          <div className="info-card">
            <div className="info-card-header">Target Pendapatan</div>
            <div className="progress-bar">
              <div className="progress" style={{ width: '75%' }}></div>
            </div>
            <p>75% tercapai bulan ini</p>
          </div>
        </div>
        <div className="info-content">
          <h2>Fokus pada Ekspansi, Biarkan Kami Mengurus Catatan.</h2>
          <p>
            Menyiapkan NoteOrder sangat mudah. Hanya dalam beberapa menit, Anda bisa langsung mentransformasi cara kerja Anda dari lembaran excel yang rumit menjadi aplikasi berbasis automasi penuh.
          </p>
          <ul className="checklist">
            <li>✓ Daftar menggunakan email bisnis Anda.</li>
            <li>✓ Hubungkan akun toko e-commerce Anda.</li>
            <li>✓ Duduk santai, semua akan tersinkronisasi.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
