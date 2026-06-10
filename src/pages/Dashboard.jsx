import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import {
  FileText, Upload, Calendar, Trophy, TrendingUp,
  CheckCircle, Clock, AlertCircle, ArrowRight, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CRITERIA = [
  { code: 'dao_duc_tot', name: 'Đạo đức tốt', color: '#6366f1', emoji: '🛡️' },
  { code: 'hoc_tap_tot', name: 'Học tập tốt', color: '#10b981', emoji: '📚' },
  { code: 'the_luc_tot', name: 'Thể lực tốt', color: '#f59e0b', emoji: '💪' },
  { code: 'tinh_nguyen_tot', name: 'Tình nguyện tốt', color: '#ef4444', emoji: '❤️' },
  { code: 'hoi_nhap_tot', name: 'Hội nhập tốt', color: '#8b5cf6', emoji: '🌍' },
];

function RadarChart({ data }) {
  const cx = 100, cy = 100, r = 70;
  const n = 5;
  const angleStep = (2 * Math.PI) / n;
  const offset = -Math.PI / 2;

  const getPoint = (idx, pct) => {
    const angle = offset + idx * angleStep;
    const dist = r * (pct / 100);
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  const gridLines = [20, 40, 60, 80, 100].map(pct => {
    const pts = Array.from({ length: n }, (_, i) => {
      const a = offset + i * angleStep;
      const d = r * (pct / 100);
      return `${cx + d * Math.cos(a)},${cy + d * Math.sin(a)}`;
    }).join(' ');
    return <polygon key={pct} points={pts} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
  });

  const dataPoints = data.map((d, i) => {
    const pt = getPoint(i, d.completion_pct || 0);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: 200 }}>
      {gridLines}
      {Array.from({ length: n }, (_, i) => {
        const a = offset + i * angleStep;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#e2e8f0" strokeWidth="1" />;
      })}
      <polygon
        points={dataPoints}
        fill="rgba(59, 130, 246, 0.2)"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const pt = getPoint(i, d.completion_pct || 0);
        return (
          <circle key={i} cx={pt.x} cy={pt.y} r="4" fill={CRITERIA[i]?.color || '#3b82f6'} />
        );
      })}
      {CRITERIA.map((c, i) => {
        const a = offset + i * angleStep;
        const x = cx + (r + 18) * Math.cos(a);
        const y = cy + (r + 18) * Math.sin(a);
        return (
          <text
            key={c.code}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="var(--gray-600)"
            fontWeight="600"
          >
            {c.emoji}
          </text>
        );
      })}
    </svg>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          api.get('/stats/dashboard'),
          api.get('/activities?limit=4&status=upcoming')
        ]);
        setStats(statsRes.data);
        setActivities(activitiesRes.data.activities || []);

        if (user?.role === 'student') {
          const progRes = await api.get(`/users/${user.id}/progress`);
          setProgress(progRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>Đang tải dashboard...</p>
      </div>
    );
  }

  const isAdmin = ['union_officer', 'province_admin', 'super_admin'].includes(user?.role);

  if (isAdmin) {
    return (
      <div className="page-container">
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Chào buổi sáng, {user?.full_name?.split(' ').slice(-1)[0]}! 👋</h2>
          <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Hội đồng xét duyệt — Năm học 2025-2026</p>
        </div>

        <div className="grid grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: 'Tổng sinh viên', value: stats?.total_students || 0, icon: '👨‍🎓', color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Hồ sơ đã nộp', value: stats?.total_applications || 0, icon: '📋', color: '#10b981', bg: '#ecfdf5' },
            { label: 'Chờ xét duyệt', value: stats?.pending_review || 0, icon: '⏳', color: '#f59e0b', bg: '#fff7ed' },
            { label: 'Minh chứng AI', value: stats?.ai_processed_evidences || 0, icon: '🤖', color: '#8b5cf6', bg: '#f5f3ff' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
              </div>
              <div>
                <div className="stat-value" style={{ color: s.color }}>{s.value.toLocaleString()}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="section-header">
            <div>
              <div className="section-title">Hồ sơ gần đây</div>
              <div className="section-subtitle">Cần xét duyệt sớm</div>
            </div>
            <Link to="/admin/applications" className="btn btn-ghost btn-sm">
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Sinh viên</th>
                  <th>Trường</th>
                  <th>Điểm AI</th>
                  <th>Trạng thái</th>
                  <th>Ngày nộp</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recent_applications || []).length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Chưa có hồ sơ</td></tr>
                ) : (
                  (stats?.recent_applications || []).map(app => (
                    <tr key={app.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{app.full_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{app.student_id}</div>
                      </td>
                      <td>{app.university_short || '-'}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                          {app.ai_score ? `${app.ai_score}/100` : '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge status-${app.status}`}>
                          {app.status === 'submitted' ? 'Đã nộp' : app.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>
                        {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('vi-VN') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Student Dashboard
  const progressData = progress?.progress || CRITERIA.map(c => ({ ...c, completion_pct: 0 }));
  const overallPct = Math.round(progressData.reduce((s, p) => s + (p.completion_pct || 0), 0) / 5);

  return (
    <div className="page-container">
      {/* Greeting */}
      <div style={{
        background: 'var(--gradient-hero)',
        borderRadius: 20, padding: '28px 32px',
        marginBottom: 24, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: 0, top: 0, width: 200, height: '100%', opacity: 0.1 }}>
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            <circle cx="150" cy="50" r="80" fill="white" />
          </svg>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="chip" style={{ marginBottom: 12, display: 'inline-flex', fontSize: 11 }}>
            <Zap size={12} /> Năm học 2025-2026
          </div>
          <h2 style={{ color: 'white', fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
            Chào {user?.full_name?.split(' ').slice(-1)[0]}! 👋
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            Hồ sơ của bạn đang đạt <strong style={{ color: '#fbbf24' }}>{overallPct}%</strong> tiến độ.
            {overallPct < 80 ? ' Hãy bổ sung thêm minh chứng!' : ' Xuất sắc! Bạn đủ điều kiện cấp Tỉnh!'}
          </p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Radar + Overall */}
        <div className="card" style={{ gridColumn: '1', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
            Biểu đồ 5 Tiêu chí
          </div>
          <RadarChart data={progressData} />
          <div style={{
            marginTop: 12, textAlign: 'center',
            fontSize: 32, fontWeight: 900,
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            {overallPct}%
          </div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Tổng tiến độ</div>
        </div>

        {/* Criteria Progress */}
        <div className="card" style={{ gridColumn: '2 / 4' }}>
          <div className="section-title" style={{ marginBottom: 16 }}>Tiến độ từng tiêu chí</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {CRITERIA.map((cat, i) => {
              const prog = progressData[i] || {};
              const pct = prog.completion_pct || 0;
              return (
                <div key={cat.code}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {cat.emoji} {cat.name}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: cat.color }}>
                      {prog.valid_count || 0} minh chứng · {pct}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${cat.color}bb, ${cat.color})` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>Thao tác nhanh</div>
        <div className="grid grid-4">
          {[
            { to: '/evidences', icon: Upload, label: 'Nộp minh chứng', desc: 'Tải lên giấy tờ', color: '#3b82f6', bg: '#eff6ff' },
            { to: '/application', icon: FileText, label: 'Hồ sơ của tôi', desc: 'Xem & nộp hồ sơ', color: '#10b981', bg: '#ecfdf5' },
            { to: '/activities', icon: Calendar, label: 'Tham gia hoạt động', desc: 'Tìm hoạt động', color: '#f59e0b', bg: '#fff7ed' },
            { to: '/chat', icon: Zap, label: 'Hỏi Trợ lý AI', desc: 'Tư vấn tức thì', color: '#8b5cf6', bg: '#f5f3ff' },
          ].map(action => (
            <Link key={action.to} to={action.to} className="card" style={{ textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <action.icon size={20} color={action.color} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{action.label}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming Activities */}
      <div className="card">
        <div className="section-header">
          <div>
            <div className="section-title">Hoạt động sắp diễn ra</div>
            <div className="section-subtitle">Đăng ký để tích điểm tiêu chí</div>
          </div>
          <Link to="/activities" className="btn btn-ghost btn-sm">
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>

        {activities.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} className="empty-state-icon" />
            <p className="empty-state-text">Chưa có hoạt động nào. Quay lại sau nhé!</p>
          </div>
        ) : (
          <div className="grid grid-2" style={{ gap: 16 }}>
            {activities.slice(0, 4).map(act => (
              <div key={act.id} style={{
                padding: '16px',
                background: 'var(--gray-50)',
                borderRadius: 12,
                border: '1px solid var(--gray-200)',
                display: 'flex', gap: 14
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: act.criteria_color ? `${act.criteria_color}20` : 'var(--gray-200)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20
                }}>
                  {act.category === 'tinh_nguyen' ? '❤️' : act.category === 'hoc_thuat' ? '📚' : act.category === 'the_thao' ? '⚽' : '🎯'}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {act.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>
                    📅 {act.start_date ? new Date(act.start_date).toLocaleDateString('vi-VN') : 'TBD'}
                    {act.location && ` · 📍 ${act.location}`}
                  </div>
                  <Link to={`/activities/${act.id}`} className="btn btn-primary btn-sm" style={{ fontSize: 11 }}>
                    Đăng ký
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
