import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ErrorDialog from '../components/ErrorDialog';
import { registerUser } from '../api/authApi';

export default function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullname: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      fullname: Yup.string()
        .min(3, 'Nama lengkap minimal 3 karakter')
        .required('Nama lengkap wajib diisi'),
      email: Yup.string()
        .email('Format email tidak valid')
        .required('Email wajib diisi'),
      password: Yup.string()
        .min(6, 'Password minimal 6 karakter')
        .required('Password wajib diisi'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Password tidak cocok')
        .required('Konfirmasi password wajib diisi'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        await registerUser(values.fullname, values.email, values.password);

        // Registrasi berhasil, arahkan ke login
        navigate('/login');
      } catch (err: any) {
        setServerError(err.message || 'Terjadi kesalahan saat pendaftaran');
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
          <h2>Buat Akun Baru</h2>
          <p>Mulai kelola pesanan Anda hari ini</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullname">Nama Lengkap</label>
            <input
              id="fullname"
              type="text"
              {...formik.getFieldProps('fullname')}
              className={formik.touched.fullname && formik.errors.fullname ? 'input-error' : ''}
              placeholder="John Doe"
            />
            {formik.touched.fullname && formik.errors.fullname ? (
              <div className="error-text">{formik.errors.fullname}</div>
            ) : null}
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">Konfirmasi Password</label>
            <input
              id="confirmPassword"
              type="password"
              {...formik.getFieldProps('confirmPassword')}
              className={formik.touched.confirmPassword && formik.errors.confirmPassword ? 'input-error' : ''}
              placeholder="••••••••"
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <div className="error-text">{formik.errors.confirmPassword}</div>
            ) : null}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Sudah punya akun? <Link to="/login">Masuk di sini</Link></p>
        </div>
      </div>
    </div>
  );
}
