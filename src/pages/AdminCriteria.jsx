import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

const ICON_OPTIONS = ['🛡️', '📚', '💪', '❤️', '🌍', '🏆', '⭐', '🎯', '🔬', '🎨'];
const COLOR_OPTIONS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#14b8a6'];

const getIcon = (icon) => {
  const map = { Shield: '🛡️', BookOpen: '📚', Activity: '💪', Heart: '❤️', Globe: '🌍' };
  return map[icon] || icon || '🎯';
};

function CategoryModal({ category, onClose, onSuccess }) {
  const [form, setForm] = useState({
    code: category?.code || '',
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || '🎯',
    color: category?.color || '#6366f1',
    max_score: category?.maxScore || 100,
    pass_score: category?.passScore || 70,
    sort_order: category?.sortOrder || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.code || !form.name) { toast.error('Code và tên là bắt buộc'); return; }
    setSaving(true);
    try {
      if (category?._id) {
        await api.patch(`/admin/criteria/${category._id}`, form);
        toast.success('Đã cập nhật tiêu chí');
      } else {
        await api.post('/admin/criteria', form);
        toast.success('Đã tạo tiêu chí mới');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 560 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>
          {category?._id ? '✏️ Chỉnh sửa tiêu chí' : '➕ Thêm tiêu chí mới'}
        </h2>

        <div className="grid grid-2" style={{ gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Code (không dấu) *</label>
            <input className="form-input" value={form.code} placeholder="dao_duc_tot"
              onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
              disabled={!!category?._id} />
          </div>
          <div className="form-group">
            <label className="form-label">Tên tiêu chí *</label>
            <input className="form-input" value={form.name} placeholder="Đạo đức tốt"
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Mô tả</label>
            <textarea className="form-textarea" rows={2} value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Điểm tối đa</label>
            <input type="number" className="form-input" value={form.max_score} min={0} max={100}
              onChange={e => setForm(p => ({ ...p, max_score: parseInt(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Điểm đạt (pass)</label>
            <input type="number" className="form-input" value={form.pass_score} min={0} max={100}
              onChange={e => setForm(p => ({ ...p, pass_score: parseInt(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ICON_OPTIONS.map(ic => (
                <button key={ic} type="button"
                  style={{
                    width: 36, height: 36, borderRadius: 8, fontSize: 18,
                    border: form.icon === ic ? '2px solid var(--primary)' : '2px solid var(--gray-200)',
                    background: form.icon === ic ? '#eff6ff' : 'transparent',
                    cursor: 'pointer'
                  }}
                  onClick={() => setForm(p => ({ ...p, icon: ic }))}
                >{ic}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Màu sắc</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLOR_OPTIONS.map(color => (
                <div key={color}
                  onClick={() => setForm(p => ({ ...p, color }))}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', background: color,
                    cursor: 'pointer', border: form.color === color ? '3px solid #1a1a1a' : '3px solid transparent',
                    boxSizing: 'border-box'
                  }}
                />
              ))}
            </div>
          </div>
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

export default function AdminCriteria() {
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [expanded, setExpanded] = useState({});
  const { user } = useAuth();
  const isSuperAdmin = ['super_admin', 'admin'].includes(user?.role);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/criteria');
      setCriteria(res.data.criteria || []);
    } catch {
      toast.error('Không thể tải tiêu chí');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>🏆 Quản lý tiêu chí</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>5 tiêu chí Sinh viên 5 tốt</p>
        </div>
        {isSuperAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditCat(null); setShowModal(true); }}>
            <Plus size={16} /> Thêm tiêu chí
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {criteria.map(cat => (
          <div key={cat._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                cursor: 'pointer', background: 'white'
              }}
              onClick={() => setExpanded(p => ({ ...p, [cat._id]: !p[cat._id] }))}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, fontSize: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${cat.color}20`,
              }}>
                {getIcon(cat.icon)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {cat.name}
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                    background: `${cat.color}20`, color: cat.color
                  }}>{cat.code}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                  Điểm tối đa: {cat.maxScore} · Điểm đạt: {cat.passScore} · {cat.items?.length || 0} tiêu chí con
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: cat.color,
                }} />
                {isSuperAdmin && (
                  <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setEditCat(cat); setShowModal(true); }}>
                    <Edit2 size={13} />
                  </button>
                )}
                {expanded[cat._id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            </div>

            {expanded[cat._id] && (
              <div style={{ borderTop: '1px solid var(--gray-100)', padding: '14px 20px', background: 'var(--gray-50)' }}>
                {cat.description && (
                  <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 12 }}>{cat.description}</p>
                )}
                {cat.items?.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>Chưa có tiêu chí con</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cat.items?.map(item => (
                      <div key={item._id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'white', borderRadius: 8, padding: '10px 14px',
                        border: '1px solid var(--gray-200)'
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                          {item.description && <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{item.description}</div>}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: cat.color }}>{item.maxScore} điểm</span>
                        {item.isRequired && <span className="badge badge-red" style={{ fontSize: 10 }}>Bắt buộc</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <CategoryModal
          category={editCat}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
