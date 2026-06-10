import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, BookOpen, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
      toast.success('Đăng nhập thành công!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* ── Left Brand Panel (Desktop) ─────────────────── */}
      <div className="auth-brand-panel">
        <div className="auth-brand-bg" />
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div className="auth-brand-grid" />

        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <div className="auth-logo-icon"><BookOpen size={28} color="white" /></div>
            <div>
              <div className="auth-logo-name">Hội Sinh Viên</div>
              <div className="auth-logo-sub"></div>
            </div>
          </div>

          <div className="auth-brand-headline">
            <h1>Hệ thống AI<br /><span className="auth-brand-accent">Sinh viên 5 tốt</span></h1>
            <p>Nền tảng thông minh giúp sinh viên tỉnh Đắk Lắk quản lý hồ sơ, nộp minh chứng và theo dõi tiến độ xét danh hiệu 5 tốt một cách dễ dàng.</p>
          </div>

          <div className="auth-criteria-grid">
            {[
              { emoji: '🛡️', label: 'Đạo đức tốt', color: '#818cf8' },
              { emoji: '📚', label: 'Học tập tốt', color: '#34d399' },
              { emoji: '💪', label: 'Thể lực tốt', color: '#fbbf24' },
              { emoji: '❤️', label: 'Tình nguyện tốt', color: '#f87171' },
              { emoji: '🌍', label: 'Hội nhập tốt', color: '#c084fc' },
            ].map(c => (
              <div key={c.label} className="auth-criteria-badge" style={{ '--badge-color': c.color }}>
                <span>{c.emoji}</span><span>{c.label}</span>
              </div>
            ))}
          </div>

          <div className="auth-stats">
            {[{ value: '6+', label: 'Trường tham gia' }, { value: '5', label: 'Tiêu chí đánh giá' }, { value: 'AI', label: 'Tự động OCR' }].map(s => (
              <div key={s.label} className="auth-stat-item">
                <div className="auth-stat-value">{s.value}</div>
                <div className="auth-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right / Mobile Full Panel ───────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-form-container">

          {/* Mobile: Top Bar */}
          <div className="auth-mobile-logo">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="auth-logo-icon"><BookOpen size={20} color="white" /></div>
              <div className="auth-logo-name">Hội Sinh Viên</div>
            </div>
          </div>

          {/* Mobile: Hero text */}
          <div className="auth-mobile-hero">
            <div className="auth-mobile-hero-title">
              Chào mừng<br />trở lại! 👋
            </div>
            <div className="auth-mobile-hero-sub">Đăng nhập để tiếp tục hành trình Sinh viên 5 tốt</div>
          </div>

          {/* Glass card (mobile: bottom sheet style) */}
          <div className="auth-form-card">
            {/* Desktop header */}
            <div className="auth-form-header auth-desktop-only">
              <h2 className="auth-form-title">Chào mừng trở lại!</h2>
              <p className="auth-form-subtitle">Đăng nhập để tiếp tục hành trình Sinh viên 5 tốt</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">✉️</span>
                  <input
                    id="login-email"
                    type="email"
                    className="auth-input"
                    placeholder="email@truong.edu.vn"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Mật khẩu</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔑</span>
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: 48 }}
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button id="login-submit" type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? <><Loader2 size={18} className="spin" />Đang đăng nhập...</> : <>Đăng nhập <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="auth-divider"><span>hoặc</span></div>

            <div className="auth-demo-box">
              <div className="auth-demo-label">🎯 Tài khoản demo — click để điền</div>
              <div className="auth-demo-accounts">
                {[
                  { role: 'Sinh viên', email: 'student@demo.vn', pass: 'password123', icon: '🎓' },
                  { role: 'Cán bộ Hội', email: 'admin@demo.vn', pass: 'password123', icon: '👨‍💼' },
                ].map(acc => (
                  <button
                    key={acc.role}
                    className="auth-demo-btn"
                    onClick={() => {
                      setForm({ email: acc.email, password: acc.pass });
                      toast(`Đã điền tài khoản ${acc.role}`, { icon: acc.icon });
                    }}
                  >
                    <span>{acc.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{acc.role}</div>
                      <div style={{ fontSize: 11, opacity: 0.6 }}>{acc.email}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <p className="auth-switch-text">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="auth-switch-link">Đăng ký ngay →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
