import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import EvidencesPage from './pages/EvidencesPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ApplicationPage from './pages/ApplicationPage';
import LeaderboardPage from './pages/LeaderboardPage';
import './index.css';

// ─── Protected Route Wrapper ───────────────────────────────────
function AppContent() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--gradient-hero)', flexDirection: 'column', gap: 20
      }}>
        <div style={{
          width: 64, height: 64, background: 'rgba(255,255,255,0.15)',
          borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32
        }}>
          🎓
        </div>
        <div className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Đang tải SV5T Đắk Lắk...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Dashboard />} />
          <Route path="/application" element={<ApplicationPage />} />
          <Route path="/evidences" element={<EvidencesPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/activities/:id" element={<ActivitiesPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          {/* Admin Routes */}
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/activities" element={<ActivitiesPage />} />
          <Route path="/admin/stats" element={<Dashboard />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

// ─── Admin Placeholder Pages ───────────────────────────────────
function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: '', notes: '' });

  useEffect(() => {
    import('./lib/api').then(({ default: api }) => {
      api.get('/applications?limit=50')
        .then(r => setApps(r.data.applications || []))
        .finally(() => setLoading(false));
    });
  }, []);

  const STATUS_MAP = {
    draft: 'Bản nháp', submitted: 'Đã nộp', under_review: 'Đang xét',
    approved_school: 'Đạt cấp trường', approved_province: 'Đạt cấp tỉnh',
    rejected: 'Không đạt', revision_needed: 'Cần bổ sung'
  };

  const handleReview = async (appId) => {
    const { default: api } = await import('./lib/api');
    const { default: toast } = await import('react-hot-toast');
    try {
      await api.patch(`/applications/${appId}/review`, {
        status: reviewForm.status,
        review_notes: reviewForm.notes
      });
      toast.success('Đã cập nhật trạng thái hồ sơ');
      setReviewing(null);
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status: reviewForm.status } : a));
    } catch (err) {
      toast.error('Không thể cập nhật');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Duyệt hồ sơ Sinh viên 5 tốt</h2>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>Trường</th>
                <th>Điểm AI</th>
                <th>Trạng thái</th>
                <th>Ngày nộp</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Chưa có hồ sơ nào</td></tr>
              ) : apps.map(app => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{app.full_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{app.student_id}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{app.university_short || '—'}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                      {app.ai_score ? `${parseFloat(app.ai_score).toFixed(1)}/100` : '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge status-${app.status}`} style={{ fontSize: 11 }}>
                      {STATUS_MAP[app.status] || app.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                    {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setReviewing(app)}
                      disabled={app.status === 'draft'}
                    >
                      Xét duyệt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {reviewing && (
        <div className="modal-overlay" onClick={() => setReviewing(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16, fontSize: 18, fontWeight: 800 }}>
              Xét duyệt: {reviewing.full_name}
            </h2>
            <div className="form-group">
              <label className="form-label">Kết quả xét duyệt</label>
              <select
                className="form-select"
                value={reviewForm.status}
                onChange={e => setReviewForm(p => ({ ...p, status: e.target.value }))}
              >
                <option value="">-- Chọn kết quả --</option>
                <option value="under_review">Đang xem xét thêm</option>
                <option value="approved_school">✅ Đạt danh hiệu cấp Trường</option>
                <option value="approved_province">🏆 Đạt danh hiệu cấp Tỉnh</option>
                <option value="revision_needed">📋 Cần bổ sung hồ sơ</option>
                <option value="rejected">❌ Không đạt</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nhận xét</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Nhận xét của hội đồng xét duyệt..."
                value={reviewForm.notes}
                onChange={e => setReviewForm(p => ({ ...p, notes: e.target.value }))}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setReviewing(null)}>Hủy</button>
              <button
                className="btn btn-primary"
                onClick={() => handleReview(reviewing.id)}
                disabled={!reviewForm.status}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('./lib/api').then(({ default: api }) => {
      api.get('/users?limit=50')
        .then(r => setUsers(r.data.users || []))
        .finally(() => setLoading(false));
    });
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Quản lý sinh viên</h2>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Sinh viên</th>
                <th>MSV</th>
                <th>Trường</th>
                <th>GPA</th>
                <th>eKYC</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                        {u.full_name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.full_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{u.student_id || '—'}</td>
                  <td style={{ fontSize: 13 }}>{u.university_short || '—'}</td>
                  <td style={{ fontWeight: 700 }}>{u.gpa || '—'}</td>
                  <td>
                    <span className={`badge ${u.ekyc_verified ? 'badge-green' : 'badge-gray'}`}>
                      {u.ekyc_verified ? '✓ Xác thực' : 'Chưa xác thực'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                      {u.is_active ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── App Root ──────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--gray-900)',
              color: 'white',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'var(--font-primary)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
            },
            success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
            error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
