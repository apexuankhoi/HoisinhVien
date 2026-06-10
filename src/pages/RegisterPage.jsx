import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { BookOpen, User, Mail, Lock, Phone, Hash } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', phone: '', student_id: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Đang xử lý đăng ký...');
    try {
      await api.post('/auth/register', form);
      toast.success('Đăng ký thành công! Hãy đăng nhập.', { id: toastId });
      navigate('/login');
    } catch (err) {
      toast.error(typeof err.response?.data?.error === 'string' ? err.response.data.error : 'Đăng ký thất bại, vui lòng thử lại', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--gray-50)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card animate-fade-in" style={{ maxWidth: 500, width: '100%', padding: '40px 32px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, background: '#eff6ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <BookOpen size={24} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-900)' }}>Tạo tài khoản</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Bắt đầu hành trình Sinh viên 5 tốt</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: 14, color: 'var(--gray-400)' }}><User size={18} /></span>
              <input type="text" className="form-input" style={{ paddingLeft: 40 }} placeholder="Nguyễn Văn A" required
                value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: 16 }}>
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
                <input type="password" className="form-input" style={{ paddingLeft: 40 }} placeholder="Tối thiểu 8 ký tự" required minLength={8}
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: 14, color: 'var(--gray-400)' }}><Phone size={18} /></span>
                <input type="text" className="form-input" style={{ paddingLeft: 40 }} placeholder="09xxxx" required
                  value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Mã sinh viên</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: 14, color: 'var(--gray-400)' }}><Hash size={18} /></span>
                <input type="text" className="form-input" style={{ paddingLeft: 40 }} placeholder="SV202..." required
                  value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 12, padding: 14 }} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--gray-600)' }}>
          Đã có tài khoản? <Link to="/login" className="text-primary font-medium">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
