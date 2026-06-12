import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Send, Users, Building, AlertCircle, Info, CheckCircle, BellRing, Loader2, Eye } from 'lucide-react';

export default function AdminNotifications() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'info', // info, success, warning
    targetType: 'all', // all, university
    targetId: ''
  });
  
  const [sending, setSending] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [loadingUnis, setLoadingUnis] = useState(false);

  const isSuperAdmin = ['super_admin', 'admin'].includes(user?.role);

  useEffect(() => {
    if (isSuperAdmin) {
      loadUniversities();
    }
  }, [isSuperAdmin]);

  const loadUniversities = async () => {
    setLoadingUnis(true);
    try {
      const res = await api.get('/universities');
      setUniversities(res.data.universities || []);
    } catch (err) {
      toast.error('Không thể tải danh sách trường.');
    } finally {
      setLoadingUnis(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung.');
      return;
    }
    
    if (form.targetType === 'university' && !form.targetId) {
      toast.error('Vui lòng chọn trường.');
      return;
    }

    setSending(true);
    const toastId = toast.loading('Đang gửi thông báo...');
    try {
      const res = await api.post('/admin/notifications/broadcast', form);
      toast.success(res.data.message || 'Đã gửi thông báo thành công!', { id: toastId });
      setForm({ ...form, title: '', content: '' }); // reset form
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi gửi thông báo.', { id: toastId });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BellRing size={24} style={{ color: 'var(--primary-light)' }} />
            Gửi Thông báo
          </h2>
          <p className="section-subtitle">Soạn và gửi thông báo đến các sinh viên trên hệ thống</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: 24, alignItems: 'start' }}>
        <div className="card">
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label className="form-label">Tiêu đề thông báo <span className="required">*</span></label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="VD: Gia hạn thời gian nộp hồ sơ SV5T..."
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nội dung <span className="required">*</span></label>
              <textarea 
                className="form-textarea" 
                rows="5"
                placeholder="Nhập nội dung thông báo chi tiết..."
                value={form.content}
                onChange={e => setForm({...form, content: e.target.value})}
              />
            </div>

            <div className="grid grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Loại thông báo</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: 12 }}>
                    {form.type === 'info' && <Info size={16} color="#3b82f6" />}
                    {form.type === 'success' && <CheckCircle size={16} color="#10b981" />}
                    {form.type === 'warning' && <AlertCircle size={16} color="#f59e0b" />}
                  </span>
                  <select 
                    className="form-select" 
                    style={{ paddingLeft: 36 }}
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                  >
                    <option value="info">Thông tin (Xanh dương)</option>
                    <option value="success">Thành công (Xanh lá)</option>
                    <option value="warning">Cảnh báo / Quan trọng (Cam)</option>
                  </select>
                </div>
              </div>

              {isSuperAdmin && (
                <div className="form-group">
                  <label className="form-label">Đối tượng nhận</label>
                  <select 
                    className="form-select"
                    value={form.targetType}
                    onChange={e => setForm({...form, targetType: e.target.value, targetId: ''})}
                  >
                    <option value="all">Tất cả sinh viên</option>
                    <option value="university">Theo Trường học</option>
                  </select>
                </div>
              )}
            </div>

            {isSuperAdmin && form.targetType === 'university' && (
              <div className="form-group animate-slide-up" style={{ marginTop: 16 }}>
                <label className="form-label">Chọn Trường học <span className="required">*</span></label>
                <select 
                  className="form-select"
                  value={form.targetId}
                  onChange={e => setForm({...form, targetId: e.target.value})}
                >
                  <option value="">-- Chọn trường --</option>
                  {universities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            )}

            {!isSuperAdmin && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 8, fontSize: 13, color: 'var(--gray-600)', display: 'flex', gap: 8 }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--primary-light)' }} />
                <div>Bạn là <b>Admin Trường / Cán bộ Hội</b>. Thông báo này sẽ chỉ được gửi đến sinh viên thuộc trường của bạn.</div>
              </div>
            )}

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? <><Loader2 size={16} className="spin" /> Đang gửi...</> : <><Send size={16} /> Gửi thông báo</>}
              </button>
            </div>
          </form>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={18} /> Xem trước
            </h3>
            
            <div style={{ padding: 16, border: '1px solid var(--gray-200)', borderRadius: 12, background: 'var(--gray-50)' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: form.type === 'info' ? '#dbeafe' : form.type === 'success' ? '#d1fae5' : '#fef3c7',
                  color: form.type === 'info' ? '#2563eb' : form.type === 'success' ? '#10b981' : '#d97706',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {form.type === 'info' && <Info size={20} />}
                  {form.type === 'success' && <CheckCircle size={20} />}
                  {form.type === 'warning' && <AlertCircle size={20} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: 14 }}>
                    {form.title || 'Tiêu đề thông báo'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4, whiteSpace: 'pre-wrap' }}>
                    {form.content || 'Nội dung thông báo sẽ hiển thị ở đây...'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 8 }}>
                    Vừa xong
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: '#f8fafc', border: '1px dashed var(--gray-300)' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--gray-700)' }}>💡 Mẹo gửi thông báo</h4>
            <ul style={{ fontSize: 13, color: 'var(--gray-600)', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Thông báo sẽ hiển thị trên biểu tượng chuông (🔔) của sinh viên.</li>
              <li>Chỉ nên gửi thông báo vào giờ hành chính để đảm bảo sinh viên đọc được.</li>
              <li>Nội dung nên ngắn gọn, súc tích và có kèm theo thời hạn (nếu có).</li>
              <li>Hãy kiểm tra kỹ lỗi chính tả trước khi gửi đi.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
