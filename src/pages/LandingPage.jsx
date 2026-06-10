import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, BookOpen, Star, Shield, Globe } from 'lucide-react';

export default function LandingPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('landing'); // 'landing' | 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', full_name: '', student_id: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
      toast.success('Đăng nhập thành công!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
      toast.success('Đăng ký thành công!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const five = [
    { emoji: '🛡️', label: 'Đạo đức tốt', desc: 'Lối sống trong sáng', color: '#6366f1' },
    { emoji: '📚', label: 'Học tập tốt', desc: 'GPA 3.2+ trở lên', color: '#10b981' },
    { emoji: '💪', label: 'Thể lực tốt', desc: 'Sức khỏe toàn diện', color: '#f59e0b' },
    { emoji: '❤️', label: 'Tình nguyện tốt', desc: '20+ giờ tình nguyện', color: '#ef4444' },
    { emoji: '🌍', label: 'Hội nhập tốt', desc: 'Kỹ năng quốc tế', color: '#8b5cf6' },
  ];

  if (mode === 'login') {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--gradient-hero)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, position: 'relative', overflow: 'hidden'
      }}>
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
        <div className="hero-grid" />

        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
          <div className="card animate-slide-up" style={{ padding: 36 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 56, height: 56, background: 'var(--gradient-primary)',
                borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', boxShadow: 'var(--shadow-glow)'
              }}>
                <BookOpen size={26} color="white" />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 4 }}>
                Chào mừng trở lại!
              </h1>
              <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>
                Đăng nhập vào Hội Sinh Viên
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email <span className="required">*</span></label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="email@truong.edu.vn"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu <span className="required">*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', color: 'var(--gray-400)', cursor: 'pointer'
                    }}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
                style={{ marginTop: 8 }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14 }}>
              <span style={{ color: 'var(--gray-500)' }}>Chưa có tài khoản? </span>
              <button
                onClick={() => setMode('register')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontWeight: 700, cursor: 'pointer' }}
              >
                Đăng ký ngay
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button
                onClick={() => setMode('landing')}
                style={{ background: 'none', border: 'none', color: 'var(--gray-400)', fontSize: 13, cursor: 'pointer' }}
              >
                ← Về trang chủ
              </button>
            </div>
          </div>

          {/* Demo Account */}
          <div style={{
            marginTop: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, textAlign: 'center'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
              🎯 <strong style={{ color: 'white' }}>Demo:</strong> student@demo.vn / password123
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--gradient-hero)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, position: 'relative', overflow: 'hidden'
      }}>
        <div className="orb orb-1" /><div className="orb orb-2" />
        <div className="hero-grid" />

        <div style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>
          <div className="card animate-slide-up" style={{ padding: 36 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Tạo tài khoản mới</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 24 }}>
              Đăng ký để bắt đầu hành trình Sinh viên 5 tốt
            </p>

            <form onSubmit={handleRegister}>
              <div className="grid grid-2" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Họ và tên <span className="required">*</span></label>
                  <input
                    id="reg-name"
                    type="text"
                    className="form-input"
                    placeholder="Nguyễn Văn A"
                    value={form.full_name}
                    onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mã sinh viên</label>
                  <input
                    id="reg-msv"
                    type="text"
                    className="form-input"
                    placeholder="VD: DH20123456"
                    value={form.student_id}
                    onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email <span className="required">*</span></label>
                <input
                  id="reg-email"
                  type="email"
                  className="form-input"
                  placeholder="email@truong.edu.vn"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mật khẩu <span className="required">*</span></label>
                <input
                  id="reg-password"
                  type="password"
                  className="form-input"
                  placeholder="Ít nhất 8 ký tự"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu <span className="required">*</span></label>
                <input
                  id="reg-confirm"
                  type="password"
                  className="form-input"
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirm_password}
                  onChange={e => setForm(p => ({ ...p, confirm_password: e.target.value }))}
                  required
                />
              </div>

              <button
                id="register-submit"
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                {loading ? 'Đang tạo tài khoản...' : '🎓 Đăng ký'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
              <span style={{ color: 'var(--gray-500)' }}>Đã có tài khoản? </span>
              <button
                onClick={() => setMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontWeight: 700, cursor: 'pointer' }}
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landing Page
  return (
    <div style={{ background: 'var(--gray-900)', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '14px 40px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--gradient-primary)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <BookOpen size={18} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>Hội Sinh Viên</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setMode('login')}
            className="btn btn-ghost"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setMode('register')}
            className="btn btn-primary btn-sm"
          >
            Đăng ký ngay
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <div className="hero-bg-pattern" />
        <div className="hero-grid" />
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 900, padding: '0 20px' }}>
          <div className="chip" style={{ marginBottom: 24, display: 'inline-flex' }}>
            <Star size={14} />
            — Bảng B, Đề tài số 5
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 900,
            color: 'white',
            lineHeight: 1.15,
            marginBottom: 20
          }}>
            Hệ thống AI quản lý{' '}
            <span style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Sinh viên 5 tốt
            </span>
            <br />tỉnh Đắk Lắk
          </h1>

          <p style={{
            fontSize: 18, color: 'rgba(255,255,255,0.65)',
            maxWidth: 640, margin: '0 auto 36px', lineHeight: 1.7
          }}>
            Nền tảng AI tích hợp VNPT eKYC, SmartReader OCR và Smartbot —
            tự động hóa toàn bộ quy trình nộp hồ sơ, xét duyệt danh hiệu
            và cá nhân hóa lộ trình phấn đấu cho từng sinh viên.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <button
              onClick={() => setMode('register')}
              className="btn btn-accent btn-lg"
              id="hero-cta"
            >
              🚀 Bắt đầu ngay — Miễn phí
            </button>
            <button
              onClick={() => setMode('login')}
              className="btn btn-outline btn-lg"
            >
              Đăng nhập
            </button>
          </div>

          {/* 5 Criteria */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {five.map(item => (
              <div
                key={item.label}
                className="card-glass"
                style={{
                  padding: '16px 20px', display: 'flex', alignItems: 'center',
                  gap: 10, borderRadius: 14, minWidth: 160
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${item.color}22`,
                  border: `1px solid ${item.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18
                }}>{item.emoji}</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{item.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ background: 'white', padding: '80px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: 'var(--gray-900)', marginBottom: 12 }}>
              Công nghệ AI tiên tiến
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
              Tận dụng toàn bộ hệ sinh thái API VNPT do Ban tổ chức cung cấp
            </p>
          </div>

          <div className="grid grid-4" style={{ gap: 24 }}>
            {[
              { icon: '🪪', title: 'VNPT eKYC', desc: 'Xác thực danh tính qua CCCD/Thẻ sinh viên. Tự động điền thông tin hồ sơ.' },
              { icon: '🔍', title: 'SmartReader OCR', desc: 'AI tự động đọc và trích xuất nội dung từ giấy khen, chứng nhận.' },
              { icon: '🤖', title: 'Smartbot AI', desc: 'Trợ lý ảo hỏi đáp quy chế 5 tốt. Tư vấn lộ trình cá nhân hóa.' },
              { icon: '📱', title: 'Zalo OTT', desc: 'Thông báo tự động qua Zalo. Nhắc nhở tiêu chí còn thiếu.' },
            ].map(f => (
              <div key={f.title} className="card" style={{ textAlign: 'center', padding: 28 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{
        background: 'var(--gradient-primary)',
        padding: '60px 40px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: 'white', fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
          Sẵn sàng cho ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, marginBottom: 28 }}>
          Hệ Sinh viên Đắk Lắk — Giải pháp AI đột phá cho Hội Sinh viên
        </p>
        <button
          onClick={() => setMode('register')}
          className="btn btn-accent btn-lg"
        >
          🎓 Đăng ký tài khoản ngay
        </button>
      </div>

      <footer style={{
        background: 'var(--gray-900)', color: 'rgba(255,255,255,0.4)',
        textAlign: 'center', padding: '24px 20px', fontSize: 13
      }}>
        © 2026 Hội Sinh Viên ·  · CLB Sinh viên 5 tốt tỉnh Đắk Lắk
      </footer>
    </div>
  );
}
