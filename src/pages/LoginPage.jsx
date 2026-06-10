import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { BookOpen, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Đang đăng nhập...');
    try {
      await login(form.email, form.password);
      toast.success('Đăng nhập thành công!', { id: toastId });
      navigate('/dashboard');
    } catch (err) {
      toast.error(typeof err.response?.data?.error === 'string' ? err.response.data.error : 'Email hoặc mật khẩu không đúng', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--gray-50)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card animate-fade-in" style={{ maxWidth: 420, width: '100%', padding: '40px 32px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, background: '#eff6ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <BookOpen size={24} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-900)' }}>Chào mừng trở lại</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Hệ thống SV5T Đắk Lắk</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: 14, color: 'var(--gray-400)' }}><Mail size={18} /></span>
              <input type="email" className="form-input" style={{ paddingLeft: 40 }} placeholder="email@truong.vn" required
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: 14, color: 'var(--gray-400)' }}><Lock size={18} /></span>
              <input type="password" className="form-input" style={{ paddingLeft: 40 }} placeholder="••••••••" required
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 12, padding: 14 }} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--gray-600)' }}>
          Chưa có tài khoản? <Link to="/register" className="text-primary font-medium">Đăng ký ngay</Link>
        </p>

      </div>
    </div>
  );
}
