import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, MapPin, Users } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'tinh_nguyen', label: 'Tình nguyện' },
  { value: 'hoc_thuat', label: 'Học thuật' },
  { value: 'the_thao', label: 'Thể thao' },
  { value: 'van_hoa', label: 'Văn hóa' },
  { value: 'hoi_nhap', label: 'Hội nhập' },
  { value: 'khoi_nghiep', label: 'Khởi nghiệp' },
  { value: 'khac', label: 'Khác' },
];

export default function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    title: '', description: '', content: '', category: 'tinh_nguyen', 
    status: 'upcoming', location: '', max_participants: '',
    start_date: '', end_date: '', registration_deadline: ''
  });

  const fetchData = async () => {
    try {
      const res = await api.get('/activities?limit=100');
      setActivities(res.data.activities || []);
    } catch (err) {
      toast.error('Không thể tải hoạt động');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up empty strings for numbers
      const payload = { ...form };
      if (payload.max_participants === '') delete payload.max_participants;

      if (editingId) {
        await api.patch(`/activities/${editingId}`, payload);
        toast.success('Đã cập nhật hoạt động');
      } else {
        await api.post('/activities', payload);
        toast.success('Đã tạo hoạt động mới');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa hoạt động này? Mọi lượt đăng ký sẽ bị xóa theo.')) return;
    try {
      await api.delete(`/activities/${id}`);
      toast.success('Đã xóa hoạt động');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không thể xóa');
    }
  };

  const openModal = (act = null) => {
    if (act) {
      setEditingId(act.id);
      setForm({
        title: act.title || '',
        description: act.description || '',
        content: act.content || '',
        category: act.category || 'tinh_nguyen',
        status: act.status || 'upcoming',
        location: act.location || '',
        max_participants: act.max_participants || '',
        start_date: act.start_date ? new Date(act.start_date).toISOString().slice(0,16) : '',
        end_date: act.end_date ? new Date(act.end_date).toISOString().slice(0,16) : '',
        registration_deadline: act.registration_deadline ? new Date(act.registration_deadline).toISOString().slice(0,16) : '',
      });
    } else {
      setEditingId(null);
      setForm({
        title: '', description: '', content: '', category: 'tinh_nguyen', 
        status: 'upcoming', location: '', max_participants: '',
        start_date: '', end_date: '', registration_deadline: ''
      });
    }
    setShowModal(true);
  };

  if (loading) return <div className="page-loading"><div className="spinner"/></div>;

  return (
    <div className="page-container animate-fade-in">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 className="section-title">Quản lý Hoạt động</h2>
          <p className="section-subtitle">Tạo và chỉnh sửa các hoạt động cho sinh viên tham gia</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Tạo hoạt động mới
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Bắt đầu</th>
              <th>Trạng thái</th>
              <th>Đăng ký</th>
              <th align="right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>Chưa có hoạt động nào</td></tr>
            ) : activities.map(act => (
              <tr key={act.id}>
                <td style={{ fontWeight: 600 }}>{act.title}</td>
                <td>{CATEGORIES.find(c => c.value === act.category)?.label || act.category}</td>
                <td>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>
                    {act.start_date ? new Date(act.start_date).toLocaleDateString('vi-VN') : '—'}
                  </div>
                </td>
                <td>
                  <span className={`badge ${act.status === 'upcoming' ? 'badge-blue' : act.status === 'ongoing' ? 'badge-green' : 'badge-gray'}`}>
                    {act.status === 'upcoming' ? 'Sắp diễn ra' : act.status === 'ongoing' ? 'Đang diễn ra' : 'Đã kết thúc'}
                  </span>
                </td>
                <td>{act.registration_count || 0}{act.max_participants ? `/${act.max_participants}` : ''}</td>
                <td align="right">
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openModal(act)}><Edit2 size={14} /></button>
                    <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(act.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 800 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              {editingId ? 'Chỉnh sửa hoạt động' : 'Tạo hoạt động mới'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2" style={{ gap: 16 }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Tiêu đề <span className="required">*</span></label>
                  <input type="text" className="form-input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Danh mục</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="upcoming">Sắp diễn ra</option>
                    <option value="ongoing">Đang diễn ra</option>
                    <option value="completed">Đã kết thúc</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Bắt đầu</label>
                  <input type="datetime-local" className="form-input" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Hạn đăng ký</label>
                  <input type="datetime-local" className="form-input" value={form.registration_deadline} onChange={e => setForm({...form, registration_deadline: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Địa điểm</label>
                  <input type="text" className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Số người tối đa (để trống: vô hạn)</label>
                  <input type="number" className="form-input" value={form.max_participants} onChange={e => setForm({...form, max_participants: e.target.value})} />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Mô tả chi tiết</label>
                  <textarea className="form-textarea" rows="4" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Lưu thay đổi' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
