export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <a href="#" className="logo">NoteOrder.</a>
          <p>Pencatatan cerdas untuk pegiat e-commerce modern yang menghargai waktu dan estetika.</p>
        </div>
        <div className="footer-links">
          <div className="link-group">
            <h4>Produk</h4>
            <ul>
              <li><a href="#">Fitur</a></li>
              <li><a href="#">Harga</a></li>
              <li><a href="#">Integrasi</a></li>
            </ul>
          </div>
          <div className="link-group">
            <h4>Perusahaan</h4>
            <ul>
              <li><a href="#">Tentang Kami</a></li>
              <li><a href="#">Karir</a></li>
              <li><a href="#">Kontak</a></li>
            </ul>
          </div>
          <div className="link-group">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Syarat & Ketentuan</a></li>
              <li><a href="#">Kebijakan Privasi</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 NoteOrder. Hak Cipta Dilindungi Undang-Undang.</p>
      </div>
    </footer>
  );
}
