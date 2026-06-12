import { useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập token + mật khẩu
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Vui lòng nhập email'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message);
      // Nếu dev mode trả token về
      if (res.data.reset_token) {
        setToken(res.data.reset_token);
        toast('🔑 Token dev: ' + res.data.reset_token.substring(0, 16) + '...', { duration: 8000, icon: '🛠️' });
      }
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token) { toast.error('Vui lòng nhập token xác nhận'); return; }
    if (newPassword.length < 8) { toast.error('Mật khẩu phải có ít nhất 8 ký tự'); return; }
    if (newPassword !== confirmPassword) { toast.error('Mật khẩu xác nhận không khớp'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, new_password: newPassword });
      toast.success('Đặt lại mật khẩu thành công! Đang chuyển hướng...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Token không hợp lệ hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--gray-50)', padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 16px'
          }}>
            🔐
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 6 }}>
            {step === 1 ? 'Quên mật khẩu?' : 'Đặt lại mật khẩu'}
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>
            {step === 1
              ? 'Nhập email để nhận hướng dẫn khôi phục mật khẩu'
              : 'Nhập token xác nhận và mật khẩu mới của bạn'}
          </p>
        </div>

        <div className="card" style={{ padding: '32px 28px' }}>
          {step === 1 ? (
            <form onSubmit={handleSendRequest}>
              <div className="form-group">
                <label className="form-label">Địa chỉ email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--gray-400)'
                  }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: 40 }}
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
                {loading ? '⏳ Đang xử lý...' : '📧 Gửi yêu cầu đặt lại'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Link to="/login" style={{ color: 'var(--gray-500)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                  <ArrowLeft size={14} /> Quay lại đăng nhập
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">Token xác nhận</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Dán token từ email vào đây"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: 13 }}
                  autoFocus
                />
                <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                  Token hết hạn sau 15 phút kể từ khi gửi yêu cầu
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--gray-400)'
                  }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: 40, paddingRight: 40 }}
                    placeholder="Ít nhất 8 ký tự"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button type="button"
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
                    onClick={() => setShowPw(p => !p)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>Mật khẩu không khớp</p>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
                {loading ? '⏳ Đang đặt lại...' : '🔐 Đặt lại mật khẩu'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <button type="button" onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', color: 'var(--gray-500)', fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <ArrowLeft size={14} /> Quay lại nhập email
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: 12, marginTop: 20 }}>
          Hội Sinh Viên Đắk Lắk © 2025 · Sinh viên 5 tốt
        </p>
      </div>
    </div>
  );
}
