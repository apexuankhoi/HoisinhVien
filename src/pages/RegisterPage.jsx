import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, BookOpen, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

const STEPS = [
  { label: 'Tài khoản', icon: '📝' },
  { label: 'Cá nhân', icon: '👤' },
  { label: 'Hoàn tất', icon: '🚀' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '',
    student_id: '', phone: '', gender: '', date_of_birth: '',
    academic_year: '', class_name: '', cccd: '', hometown: '', address: ''
  });
  const [kycLoading, setKycLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleKycUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setKycLoading(true);
    const formData = new FormData();
    formData.append('cccd', file);

    const tid = toast.loading('🔍 Đang nhờ AI đọc Thẻ sinh viên của bạn...');
    try {
      const res = await api.post('/auth/ekyc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = res.data;
      
      let dob = form.date_of_birth;
      if (data.dateOfBirth) {
        // Chuyển DD/MM/YYYY sang YYYY-MM-DD
        const parts = data.dateOfBirth.split('/');
        if (parts.length === 3) dob = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      setForm(p => ({
        ...p,
        full_name: data.fullName || p.full_name,
        cccd: data.cccd || p.cccd,
        date_of_birth: dob,
        gender: data.gender === 'Nam' ? 'male' : data.gender === 'Nữ' ? 'female' : p.gender,
        hometown: data.hometown || p.hometown,
        address: data.address || p.address
      }));
      toast.success('✨ AI đã điền tự động dữ liệu thành công!', { id: tid });
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI không đọc được thẻ này. Xin thử lại.', { id: tid });
    } finally {
      setKycLoading(false);
      e.target.value = '';
    }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validateStep0 = () => {
    if (!form.full_name.trim()) { toast.error('Vui lòng nhập họ và tên'); return false; }
    if (!form.email.trim()) { toast.error('Vui lòng nhập email'); return false; }
    if (!form.password) { toast.error('Vui lòng nhập mật khẩu'); return false; }
    if (form.password.length < 8) { toast.error('Mật khẩu phải có ít nhất 8 ký tự'); return false; }
    if (form.password !== form.confirm_password) { toast.error('Mật khẩu xác nhận không khớp'); return false; }
    return true;
  };

  const nextStep = () => {
    if (step === 0 && !validateStep0()) return;
    setStep(s => Math.min(s + 1, 2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 2) { nextStep(); return; }
    const payload = { ...form, email: form.email.trim().toLowerCase() };
    setLoading(true);
    const toastId = toast.loading('Đang xử lý đăng ký...');
    try {
      await register(payload);
      navigate('/dashboard');
      toast.success('Đăng ký thành công! Chào mừng bạn! 🎉', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Đăng ký thất bại', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const heroTexts = [
    { title: 'Tạo tài khoản\nmiễn phí! ✨', sub: 'Bước 1/3 — Điền thông tin đăng nhập' },
    { title: 'Thêm thông tin\ncủa bạn 👤', sub: 'Bước 2/3 — Thông tin cá nhân (có thể bỏ qua)' },
    { title: 'Gần xong rồi! 🎉', sub: 'Bước 3/3 — Xác nhận và tạo tài khoản' },
  ];

  return (
    <div className="auth-layout auth-layout-register">
      {/* ── Left Brand Panel (Desktop only) ─────── */}
      <div className="auth-brand-panel">
        <div className="auth-brand-bg" />
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-brand-grid" />

        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <div className="auth-logo-icon" style={{ background: 'transparent' }}><img src="/logo.png" alt="Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} /></div>
            <div>
              <div className="auth-logo-name">Hội Sinh Viên</div>
              <div className="auth-logo-sub"></div>
            </div>
          </div>

          <div className="auth-brand-headline">
            <h1>Bắt đầu hành trình<br /><span className="auth-brand-accent">Sinh viên 5 tốt</span></h1>
            <p>Tạo tài khoản miễn phí và nhận hỗ trợ từ AI để hoàn thiện hồ sơ 5 tốt của bạn.</p>
          </div>

          <div className="auth-steps-preview">
            {STEPS.map((s, i) => (
              <div key={i} className={`auth-step-preview ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                <div className="auth-step-num">
                  {i < step ? <CheckCircle size={16} /> : <span>{i + 1}</span>}
                </div>
                <div>
                  <div className="auth-step-title">{s.icon} {s.label}</div>
                  <div className="auth-step-desc">
                    {['Email, mật khẩu', 'MSV, trường, lớp', 'Xác nhận thông tin'][i]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right / Mobile Full Panel ─────────────── */}
      <div className="auth-form-panel">
        <div className="auth-form-container">

          {/* Mobile: Top Bar */}
          <div className="auth-mobile-logo">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="auth-logo-icon" style={{ background: 'transparent' }}><img src="/logo.png" alt="Logo" style={{ width: 24, height: 24, objectFit: 'contain' }} /></div>
              <div className="auth-logo-name">Hội Sinh Viên</div>
            </div>
          </div>

          {/* Mobile: Hero + Step Dots */}
          <div className="auth-mobile-hero">
            <div className="auth-mobile-hero-title" style={{ whiteSpace: 'pre-line' }}>
              {heroTexts[step].title}
            </div>
            <div className="auth-mobile-hero-sub">{heroTexts[step].sub}</div>
          </div>

          {/* Mobile step dots */}
          <div className="auth-step-dots">
            {STEPS.map((s, i) => (
              <div key={i} className={`auth-step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                {i < step ? '✓' : i + 1}
              </div>
            ))}
          </div>

          {/* Glass card */}
          <div className="auth-form-card">
            {/* Desktop header */}
            <div className="auth-form-header auth-desktop-only">
              <h2 className="auth-form-title">
                {step === 0 ? 'Tạo tài khoản' : step === 1 ? 'Thông tin của bạn' : '🎉 Gần xong rồi!'}
              </h2>
              <p className="auth-form-subtitle">{heroTexts[step].sub}</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>

              {/* ── Step 0 ── */}
              {step === 0 && (
                <>
                  {/* Nút eKYC */}
                  <div style={{ marginBottom: 20 }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      onChange={handleKycUpload} 
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary btn-full" 
                      style={{ background: 'var(--gradient-accent)', border: 'none', gap: 8, height: 48 }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={kycLoading}
                    >
                      {kycLoading ? '⏳ Đang phân tích...' : '📸 Quét Thẻ sinh viên để điền tự động'}
                    </button>
                    <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-500)', marginTop: 8 }}>
                      Chỉ với 1 chạm, AI sẽ tự động lấy thông tin từ Thẻ sinh viên
                    </div>
                  </div>
                  
                  <div className="auth-field">
                    <label className="auth-label">Họ và tên <span className="auth-req">*</span></label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">👤</span>
                      <input type="text" className="auth-input" placeholder="Nguyễn Văn A"
                        value={form.full_name} onChange={e => set('full_name', e.target.value)} autoComplete="name" />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">Email <span className="auth-req">*</span></label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">✉️</span>
                      <input type="email" className="auth-input" placeholder="email@truong.edu.vn"
                        value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">Mật khẩu <span className="auth-req">*</span></label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">🔑</span>
                      <input type={showPass ? 'text' : 'password'} className="auth-input" placeholder="Ít nhất 8 ký tự"
                        value={form.password} onChange={e => set('password', e.target.value)} style={{ paddingRight: 48 }} />
                      <button type="button" className="auth-eye-btn" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                        {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {form.password && (
                      <div className="auth-password-strength">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="auth-strength-bar" style={{
                            background: form.password.length > i * 2 + 3
                              ? form.password.length >= 12 ? '#10b981' : form.password.length >= 8 ? '#fbbf24' : '#ef4444'
                              : '#e2e8f0'
                          }} />
                        ))}
                        <span className="auth-strength-label">
                          {form.password.length < 8 ? 'Yếu' : form.password.length < 12 ? 'Vừa' : 'Mạnh'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">
                      Xác nhận mật khẩu <span className="auth-req">*</span>
                    </label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">
                        {form.confirm_password && form.confirm_password === form.password ? '✅' : '🔑'}
                      </span>
                      <input type="password" className="auth-input" placeholder="Nhập lại mật khẩu"
                        value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)}
                        style={{ borderColor: form.confirm_password && form.confirm_password !== form.password ? '#ef4444' : '' }} />
                    </div>
                  </div>
                </>
              )}

              {/* ── Step 1 ── */}
              {step === 1 && (
                <>
                  <div className="auth-row-2">
                    <div className="auth-field">
                      <label className="auth-label">Mã sinh viên</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon">🎓</span>
                        <input type="text" className="auth-input" placeholder="DH20123456"
                          value={form.student_id} onChange={e => set('student_id', e.target.value)} />
                      </div>
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">Số điện thoại</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon">📱</span>
                        <input type="tel" className="auth-input" placeholder="0912345678"
                          value={form.phone} onChange={e => set('phone', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="auth-row-2">
                    <div className="auth-field">
                      <label className="auth-label">Giới tính</label>
                      <div className="auth-select-wrap">
                        <select className="auth-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                          <option value="">-- Chọn --</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">Ngày sinh</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon">📅</span>
                        <input type="date" className="auth-input"
                          value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">Số Căn cước công dân</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">🪪</span>
                      <input type="text" className="auth-input" placeholder="012345678912"
                        value={form.cccd} onChange={e => set('cccd', e.target.value)} />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">Quê quán</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">🏡</span>
                      <input type="text" className="auth-input" placeholder="VD: Buôn Ma Thuột, Đắk Lắk"
                        value={form.hometown} onChange={e => set('hometown', e.target.value)} />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label">Nơi thường trú</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">📍</span>
                      <input type="text" className="auth-input" placeholder="VD: 123 Lê Duẩn, Tân Thành"
                        value={form.address} onChange={e => set('address', e.target.value)} />
                    </div>
                  </div>

                  <div className="auth-row-2">
                    <div className="auth-field">
                      <label className="auth-label">Khoá học</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon">📖</span>
                        <input type="text" className="auth-input" placeholder="2022-2026"
                          value={form.academic_year} onChange={e => set('academic_year', e.target.value)} />
                      </div>
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">Lớp</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon">🏫</span>
                        <input type="text" className="auth-input" placeholder="CNTT22A"
                          value={form.class_name} onChange={e => set('class_name', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <button type="button" className="auth-skip-btn" onClick={() => setStep(2)}>
                    Bỏ qua, điền sau →
                  </button>
                </>
              )}

              {/* ── Step 2 ── */}
              {step === 2 && (
                <div className="auth-confirm-box">
                  <div className="auth-confirm-avatar">
                    {form.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
                  </div>
                  <div className="auth-confirm-info">
                    {[
                      { label: 'Họ tên', value: form.full_name },
                      { label: 'Email', value: form.email },
                      { label: 'MSV', value: form.student_id || '(chưa nhập)' },
                      { label: 'Lớp', value: form.class_name || '(chưa nhập)' },
                    ].map(r => (
                      <div key={r.label} className="auth-confirm-row">
                        <span className="auth-confirm-label">{r.label}</span>
                        <span className="auth-confirm-value">{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="auth-confirm-note">
                    ✅ Bạn có thể cập nhật thêm thông tin sau khi đăng ký trong phần Hồ sơ.
                  </div>
                </div>
              )}

              {/* Nav buttons */}
              <div className={`auth-btn-row ${step > 0 ? 'has-back' : ''}`}>
                {step > 0 && (
                  <button type="button" className="auth-back-btn" onClick={() => setStep(s => s - 1)}>
                    ← Quay lại
                  </button>
                )}
                <button id="register-submit" type="submit" className="auth-submit-btn" disabled={loading} style={{ flex: 1 }}>
                  {loading
                    ? <><Loader2 size={18} className="spin" />Đang tạo tài khoản...</>
                    : step < 2
                      ? <>Tiếp theo <ArrowRight size={18} /></>
                      : <>🚀 Tạo tài khoản</>}
                </button>
              </div>
            </form>

            <p className="auth-switch-text">
              Đã có tài khoản?{' '}
              <Link to="/login" className="auth-switch-link">Đăng nhập →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
