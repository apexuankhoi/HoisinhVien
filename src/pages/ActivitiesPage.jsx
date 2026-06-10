import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Filter, Search } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: '', label: 'Tất cả' },
  { value: 'tinh_nguyen', label: '❤️ Tình nguyện' },
  { value: 'hoc_thuat', label: '📚 Học thuật' },
  { value: 'the_thao', label: '⚽ Thể thao' },
  { value: 'van_hoa', label: '🎭 Văn hóa' },
  { value: 'hoi_nhap', label: '🌍 Hội nhập' },
  { value: 'khoi_nghiep', label: '💡 Khởi nghiệp' },
];

const LEVELS = [
  { value: '', label: 'Tất cả cấp' },
  { value: 'school', label: 'Cấp trường' },
  { value: 'province', label: 'Cấp tỉnh' },
  { value: 'national', label: 'Cấp quốc gia' },
];

const STATUSES = [
  { value: 'upcoming', label: 'Sắp diễn ra' },
  { value: 'ongoing', label: 'Đang diễn ra' },
  { value: 'completed', label: 'Đã kết thúc' },
];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', level: '', status: 'upcoming', search: '' });
  const [registering, setRegistering] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        page,
        limit: 9
      });
      const res = await api.get(`/activities?${params}`);
      setActivities(res.data.activities || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error('Không thể tải danh sách hoạt động');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActivities(); }, [filters, page]);

  const handleRegister = async (activityId, actTitle) => {
    setRegistering(activityId);
    try {
      await api.post(`/activities/${activityId}/register`);
      toast.success(`Đăng ký "${actTitle}" thành công! 🎉`);
      fetchActivities();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không thể đăng ký');
    } finally {
      setRegistering(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'upcoming') return { label: 'Sắp diễn ra', color: '#3b82f6', bg: '#eff6ff' };
    if (status === 'ongoing') return { label: '🔴 Đang diễn ra', color: '#10b981', bg: '#ecfdf5' };
    if (status === 'completed') return { label: 'Đã kết thúc', color: '#64748b', bg: '#f1f5f9' };
    return { label: status, color: '#64748b', bg: '#f1f5f9' };
  };

  const getCategoryEmoji = (cat) => {
    const map = { tinh_nguyen: '❤️', hoc_thuat: '📚', the_thao: '⚽', van_hoa: '🎭', hoi_nhap: '🌍', khoi_nghiep: '💡', khac: '🎯' };
    return map[cat] || '🎯';
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Hoạt động & Sự kiện</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Tham gia để tích điểm tiêu chí Sinh viên 5 tốt</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 24, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Tìm kiếm hoạt động..."
              value={filters.search}
              onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
              style={{ paddingLeft: 38 }}
            />
          </div>

          <select
            className="form-select"
            value={filters.category}
            onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}
            style={{ flex: '0 1 160px' }}
          >
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          <select
            className="form-select"
            value={filters.level}
            onChange={e => setFilters(p => ({ ...p, level: e.target.value }))}
            style={{ flex: '0 1 140px' }}
          >
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>

          <div style={{ display: 'flex', gap: 6 }}>
            {STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => setFilters(p => ({ ...p, status: s.value }))}
                className={`btn btn-sm ${filters.status === s.value ? 'btn-primary' : 'btn-ghost'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Total */}
      <div style={{ marginBottom: 16, color: 'var(--gray-500)', fontSize: 14 }}>
        Tìm thấy <strong style={{ color: 'var(--gray-900)' }}>{total}</strong> hoạt động
      </div>

      {/* Activities Grid */}
      {loading ? (
        <div className="page-loading" style={{ minHeight: 300 }}>
          <div className="spinner" />
        </div>
      ) : activities.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} style={{ opacity: 0.2, marginBottom: 16 }} />
          <div className="empty-state-title">Không tìm thấy hoạt động nào</div>
          <div className="empty-state-text">Thử thay đổi bộ lọc hoặc quay lại sau.</div>
        </div>
      ) : (
        <div className="grid grid-3" style={{ gap: 20 }}>
          {activities.map(act => {
            const badge = getStatusBadge(act.status);
            const isDeadlinePassed = act.registration_deadline && new Date() > new Date(act.registration_deadline);

            return (
              <div
                key={act.id}
                className="card"
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => setSelected(act)}
              >
                {/* Image/Banner */}
                <div style={{
                  height: 140,
                  background: act.banner_url
                    ? `url(${act.banner_url}) center/cover`
                    : `linear-gradient(135deg, ${act.criteria_color || '#3b82f6'}33, ${act.criteria_color || '#8b5cf6'}55)`,
                  position: 'relative',
                  display: 'flex', alignItems: 'flex-end'
                }}>
                  <div style={{
                    position: 'absolute', top: 12, left: 12,
                    background: badge.bg, color: badge.color,
                    padding: '3px 10px', borderRadius: 20,
                    fontSize: 11, fontWeight: 700
                  }}>
                    {badge.label}
                  </div>

                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    width: 36, height: 36, background: 'rgba(255,255,255,0.9)',
                    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20
                  }}>
                    {getCategoryEmoji(act.category)}
                  </div>

                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: 60,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.5))'
                  }} />
                </div>

                {/* Content */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, lineHeight: 1.4 }}>
                    {act.title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                    {act.start_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-600)' }}>
                        <Calendar size={14} />
                        {new Date(act.start_date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                    {act.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-600)' }}>
                        <MapPin size={14} />
                        {act.location}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-600)' }}>
                      <Users size={14} />
                      {act.registration_count || 0}
                      {act.max_participants ? `/${act.max_participants}` : ''} người đăng ký
                    </div>
                  </div>

                  {act.criteria_name && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: `${act.criteria_color}15`, color: act.criteria_color,
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      marginBottom: 12
                    }}>
                      +điểm {act.criteria_name}
                    </div>
                  )}

                  <button
                    id={`register-${act.id}`}
                    className={`btn btn-full ${isDeadlinePassed ? 'btn-ghost' : 'btn-primary'} btn-sm`}
                    onClick={e => { e.stopPropagation(); handleRegister(act.id, act.title); }}
                    disabled={registering === act.id || isDeadlinePassed || act.status === 'completed'}
                  >
                    {registering === act.id ? '⏳ Đang đăng ký...' :
                     isDeadlinePassed ? 'Hết hạn đăng ký' :
                     act.status === 'completed' ? 'Đã kết thúc' : '✅ Đăng ký tham gia'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 9 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Trước
          </button>
          <span style={{ lineHeight: '32px', fontSize: 14 }}>Trang {page}</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage(p => p + 1)}
            disabled={activities.length < 9}
          >
            Tiếp →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, flex: 1, marginRight: 16 }}>{selected.title}</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Thời gian', value: selected.start_date ? new Date(selected.start_date).toLocaleString('vi-VN') : '—' },
                { label: 'Địa điểm', value: selected.location || (selected.is_online ? 'Online' : '—') },
                { label: 'Đăng ký', value: `${selected.registration_count || 0}${selected.max_participants ? `/${selected.max_participants}` : ''} người` },
                { label: 'Hạn đăng ký', value: selected.registration_deadline ? new Date(selected.registration_deadline).toLocaleDateString('vi-VN') : '—' },
              ].map(i => (
                <div key={i.label} style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 10 }}>
                  <p style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 2 }}>{i.label}</p>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{i.value}</p>
                </div>
              ))}
            </div>

            {selected.description && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Mô tả hoạt động</p>
                <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.7 }}>{selected.description}</p>
              </div>
            )}

            <button
              className="btn btn-primary btn-full"
              onClick={() => { handleRegister(selected.id, selected.title); setSelected(null); }}
              disabled={registering === selected.id}
            >
              ✅ Đăng ký tham gia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
