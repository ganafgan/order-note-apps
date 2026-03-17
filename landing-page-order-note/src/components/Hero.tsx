export default function Hero() {
  return (
    <header id="beranda" className="hero section">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="tagline">Solusi Bisnis E-Commerce</div>
          <h1>Kelola Pesanan Lebih Rapi & Elegan.</h1>
          <p>
            Ucapkan selamat tinggal pada pencatatan manual yang berantakan. NoteOrder membantu Anda melacak, mencatat, dan mengelola semua pesanan e-commerce dari satu dashboard yang hangat dan intuitif.
          </p>
          <div className="hero-buttons">
            <a href="#daftar" className="btn btn-primary btn-large">Mulai Sekarang</a>
            <a href="#fitur" className="btn btn-secondary btn-large">Pelajari Fitur</a>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="dashboard-mockup">
            <div className="mockup-header">
              <div className="dots">
                <span></span><span></span><span></span>
              </div>
              <div className="mockup-search"></div>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="line"></div>
                <div className="line short"></div>
                <div className="line"></div>
              </div>
              <div className="mockup-main">
                <div className="mockup-card">
                  <div className="card-title">Total Pesanan</div>
                  <div className="card-value">1,245</div>
                </div>
                <div className="mockup-list">
                  <div className="list-item">
                    <div className="item-id">#ORD-9021</div>
                    <div className="item-status success">Selesai</div>
                  </div>
                  <div className="list-item">
                    <div className="item-id">#ORD-9022</div>
                    <div className="item-status pending">Diproses</div>
                  </div>
                  <div className="list-item">
                    <div className="item-id">#ORD-9023</div>
                    <div className="item-status warning">Menunggu</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="blob"></div>
        </div>
      </div>
    </header>
  );
}
