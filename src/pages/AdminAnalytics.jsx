import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Download, Filter, BarChart2, Users, FileText, CheckCircle, TrendingUp } from 'lucide-react';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [loading, setLoading] = useState(true);

  const STATUS_LABELS = {
    draft: 'Bản nháp', submitted: 'Đã nộp', under_review: 'Đang xét',
    approved_school: 'Đạt trường', approved_province: 'Đạt tỉnh',
    rejected: 'Không đạt', revision_needed: 'Cần bổ sung'
  };
  const STATUS_COLORS = {
    draft: '#94a3b8', submitted: '#3b82f6', under_review: '#f59e0b',
    approved_school: '#10b981', approved_province: '#8b5cf6',
    rejected: '#ef4444', revision_needed: '#f97316'
  };

  const load = async () => {
    setLoading(true);
    try {
      const [anaRes, perRes] = await Promise.all([
        api.get(`/admin/analytics${selectedPeriod ? `?period_id=${selectedPeriod}` : ''}`),
        api.get('/admin/periods'),
      ]);
      setAnalytics(anaRes.data);
      setPeriods(perRes.data.periods || []);
    } catch (err) {
      toast.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedPeriod]);

  const handleExport = (type) => {
    const params = selectedPeriod ? `?period_id=${selectedPeriod}` : '';
    if (type === 'applications') window.open(`/api/admin/export/applications${params}`, '_blank');
    else window.open(`/api/admin/export/students`, '_blank');
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!analytics) return null;

  const { summary, byUniversity, byStatus, registrationTrend } = analytics;

  const statCards = [
    { label: 'Tổng sinh viên', value: summary.totalStudents, icon: '👨‍🎓', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Hồ sơ đã nộp', value: summary.totalApplications, icon: '📋', color: '#10b981', bg: '#ecfdf5' },
    { label: 'Đạt cấp trường', value: summary.approvedSchool, icon: '🏫', color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Đạt cấp tỉnh', value: summary.approvedProvince, icon: '🏆', color: '#f59e0b', bg: '#fff7ed' },
    { label: 'Tổng minh chứng', value: summary.totalEvidences, icon: '📎', color: '#ec4899', bg: '#fdf2f8' },
    { label: 'AI chấp nhận', value: summary.validEvidences, icon: '🤖', color: '#14b8a6', bg: '#f0fdfa' },
    { label: 'Tỷ lệ AI chính xác', value: `${summary.aiAccuracyPct}%`, icon: '🎯', color: '#6366f1', bg: '#eef2ff' },
    { label: 'Tỷ lệ đạt', value: `${summary.approvalRate}%`, icon: '✅', color: '#059669', bg: '#ecfdf5' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>📊 Thống kê & Báo cáo</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>Phân tích toàn diện hệ thống Sinh viên 5 tốt</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="form-select" style={{ width: 200 }} value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}>
            <option value="">Tất cả kỳ</option>
            {periods.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <button className="btn btn-ghost" onClick={() => handleExport('applications')}>
            <Download size={14} /> Xuất hồ sơ
          </button>
          <button className="btn btn-ghost" onClick={() => handleExport('students')}>
            <Download size={14} /> Xuất SV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-4" style={{ marginBottom: 24, gap: 12 }}>
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value.toLocaleString()}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ gap: 20, marginBottom: 20 }}>
        {/* Phân bố theo trạng thái */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Phân bố hồ sơ theo trạng thái</div>
          {byStatus.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Chưa có dữ liệu</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {byStatus.map(s => {
                const total = byStatus.reduce((acc, x) => acc + x.count, 0);
                const pct = total > 0 ? Math.round(s.count / total * 100) : 0;
                return (
                  <div key={s.status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                      <span style={{ fontWeight: 600 }}>{STATUS_LABELS[s.status] || s.status}</span>
                      <span style={{ color: 'var(--gray-500)' }}>{s.count} ({pct}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill"
                        style={{ width: `${pct}%`, background: STATUS_COLORS[s.status] || '#94a3b8' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top trường */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Top trường theo số hồ sơ</div>
          {byUniversity.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Chưa có dữ liệu</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {byUniversity.slice(0, 8).map((u, i) => {
                const maxCount = byUniversity[0]?.count || 1;
                const pct = Math.round(u.count / maxCount * 100);
                return (
                  <div key={u.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                      <span style={{ fontWeight: 600 }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`} {u.name || 'Không rõ'}
                      </span>
                      <span style={{ color: 'var(--gray-500)' }}>
                        {u.count} hồ sơ · ĐTB {u.avgScore}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill"
                        style={{ width: `${pct}%`, background: 'var(--gradient-primary)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Xu hướng đăng ký */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>📈 Xu hướng đăng ký (6 tháng gần nhất)</div>
        {registrationTrend.length === 0 ? (
          <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Chưa có dữ liệu</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140, paddingTop: 10 }}>
            {registrationTrend.map((t, i) => {
              const maxCount = Math.max(...registrationTrend.map(x => x.count), 1);
              const heightPct = t.count / maxCount;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>{t.count}</div>
                  <div style={{
                    width: '100%', borderRadius: 6, minHeight: 4,
                    height: `${Math.max(heightPct * 100, 4)}%`,
                    background: 'var(--gradient-primary)',
                    transition: 'height 0.5s ease',
                  }} />
                  <div style={{ fontSize: 10, color: 'var(--gray-500)', textAlign: 'center' }}>{t.month}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
