import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Calendar, Edit2, Trash2, CheckCircle, XCircle, Users, Download, BarChart2 } from 'lucide-react';

const STATUS_MAP = {
  draft: { label: 'Bản nháp', color: 'badge-gray' },
  submitted: { label: 'Đã nộp', color: 'badge-blue' },
  under_review: { label: 'Đang xét', color: 'badge-yellow' },
  approved_school: { label: 'Đạt trường', color: 'badge-green' },
  approved_province: { label: 'Đạt tỉnh', color: 'badge-purple' },
  rejected: { label: 'Không đạt', color: 'badge-red' },
  revision_needed: { label: 'Cần bổ sung', color: 'badge-orange' },
};

function PeriodModal({ period, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: period?.name || '',
    start_date: period?.startDate ? period.startDate.split('T')[0] : '',
    end_date: period?.endDate ? period.endDate.split('T')[0] : '',
    submission_deadline: period?.submissionDeadline ? period.submissionDeadline.split('T')[0] : '',
    review_start: period?.reviewStart ? period.reviewStart.split('T')[0] : '',
    review_end: period?.reviewEnd ? period.reviewEnd.split('T')[0] : '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.start_date || !form.end_date) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc'); return;
    }
    setSaving(true);
    try {
      if (period?._id) {
        await api.patch(`/admin/periods/${period._id}`, form);
        toast.success('Đã cập nhật kỳ xét duyệt');
      } else {
        await api.post('/admin/periods', form);
        toast.success('Đã tạo kỳ xét duyệt mới');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Tên kỳ xét duyệt *', type: 'text', placeholder: 'Năm học 2025-2026', full: true },
    { key: 'start_date', label: 'Ngày bắt đầu *', type: 'date' },
    { key: 'end_date', label: 'Ngày kết thúc *', type: 'date' },
    { key: 'submission_deadline', label: 'Hạn nộp hồ sơ', type: 'date' },
    { key: 'review_start', label: 'Bắt đầu xét duyệt', type: 'date' },
    { key: 'review_end', label: 'Kết thúc xét duyệt', type: 'date' },
  ];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 560 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>
          {period?._id ? '✏️ Chỉnh sửa kỳ xét duyệt' : '📅 Tạo kỳ xét duyệt mới'}
        </h2>
        <div className="grid grid-2" style={{ gap: 14 }}>
          {fields.map(f => (
            <div key={f.key} className="form-group" style={f.full ? { gridColumn: '1 / -1' } : {}}>
              <label className="form-label">{f.label}</label>
              <input
                type={f.type}
                className="form-input"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              />
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

export default function AdminPeriods() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPeriod, setEditPeriod] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [stats, setStats] = useState({});
  const { user } = useAuth();

  const isSuperAdmin = ['super_admin', 'admin'].includes(user?.role);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/periods');
      setPeriods(res.data.periods || []);
    } catch (err) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (period, field) => {
    try {
      const update = {};
      if (field === 'isActive') {
        update.is_active = !period.isActive;
        if (!period.isActive) toast.success('Đã mở kỳ xét duyệt (các kỳ khác sẽ bị đóng)');
        else toast.success('Đã đóng kỳ xét duyệt');
      } else {
        update.is_accepting_submissions = !period.isAcceptingSubmissions;
        if (!period.isAcceptingSubmissions) toast.success('Đã mở nhận hồ sơ');
        else toast.success('Đã đóng nhận hồ sơ');
      }
      await api.patch(`/admin/periods/${period._id}`, update);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi cập nhật');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa kỳ xét duyệt này?')) return;
    try {
      await api.delete(`/admin/periods/${id}`);
      toast.success('Đã xóa');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không thể xóa');
    }
  };

  const handleExport = (periodId) => {
    const url = `/api/admin/export/applications?period_id=${periodId}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>📅 Kỳ xét duyệt</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>Quản lý các kỳ xét chọn danh hiệu Sinh viên 5 tốt</p>
        </div>
        {isSuperAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditPeriod(null); setShowModal(true); }}>
            <Plus size={16} /> Tạo kỳ mới
          </button>
        )}
      </div>

      {periods.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} style={{ opacity: 0.2, marginBottom: 16 }} />
          <div className="empty-state-title">Chưa có kỳ xét duyệt nào</div>
          <div className="empty-state-text">Tạo kỳ xét duyệt để sinh viên có thể nộp hồ sơ</div>
          {isSuperAdmin && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Tạo kỳ đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {periods.map(p => (
            <div key={p._id} className="card" style={{
              border: p.isActive ? '2px solid var(--primary)' : '1px solid var(--gray-200)',
              position: 'relative', overflow: 'hidden'
            }}>
              {p.isActive && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  background: 'var(--primary)', color: 'white',
                  fontSize: 10, fontWeight: 700, padding: '4px 12px',
                  borderBottomLeftRadius: 8
                }}>
                  ĐANG HOẠT ĐỘNG
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800 }}>{p.name}</h3>
                  </div>
                  <div className="grid grid-3" style={{ gap: 12, marginBottom: 12 }}>
                    {[
                      { label: 'Bắt đầu', value: p.startDate ? new Date(p.startDate).toLocaleDateString('vi-VN') : '—' },
                      { label: 'Kết thúc', value: p.endDate ? new Date(p.endDate).toLocaleDateString('vi-VN') : '—' },
                      { label: 'Hạn nộp HS', value: p.submissionDeadline ? new Date(p.submissionDeadline).toLocaleDateString('vi-VN') : '—' },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 2 }}>{item.label}</div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                        borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: isSuperAdmin ? 'pointer' : 'default',
                        background: p.isActive ? '#d1fae5' : 'var(--gray-100)',
                        color: p.isActive ? '#059669' : 'var(--gray-500)',
                        border: `1px solid ${p.isActive ? '#6ee7b7' : 'var(--gray-200)'}`
                      }}
                      onClick={() => isSuperAdmin && handleToggle(p, 'isActive')}
                    >
                      {p.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {p.isActive ? 'Kỳ đang mở' : 'Kỳ đã đóng'}
                    </div>

                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                        borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: isSuperAdmin ? 'pointer' : 'default',
                        background: p.isAcceptingSubmissions ? '#dbeafe' : 'var(--gray-100)',
                        color: p.isAcceptingSubmissions ? '#2563eb' : 'var(--gray-500)',
                        border: `1px solid ${p.isAcceptingSubmissions ? '#93c5fd' : 'var(--gray-200)'}`
                      }}
                      onClick={() => isSuperAdmin && handleToggle(p, 'isAcceptingSubmissions')}
                    >
                      <Users size={12} />
                      {p.isAcceptingSubmissions ? 'Đang nhận hồ sơ' : 'Đã đóng nộp'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Xuất báo cáo CSV"
                    onClick={() => handleExport(p._id)}
                  >
                    <Download size={14} />
                  </button>
                  {isSuperAdmin && (
                    <>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => { setEditPeriod(p); setShowModal(true); }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDelete(p._id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PeriodModal
          period={editPeriod}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
