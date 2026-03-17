import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ErrorDialog from '../components/ErrorDialog';
import { loginUser } from '../api/authApi';

export default function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Format email tidak valid')
        .required('Email wajib diisi'),
      password: Yup.string()
        .required('Password wajib diisi'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        const data = await loginUser(values.email, values.password);

        // Simpan token dan info user ke localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        navigate('/dashboard');
      } catch (err: any) {
        setServerError(err.message || 'Terjadi kesalahan pada server');
        setIsDialogOpen(true);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="auth-container">
      <ErrorDialog 
        isOpen={isDialogOpen} 
        message={serverError} 
        onClose={() => setIsDialogOpen(false)} 
      />
      
      <div className="auth-card">
        <Link to="/" className="auth-logo logo">NoteOrder.</Link>
        <div className="auth-header">
          <h2>Selamat Datang Kembali</h2>
          <p>Masuk ke akun NoteOrder Anda</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...formik.getFieldProps('email')}
              className={formik.touched.email && formik.errors.email ? 'input-error' : ''}
              placeholder="nama@email.com"
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="error-text">{formik.errors.email}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...formik.getFieldProps('password')}
              className={formik.touched.password && formik.errors.password ? 'input-error' : ''}
              placeholder="••••••••"
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="error-text">{formik.errors.password}</div>
            ) : null}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Belum punya akun? <Link to="/register">Daftar sekarang</Link></p>
        </div>
      </div>
    </div>
  );
}
