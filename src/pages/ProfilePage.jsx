import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Book, Upload } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Preview
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'avatar');

    setLoading(true);
    const toastId = toast.loading('Đang tải ảnh lên Cloudinary...');
    try {
      const res = await api.post('/evidences/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fileUrl = res.data.fileUrl;
      
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
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)' }}>Hồ sơ cá nhân</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Quản lý thông tin và thiết lập tài khoản của bạn</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* Cột trái: Avatar */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'var(--gradient-hero)', border: 'none', color: 'white' }}>
          <div style={{ position: 'relative', marginBottom: 20, marginTop: 20 }}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)' }} />
            ) : (
              <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 'bold', border: '4px solid rgba(255,255,255,0.2)' }}>
                {user?.full_name?.[0] || 'U'}
              </div>
            )}
            
            <label style={{
              position: 'absolute', bottom: 0, right: 0,
              background: 'var(--primary)', color: 'white',
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'transform 0.2s ease'
            }} className="hover-scale">
              <Upload size={16} />
              <input type="file" hidden accept="image/*" onChange={handleAvatarChange} disabled={loading} />
            </label>
          </div>
          
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{user?.full_name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{user?.student_id}</p>
          
          <div style={{ marginTop: 16, padding: '6px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
            {user?.role === 'student' ? 'Sinh viên' : 'Quản trị viên'}
          </div>
        </div>

        {/* Cột phải: Thông tin */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 20 }}>Thông tin tài khoản</h3>
          
          <div className="grid grid-2" style={{ gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 8 }}>Email</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                <Mail size={18} color="var(--gray-400)" />
                <span style={{ fontWeight: 500 }}>{user?.email}</span>
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 8 }}>Mã sinh viên</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                <User size={18} color="var(--gray-400)" />
                <span style={{ fontWeight: 500 }}>{user?.student_id}</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 8 }}>Trường học</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                <Book size={18} color="var(--gray-400)" />
                <span style={{ fontWeight: 500 }}>{user?.university?.name || 'Trường Đại học XYZ'}</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 8 }}>Trạng thái xác thực (eKYC)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                <Shield size={18} color={user?.ekyc_verified ? 'var(--success)' : 'var(--gray-400)'} />
                {user?.ekyc_verified ? (
                  <span style={{ fontWeight: 600, color: 'var(--success)' }}>Đã xác thực</span>
                ) : (
                  <span style={{ fontWeight: 500, color: 'var(--gray-500)' }}>Chưa xác thực</span>
                )}
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--gray-100)', textAlign: 'right' }}>
            <button className="btn btn-primary" onClick={() => toast.success('Đã lưu thông tin!')}>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
