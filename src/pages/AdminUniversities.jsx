import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Building, Users, ChevronDown, ChevronRight } from 'lucide-react';

function UniversityModal({ university, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: university?.name || '',
    short_name: university?.shortName || '',
    address: university?.address || '',
    phone: university?.phone || '',
    email: university?.email || '',
    website: university?.website || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.short_name) { toast.error('Tên và tên ngắn là bắt buộc'); return; }
    setSaving(true);
    try {
      if (university?._id) {
        await api.patch(`/admin/universities/${university._id}`, form);
        toast.success('Đã cập nhật trường học');
      } else {
        await api.post('/admin/universities', form);
        toast.success('Đã tạo trường học mới');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Tên trường đầy đủ *', placeholder: 'Trường Đại học Tây Nguyên', full: true },
    { key: 'short_name', label: 'Tên ngắn *', placeholder: 'ĐH Tây Nguyên' },
    { key: 'email', label: 'Email liên hệ', placeholder: 'contact@tnu.edu.vn' },
    { key: 'phone', label: 'Số điện thoại', placeholder: '0262 3855 773' },
    { key: 'website', label: 'Website', placeholder: 'https://tnu.edu.vn' },
    { key: 'address', label: 'Địa chỉ', placeholder: '567 Lê Duẩn, TP. Buôn Ma Thuột', full: true },
  ];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 560 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>
          {university?._id ? '✏️ Chỉnh sửa trường học' : '🏫 Thêm trường học mới'}
        </h2>
        <div className="grid grid-2" style={{ gap: 12 }}>
          {fields.map(f => (
            <div key={f.key} className="form-group" style={f.full ? { gridColumn: '1 / -1' } : {}}>
              <label className="form-label">{f.label}</label>
              <input className="form-input" value={form[f.key]} placeholder={f.placeholder}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FacultyModal({ universityId, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name) { toast.error('Tên khoa là bắt buộc'); return; }
    setSaving(true);
    try {
      await api.post(`/admin/universities/${universityId}/faculties`, { name, short_name: shortName });
      toast.success('Đã tạo khoa mới');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 420 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>➕ Thêm khoa/phòng ban</h2>
        <div className="form-group">
          <label className="form-label">Tên khoa *</label>
          <input className="form-input" value={name} placeholder="Khoa Công nghệ thông tin"
            onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Tên ngắn</label>
          <input className="form-input" value={shortName} placeholder="CNTT"
            onChange={e => setShortName(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUniversities() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUniModal, setShowUniModal] = useState(false);
  const [editUni, setEditUni] = useState(null);
  const [showFacultyModal, setShowFacultyModal] = useState(null); // universityId
  const [expanded, setExpanded] = useState({});
  const [faculties, setFaculties] = useState({}); // { uniId: [] }
  const { user } = useAuth();
  const isSuperAdmin = ['super_admin', 'admin'].includes(user?.role);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/universities');
      setUniversities(res.data.universities || []);
    } catch {
      toast.error('Không thể tải danh sách trường');
    } finally {
      setLoading(false);
    }
  };

  const loadFaculties = async (uniId) => {
    try {
      const res = await api.get(`/admin/universities/${uniId}/faculties`);
      setFaculties(p => ({ ...p, [uniId]: res.data.faculties || [] }));
    } catch {
      toast.error('Không thể tải danh sách khoa');
    }
  };

  useEffect(() => { load(); }, []);

  const toggleExpand = (uniId) => {
    setExpanded(p => ({ ...p, [uniId]: !p[uniId] }));
    if (!expanded[uniId] && !faculties[uniId]) {
      loadFaculties(uniId);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>🏫 Trường học & Khoa</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>
            {universities.length} trường trong hệ thống
          </p>
        </div>
        {isSuperAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditUni(null); setShowUniModal(true); }}>
            <Plus size={16} /> Thêm trường
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {universities.map(uni => (
          <div key={uni._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer' }}
              onClick={() => toggleExpand(uni._id)}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, fontSize: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#eff6ff', flexShrink: 0,
              }}>
                🏫
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{uni.name}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2, display: 'flex', gap: 12 }}>
                  <span>📛 {uni.shortName}</span>
                  <span><Users size={11} style={{ display: 'inline', marginRight: 3 }} />{uni.studentCount || 0} sinh viên</span>
                  <span><Building size={11} style={{ display: 'inline', marginRight: 3 }} />{uni.facultyCount || 0} khoa</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${uni.isActive !== false ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                  {uni.isActive !== false ? 'Hoạt động' : 'Tạm dừng'}
                </span>
                {isSuperAdmin && (
                  <button className="btn btn-ghost btn-sm"
                    onClick={e => { e.stopPropagation(); setEditUni(uni); setShowUniModal(true); }}>
                    <Edit2 size={13} />
                  </button>
                )}
                {expanded[uni._id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            </div>

            {expanded[uni._id] && (
              <div style={{ borderTop: '1px solid var(--gray-100)', padding: '14px 20px', background: 'var(--gray-50)' }}>
                {uni.email && <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>📧 {uni.email} · 🌐 {uni.website || '—'}</p>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700 }}>Danh sách khoa/phòng ban</h4>
                  {isSuperAdmin && (
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}
                      onClick={() => setShowFacultyModal(uni._id)}>
                      <Plus size={12} /> Thêm khoa
                    </button>
                  )}
                </div>
                {!faculties[uni._id] ? (
                  <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>Đang tải...</p>
                ) : faculties[uni._id].length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>Chưa có khoa nào</p>
                ) : (
                  <div className="grid grid-3" style={{ gap: 8 }}>
                    {faculties[uni._id].map(f => (
                      <div key={f._id} style={{
                        background: 'white', borderRadius: 8, padding: '8px 12px',
                        border: '1px solid var(--gray-200)', fontSize: 13
                      }}>
                        <div style={{ fontWeight: 600 }}>{f.name}</div>
                        {f.shortName && <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{f.shortName}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {universities.length === 0 && (
          <div className="empty-state">
            <Building size={64} style={{ opacity: 0.2, marginBottom: 16 }} />
            <div className="empty-state-title">Chưa có trường học nào</div>
            <div className="empty-state-text">Thêm trường học để sinh viên đăng ký</div>
            {isSuperAdmin && (
              <button className="btn btn-primary" onClick={() => setShowUniModal(true)}>
                <Plus size={16} /> Thêm trường đầu tiên
              </button>
            )}
          </div>
        )}
      </div>

      {showUniModal && (
        <UniversityModal
          university={editUni}
          onClose={() => setShowUniModal(false)}
          onSuccess={() => { setShowUniModal(false); load(); }}
        />
      )}

      {showFacultyModal && (
        <FacultyModal
          universityId={showFacultyModal}
          onClose={() => setShowFacultyModal(null)}
          onSuccess={() => {
            loadFaculties(showFacultyModal);
            setShowFacultyModal(null);
          }}
        />
      )}
    </div>
  );
}
