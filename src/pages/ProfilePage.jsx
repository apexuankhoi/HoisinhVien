import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Book, Upload, Camera, Lock, Eye, EyeOff, Phone, MapPin, Calendar, IdCard } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'security' | 'ekyc'

  const [profileForm, setProfileForm] = useState({
    full_name: user?.fullName || user?.full_name || '',
    phone: user?.phone || '',
    class_name: user?.className || '',
    gpa: user?.gpa || '',
  });

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false });
  const [savingPw, setSavingPw] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    const toastId = toast.loading('Đang tải ảnh lên...');
    try {
      const res = await api.post('/users/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fileUrl = res.data.avatarUrl;
      updateUser({ avatarUrl: fileUrl, avatar_url: fileUrl });
      toast.success('Cập nhật ảnh đại diện thành công!', { id: toastId });
    } catch (err) {
      toast.error('Lỗi khi tải ảnh lên.', { id: toastId });
      setAvatarPreview(user?.avatarUrl);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileForm.full_name.trim()) { toast.error('Vui lòng nhập họ tên'); return; }
    setSavingProfile(true);
    try {
      await api.put('/users/profile', {
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        class_name: profileForm.class_name,
        gpa: profileForm.gpa ? parseFloat(profileForm.gpa) : undefined,
      });
      updateUser({
        fullName: profileForm.full_name,
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        className: profileForm.class_name,
        gpa: profileForm.gpa,
      });
      toast.success('Đã cập nhật thông tin cá nhân!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi cập nhật');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.current_password) { toast.error('Nhập mật khẩu hiện tại'); return; }
    if (pwForm.new_password.length < 8) { toast.error('Mật khẩu mới phải có ít nhất 8 ký tự'); return; }
    if (pwForm.new_password !== pwForm.confirm_password) { toast.error('Mật khẩu xác nhận không khớp'); return; }
    setSavingPw(true);
    try {
      await api.post('/auth/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      toast.success('Đổi mật khẩu thành công!');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi đổi mật khẩu');
    } finally {
      setSavingPw(false);
    }
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const handleEkycCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const toastId = toast.loading('AI đang quét và phân tích CCCD...');
    try {
      const base64DataUrl = await fileToBase64(file);
      const base64Str = base64DataUrl.split(',')[1];
      const res = await api.post('/ai/ekyc', { image_base64: base64Str, mime_type: file.type });
      const { result, message } = res.data;
      if (result.valid) {
        toast.success(message || 'Xác thực thẻ CCCD thành công!', { id: toastId });
        updateUser({ ekyc_verified: true, ekycVerified: true, full_name: result.full_name || user.full_name });
      } else {
        toast.error('Ảnh không hợp lệ. Vui lòng chụp rõ mặt trước CCCD.', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi hệ thống khi phân tích ảnh', { id: toastId });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const tabs = [
    { key: 'info', label: 'Thông tin cá nhân', icon: User },
    { key: 'security', label: 'Bảo mật', icon: Lock },
    { key: 'ekyc', label: 'Xác minh eKYC', icon: Shield },
  ];

  const displayName = user?.fullName || user?.full_name || '';
  const isVerified = user?.ekycVerified || user?.ekyc_verified;

  return (
    <div className="page-container animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)' }}>Hồ sơ cá nhân</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Quản lý thông tin và thiết lập tài khoản của bạn</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {/* Avatar Card */}
        <div className="card" style={{
          flex: '0 0 280px', display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', background: 'var(--gradient-hero)', border: 'none', color: 'white'
        }}>
          <div style={{ position: 'relative', marginBottom: 20, marginTop: 20 }}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)' }} />
            ) : (
              <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 'bold', border: '4px solid rgba(255,255,255,0.2)' }}>
                {displayName[0] || 'U'}
              </div>
            )}
            <label style={{
              position: 'absolute', bottom: 0, right: 0,
              background: 'var(--primary)', color: 'white',
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'transform 0.2s ease'
            }}>
              <Upload size={15} />
              <input type="file" hidden accept="image/*" onChange={handleAvatarChange} disabled={loading} />
            </label>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{displayName}</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 }}>{user?.email}</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{user?.studentId || user?.student_id || ''}</p>

          <div style={{ marginTop: 12, padding: '6px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            {user?.role === 'student' ? '🎓 Sinh viên' : user?.role === 'admin' ? '⚙️ Admin' : user?.role === 'super_admin' ? '👑 Super Admin' : '👨‍💼 Cán bộ Hội'}
          </div>

          <div style={{ marginTop: 12, padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: isVerified ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)',
            color: isVerified ? '#6ee7b7' : 'rgba(255,255,255,0.6)' }}>
            {isVerified ? '✅ Đã xác minh eKYC' : '⚠️ Chưa xác minh'}
          </div>

          {/* Tabs */}
          <div style={{ marginTop: 20, width: '100%' }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                  background: activeTab === t.key ? 'rgba(255,255,255,0.15)' : 'transparent',
                  border: 'none', color: 'white', cursor: 'pointer', borderRadius: 10,
                  fontSize: 13, fontWeight: activeTab === t.key ? 700 : 400,
                  marginBottom: 4, transition: 'background 0.2s'
                }}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ flex: '1 1 400px' }}>
          {/* Tab: Thông tin cá nhân */}
          {activeTab === 'info' && (
            <div className="card">
              <h3 className="section-title" style={{ marginBottom: 20 }}>Thông tin cá nhân</h3>
              <div className="grid grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    <input className="form-input" style={{ paddingLeft: 36 }}
                      value={profileForm.full_name}
                      onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                      placeholder="Nguyễn Văn A" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    <input className="form-input" style={{ paddingLeft: 36 }}
                      value={profileForm.phone}
                      onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="0912345678" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email (không thể thay đổi)</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    <input className="form-input" style={{ paddingLeft: 36, background: 'var(--gray-50)', color: 'var(--gray-500)' }}
                      value={user?.email} readOnly />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mã sinh viên</label>
                  <div style={{ position: 'relative' }}>
                    <IdCard size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    <input className="form-input" style={{ paddingLeft: 36, background: 'var(--gray-50)', color: 'var(--gray-500)' }}
                      value={user?.studentId || user?.student_id || ''} readOnly />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Lớp</label>
                  <input className="form-input" value={profileForm.class_name}
                    onChange={e => setProfileForm(p => ({ ...p, class_name: e.target.value }))}
                    placeholder="CNTT22A" />
                </div>
                <div className="form-group">
                  <label className="form-label">GPA hiện tại</label>
                  <input type="number" min={0} max={4} step={0.01} className="form-input"
                    value={profileForm.gpa}
                    onChange={e => setProfileForm(p => ({ ...p, gpa: e.target.value }))}
                    placeholder="3.50" />
                </div>
                <div className="form-group">
                  <label className="form-label">Trường học</label>
                  <div style={{ position: 'relative' }}>
                    <Book size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    <input className="form-input" style={{ paddingLeft: 36, background: 'var(--gray-50)', color: 'var(--gray-500)' }}
                      value={user?.university?.name || user?.universityId?.name || 'Trường Đại học ABC'} readOnly />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
              </div>
            </div>
          )}

          {/* Tab: Bảo mật */}
          {activeTab === 'security' && (
            <div className="card">
              <h3 className="section-title" style={{ marginBottom: 20 }}>🔐 Đổi mật khẩu</h3>

              {[
                { key: 'current_password', label: 'Mật khẩu hiện tại', showKey: 'current' },
                { key: 'new_password', label: 'Mật khẩu mới', showKey: 'new' },
                { key: 'confirm_password', label: 'Xác nhận mật khẩu mới', showKey: 'new' },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    <input
                      type={showPw[f.showKey] ? 'text' : 'password'}
                      className="form-input" style={{ paddingLeft: 36, paddingRight: 40 }}
                      value={pwForm[f.key]}
                      onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder="••••••••"
                    />
                    {f.key !== 'confirm_password' && (
                      <button type="button" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
                        onClick={() => setShowPw(p => ({ ...p, [f.showKey]: !p[f.showKey] }))}>
                        {showPw[f.showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>
                  {f.key === 'confirm_password' && pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password && (
                    <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>Mật khẩu không khớp</p>
                  )}
                </div>
              ))}

              {pwForm.new_password && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 4,
                        background: pwForm.new_password.length > i * 2 + 3
                          ? pwForm.new_password.length >= 12 ? '#10b981' : pwForm.new_password.length >= 8 ? '#f59e0b' : '#ef4444'
                          : 'var(--gray-200)',
                        transition: 'background 0.3s'
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                    Độ mạnh: {pwForm.new_password.length < 8 ? 'Yếu' : pwForm.new_password.length < 12 ? 'Vừa' : 'Mạnh'}
                  </p>
                </div>
              )}

              <button className="btn btn-primary" onClick={handleChangePassword} disabled={savingPw} style={{ width: '100%', marginTop: 8 }}>
                {savingPw ? '⏳ Đang cập nhật...' : '🔐 Cập nhật mật khẩu'}
              </button>

              <div style={{ marginTop: 24, padding: 16, background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>💡 Lời khuyên về mật khẩu</h4>
                <ul style={{ fontSize: 12, color: 'var(--gray-600)', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li>Sử dụng ít nhất 8 ký tự</li>
                  <li>Kết hợp chữ hoa, chữ thường và số</li>
                  <li>Không dùng mật khẩu đã từng bị rò rỉ</li>
                  <li>Không chia sẻ mật khẩu với người khác</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab: eKYC */}
          {activeTab === 'ekyc' && (
            <div className="card">
              <h3 className="section-title" style={{ marginBottom: 20 }}>🛡️ Xác minh danh tính (eKYC)</h3>

              <div style={{
                padding: 20, borderRadius: 16,
                background: isVerified ? '#ecfdf5' : '#fff7ed',
                border: `1px solid ${isVerified ? '#6ee7b7' : '#fcd34d'}`,
                marginBottom: 24, textAlign: 'center'
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{isVerified ? '✅' : '📷'}</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: isVerified ? '#059669' : '#b45309' }}>
                  {isVerified ? 'Tài khoản đã được xác minh!' : 'Chưa xác minh danh tính'}
                </div>
                <p style={{ fontSize: 13, color: isVerified ? '#065f46' : '#92400e', marginTop: 8 }}>
                  {isVerified
                    ? 'Tài khoản của bạn đã được xác minh qua AI eKYC. Bạn được cộng 5 điểm bonus cho mỗi tiêu chí.'
                    : 'Xác minh CCCD giúp tăng độ tin cậy của hồ sơ và cộng thêm điểm bonus khi chấm điểm.'}
                </p>
              </div>

              {!isVerified && (
                <div>
                  <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 16 }}>
                    Để xác minh, bạn cần chụp ảnh rõ mặt trước của Căn cước công dân. AI sẽ tự động nhận diện thông tin trong vòng vài giây.
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    <Camera size={16} /> {loading ? '⏳ Đang phân tích...' : '📸 Chụp / Upload CCCD để xác minh'}
                  </button>
                  <input type="file" hidden accept="image/*" capture="environment" ref={fileInputRef} onChange={handleEkycCapture} />
                  <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 8, textAlign: 'center' }}>
                    Ảnh CCCD chỉ được dùng để xác minh danh tính và không được lưu trữ
                  </p>
                </div>
              )}

              {isVerified && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Trạng thái', value: 'Đã xác minh ✅' },
                    { label: 'Phương thức', value: 'AI eKYC' },
                    { label: 'Bonus điểm', value: '+5 mỗi tiêu chí' },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '10px 14px' }}>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#059669' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
