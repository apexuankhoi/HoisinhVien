import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Book, Upload, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl);
  const fileInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
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
      const fileUrl = res.data.evidence.fileUrl;
      
      await api.put('/users/profile', { avatar_url: fileUrl });
      updateUser({ avatarUrl: fileUrl });
      toast.success('Cập nhật ảnh đại diện thành công!', { id: toastId });
    } catch (err) {
      toast.error('Lỗi khi tải ảnh lên.', { id: toastId });
      setAvatarPreview(user?.avatarUrl);
    } finally {
      setLoading(false);
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
      
      const res = await api.post('/ai/ekyc', {
        image_base64: base64Str,
        mime_type: file.type
      });
      
      const { result, message } = res.data;
      if (result.valid) {
        toast.success(message || 'Xác thực thẻ CCCD thành công!', { id: toastId });
        updateUser({ 
          ekyc_verified: true, 
          full_name: result.full_name || user.full_name,
        });
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

  return (
    <div className="page-container animate-fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)' }}>Hồ sơ cá nhân</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Quản lý thông tin và thiết lập tài khoản của bạn</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {/* Cột trái: Avatar */}
        <div className="card" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'var(--gradient-hero)', border: 'none', color: 'white' }}>
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
        <div className="card" style={{ flex: '2 1 400px' }}>
          <h3 className="section-title" style={{ marginBottom: 20 }}>Thông tin tài khoản</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 8 }}>Email</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                <Mail size={18} color="var(--gray-400)" />
                <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</span>
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
                <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.university?.name || 'Trường Đại học ABC'}
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 8 }}>Trạng thái xác minh (eKYC)</label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Shield size={18} color={user?.ekyc_verified ? 'var(--success)' : 'var(--gray-400)'} />
                  {user?.ekyc_verified ? (
                    <span style={{ fontWeight: 600, color: 'var(--success)' }}>Đã xác minh AI</span>
                  ) : (
                    <span style={{ fontWeight: 500, color: 'var(--gray-500)' }}>Chưa xác minh</span>
                  )}
                </div>
                {!user?.ekyc_verified && (
                  <button 
                    className="btn btn-sm btn-primary" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={loading}
                  >
                    <Camera size={14} /> Chụp CCCD
                  </button>
                )}
                {/* Lệnh capture="environment" gọi camera góc rộng */}
                <input 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  capture="environment" 
                  ref={fileInputRef} 
                  onChange={handleEkycCapture} 
                />
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
