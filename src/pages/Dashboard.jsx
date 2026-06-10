import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileText, Upload, Calendar, ArrowRight, Shield, Book, Zap, Heart, Globe, Play } from 'lucide-react';

const CRITERIA = [
  { code: 'dao_duc_tot', name: 'Đạo đức tốt', color: '#3b82f6', icon: Shield },
  { code: 'hoc_tap_tot', name: 'Học tập tốt', color: '#10b981', icon: Book },
  { code: 'the_luc_tot', name: 'Thể lực tốt', color: '#f59e0b', icon: Zap },
  { code: 'tinh_nguyen_tot', name: 'Tình nguyện tốt', color: '#ef4444', icon: Heart },
  { code: 'hoi_nhap_tot', name: 'Hội nhập tốt', color: '#8b5cf6', icon: Globe },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [application, setApplication] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.role === 'student') {
          const [progRes, appRes, actRes] = await Promise.all([
            api.get(`/users/${user.id}/progress`).catch(() => ({ data: null })),
            api.get('/applications?limit=1').catch(() => ({ data: { applications: [] } })),
            api.get('/activities?limit=3&status=upcoming').catch(() => ({ data: { activities: [] } }))
          ]);
          
          setProgress(progRes.data?.progress || []);
          if (appRes.data?.applications?.length > 0) {
            setApplication(appRes.data.applications[0]);
          }
          setActivities(actRes.data?.activities || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const handleCreateApp = async () => {
    try {
      await api.post('/applications');
      toast.success('Khởi tạo hồ sơ thành công!');
      window.location.reload();
    } catch (err) {
      toast.error('Không thể tạo hồ sơ.');
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  // --- ADMIN VIEW ---
  if (['union_officer', 'province_admin', 'super_admin'].includes(user?.role)) {
    return (
      <div className="page-container animate-fade-in">
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Trang quản trị</h1>
        <p className="text-muted" style={{ marginBottom: 24 }}>Quản lý hệ thống Sinh viên 5 tốt</p>
        
        <div className="grid grid-3">
          <Link to="/admin/applications" className="card" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div className="avatar" style={{ background: '#eff6ff', color: '#3b82f6', width: 48, height: 48 }}>
              <FileText size={24} />
            </div>
            <div>
              <div className="font-bold">Duyệt hồ sơ</div>
              <div className="text-muted" style={{ fontSize: 13 }}>Xem và chấm điểm</div>
            </div>
          </Link>
          <Link to="/admin/users" className="card" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div className="avatar" style={{ background: '#ecfdf5', color: '#10b981', width: 48, height: 48 }}>
              <Shield size={24} />
            </div>
            <div>
              <div className="font-bold">Quản lý sinh viên</div>
              <div className="text-muted" style={{ fontSize: 13 }}>Danh sách đăng ký</div>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // --- STUDENT VIEW ---
  const progData = CRITERIA.map((c, i) => {
    const p = progress.find(x => x.code === c.code) || {};
    return { ...c, pct: p.completion_pct || 0, count: p.valid_count || 0 };
  });
  
  const overallPct = Math.round(progData.reduce((s, p) => s + p.pct, 0) / 5);

  return (
    <div className="page-container animate-fade-in">
      
      {/* ── Header Gọn Gàng ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
            Chào {user?.full_name?.split(' ').pop()} 👋
          </h1>
          <p className="text-muted">Năm học 2025-2026 · Mục tiêu: Cấp Tỉnh</p>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/evidences" className="btn btn-outline">
            <Upload size={16} /> Bổ sung minh chứng
          </Link>
          {!application ? (
            <button className="btn btn-primary" onClick={handleCreateApp}>
              <Play size={16} /> Bắt đầu Hồ sơ
            </button>
          ) : (
            <button className="btn btn-primary" disabled={application.status !== 'draft'}>
              {application.status === 'draft' ? 'Nộp hồ sơ ngay' : 'Hồ sơ đã nộp'}
            </button>
          )}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        
        {/* ── Cột trái: Tiến độ ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Tiến độ chung</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {/* Vòng tròn tiến độ */}
              <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                  <path stroke="#e2e8f0" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${overallPct}, 100`} strokeLinecap="round" fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>{overallPct}%</span>
                </div>
              </div>
              
              <div>
                <p style={{ fontSize: 14, color: 'var(--gray-700)', marginBottom: 8 }}>
                  Bạn đã hoàn thành <strong>{overallPct}%</strong> chặng đường.
                  {overallPct >= 100 ? ' Tuyệt vời! Bạn đủ điều kiện nộp hồ sơ.' : ' Tiếp tục cố gắng nhé!'}
                </p>
                {application && (
                  <div className="badge badge-blue">
                    Trạng thái hồ sơ: {application.status}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Chi tiết 5 Tiêu chí</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {progData.map(c => {
                const Icon = c.icon;
                return (
                  <div key={c.code}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon size={14} color={c.color} /> {c.name}
                      </span>
                      <span style={{ color: c.pct >= 100 ? 'var(--success)' : 'var(--gray-600)' }}>
                        {c.count} minh chứng ({c.pct}%)
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div className="progress-fill" style={{ width: `${c.pct}%`, background: c.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── Cột phải: Hoạt động sắp tới ── */}
        <div>
          <div className="card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>Hoạt động</h2>
              <Link to="/activities" className="text-primary" style={{ fontSize: 13, fontWeight: 500 }}>Xem tất cả</Link>
            </div>
            
            {activities.length === 0 ? (
              <p className="text-muted" style={{ fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Chưa có hoạt động mới.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activities.map(act => (
                  <div key={act.id} style={{ padding: 12, border: '1px solid var(--gray-100)', borderRadius: 8, transition: 'var(--transition-fast)' }}>
                    <div className="font-semibold" style={{ fontSize: 14, marginBottom: 4 }}>{act.title}</div>
                    <div className="text-muted" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {new Date(act.start_date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
