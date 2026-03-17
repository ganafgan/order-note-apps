import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (targetId === '#') return;
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="container nav-container">
        <a href="#" className="logo">NoteOrder.</a>
        <ul className="nav-links">
          <li><a href="#beranda" onClick={(e) => handleScrollTo(e, '#beranda')}>Beranda</a></li>
          <li><a href="#fitur" onClick={(e) => handleScrollTo(e, '#fitur')}>Fitur</a></li>
          <li><a href="#cara-kerja" onClick={(e) => handleScrollTo(e, '#cara-kerja')}>Cara Kerja</a></li>
        </ul>
        <div className="nav-actions">
          <Link to="/login" className="nav-link">Masuk</Link>
          <Link to="/register" className="btn btn-primary">Mulai Gratis</Link>
        </div>
      </div>
    </nav>
  );
}
