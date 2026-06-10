import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Book, MapPin, Upload } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Preview locally
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);

    // Upload logic
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'avatar'); // If backend supports it

    setLoading(true);
    const toastId = toast.loading('Đang tải ảnh lên Cloudinary...');
    try {
      // Giả sử backend có endpoint hỗ trợ upload avatar vào user
      // Nếu không có, ta dùng endpoint upload chung rồi gán link vào user
      const res = await api.post('/evidences/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fileUrl = res.data.fileUrl;
      
      // Update user info
      await api.put('/users/me', { avatarUrl: fileUrl });
      toast.success('Cập nhật ảnh đại diện thành công!', { id: toastId });
    } catch (err) {
      toast.error('Lỗi khi tải ảnh lên.', { id: toastId });
      setAvatarPreview(user?.avatarUrl); // Revert
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-900)' }}>Hồ sơ cá nhân</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Quản lý thông tin và ảnh đại diện của bạn</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: 32 }}>
        {/* Cột trái: Avatar */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: 'var(--shadow-md)' }} />
            ) : (
              <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'var(--gray-400)', boxShadow: 'var(--shadow-md)', border: '4px solid white' }}>
                {user?.full_name?.[0] || 'U'}
              </div>
            )}
            
            <label style={{
              position: 'absolute', bottom: 0, right: 0,
              background: 'var(--primary)', color: 'white',
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition-fast)'
            }}>
              <Upload size={16} />
              <input type="file" hidden accept="image/*" onChange={handleAvatarChange} disabled={loading} />
            </label>
          </div>
          
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{user?.full_name}</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>{user?.student_id}</p>
          
          <div className="badge badge-blue" style={{ marginTop: 12 }}>
            {user?.role === 'student' ? 'Sinh viên' : 'Quản trị viên'}
          </div>
        </div>

        {/* Cột phải: Thông tin */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, borderBottom: '1px solid var(--gray-100)', paddingBottom: 12 }}>
            Thông tin liên hệ & Học tập
          </h3>
          
          <div className="grid grid-2" style={{ gap: 20 }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={16} className="text-muted" /> Email
              </label>
              <input className="form-input" value={user?.email || ''} readOnly disabled />
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={16} className="text-muted" /> Mã sinh viên
              </label>
              <input className="form-input" value={user?.student_id || ''} readOnly disabled />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Book size={16} className="text-muted" /> Trường học
              </label>
              <input className="form-input" value={user?.university?.name || 'Trường Đại học XYZ'} readOnly disabled />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={16} className="text-muted" /> Trạng thái eKYC
              </label>
              <div style={{ display: 'flex', alignItems: 'center', height: 46 }}>
                {user?.ekyc_verified ? (
                  <span className="badge badge-green">Đã xác thực</span>
                ) : (
                  <span className="badge badge-gray">Chưa xác thực</span>
                )}
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <button className="btn btn-primary" onClick={() => toast.success('Đã lưu thông tin!')}>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
