import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import EvidencesPage from './pages/EvidencesPage';
import ActivitiesPage from './pages/ActivitiesPage';
import AdminActivities from './pages/AdminActivities';
import ApplicationPage from './pages/ApplicationPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPeriods from './pages/AdminPeriods';
import AdminCriteria from './pages/AdminCriteria';
import AdminUniversities from './pages/AdminUniversities';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminNotifications from './pages/AdminNotifications';
import api from './lib/api';
import './index.css';

// ─── Protected Route Wrapper ──────────────────────────────────
const ADMIN_ROLES = ['union_officer', 'province_admin', 'super_admin', 'admin'];
const SUPER_ROLES = ['super_admin', 'admin'];

function ProtectedAdminRoute({ children, superOnly = false }) {
  const { user } = useAuth();
  const allowedRoles = superOnly ? SUPER_ROLES : ADMIN_ROLES;
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

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
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Đang tải Hội Sinh Viên...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/application" element={<ApplicationPage />} />
          <Route path="/evidences" element={<EvidencesPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/activities/:id" element={<ActivitiesPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          {/* Admin Routes - Protected */}
          <Route path="/admin/applications" element={
            <ProtectedAdminRoute><AdminApplications /></ProtectedAdminRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>
          } />
          <Route path="/admin/activities" element={
            <ProtectedAdminRoute><AdminActivities /></ProtectedAdminRoute>
          } />
          <Route path="/admin/notifications" element={
            <ProtectedAdminRoute><AdminNotifications /></ProtectedAdminRoute>
          } />
          <Route path="/admin/periods" element={
            <ProtectedAdminRoute><AdminPeriods /></ProtectedAdminRoute>
          } />
          <Route path="/admin/criteria" element={
            <ProtectedAdminRoute><AdminCriteria /></ProtectedAdminRoute>
          } />
          <Route path="/admin/universities" element={
            <ProtectedAdminRoute><AdminUniversities /></ProtectedAdminRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedAdminRoute><AdminAnalytics /></ProtectedAdminRoute>
          } />
          <Route path="/admin/stats" element={
            <ProtectedAdminRoute><AdminAnalytics /></ProtectedAdminRoute>
          } />
          <Route path="/admin/staff" element={
            <ProtectedAdminRoute superOnly={true}><AdminStaff /></ProtectedAdminRoute>
          } />
          <Route path="/admin/audit-logs" element={
            <ProtectedAdminRoute superOnly={true}><AdminAuditLogs /></ProtectedAdminRoute>
          } />
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
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuth();

  const loadUsers = (q = '') => {
    setLoading(true);
    import('./lib/api').then(({ default: api }) => {
      const qs = q ? `?limit=50&search=${encodeURIComponent(q)}` : '?limit=50';
      api.get(`/users${qs}`)
        .then(r => setUsers(r.data.users || []))
        .finally(() => setLoading(false));
    });
  };

  useEffect(() => { loadUsers(); }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    const { default: api } = await import('./lib/api');
    const { default: toast } = await import('react-hot-toast');
    // Chỉ province_admin, super_admin, admin mới có quyền
    if (!['province_admin', 'super_admin', 'admin'].includes(currentUser?.role)) {
      toast.error('Bạn không có quyền thực hiện thao tác này');
      return;
    }
    try {
      await api.patch(`/users/${userId}/status`, { is_active: !currentStatus });
      toast.success(!currentStatus ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản');
      setUsers(prev => prev.map(u => (u._id || u.id) === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi');
    }
  };

  const canToggleStatus = ['province_admin', 'super_admin', 'admin'].includes(currentUser?.role);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Quản lý sinh viên</h2>
        <input
          className="form-input"
          style={{ width: 280 }}
          placeholder="🔍 Tìm kiếm sinh viên..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadUsers(search)}
        />
      </div>
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
                {canToggleStatus && <th>Hành động</th>}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={canToggleStatus ? 7 : 6} style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Không tìm thấy sinh viên</td></tr>
              ) : users.map(u => {
                const uid = u._id || u.id;
                const isActive = u.isActive !== false && u.is_active !== false;
                return (
                  <tr key={uid}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                          {(u.fullName || u.full_name)?.[0] || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.fullName || u.full_name}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{u.studentId || u.student_id || '—'}</td>
                    <td style={{ fontSize: 13 }}>{u.universityId?.shortName || u.university_short || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{u.gpa || '—'}</td>
                    <td>
                      <span className={`badge ${u.ekycVerified || u.ekyc_verified ? 'badge-green' : 'badge-gray'}`}>
                        {u.ekycVerified || u.ekyc_verified ? '✓ Xác thực' : 'Chưa xác thực'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isActive ? 'badge-green' : 'badge-red'}`}>
                        {isActive ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    {canToggleStatus && (
                      <td>
                        <button
                          className={`btn btn-sm ${isActive ? 'btn-ghost' : 'btn-primary'}`}
                          style={{ fontSize: 12 }}
                          onClick={() => handleToggleStatus(uid, isActive)}
                        >
                          {isActive ? 'Khóa' : 'Kích hoạt'}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Staff Management (Super Admin only) ───────────────
function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ full_name: '', email: '', password: '', role: 'union_officer', phone: '' });
  const [creating, setCreating] = useState(false);

  const ROLE_LABELS = {
    student: 'Sinh viên',
    union_officer: 'Cán bộ Hội',
    province_admin: 'Admin Tỉnh',
    admin: 'Admin Hệ thống',
    super_admin: 'Super Admin',
  };

  const loadStaff = () => {
    setLoading(true);
    import('./lib/api').then(({ default: api }) => {
      // Lấy các tài khoản có role khác student
      Promise.all([
        api.get('/users?role=union_officer&limit=50'),
        api.get('/users?role=province_admin&limit=50'),
        api.get('/users?role=admin&limit=50'),
        api.get('/users?role=super_admin&limit=50'),
      ]).then(results => {
        const allStaff = results.flatMap(r => r.data.users || []);
        setStaff(allStaff);
      }).catch(console.error).finally(() => setLoading(false));
    });
  };

  useEffect(() => { loadStaff(); }, []);

  const handleCreate = async () => {
    const { default: api } = await import('./lib/api');
    const { default: toast } = await import('react-hot-toast');
    if (!createForm.full_name || !createForm.email || !createForm.password) {
      toast.error('Vui lòng điền đủ thông tin bắt buộc');
      return;
    }
    setCreating(true);
    try {
      await api.post('/users', createForm);
      toast.success('Tạo tài khoản thành công');
      setShowCreate(false);
      setCreateForm({ full_name: '', email: '', password: '', role: 'union_officer', phone: '' });
      loadStaff();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không thể tạo tài khoản');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const { default: api } = await import('./lib/api');
    const { default: toast } = await import('react-hot-toast');
    try {
      await api.patch(`/users/${userId}/status`, { is_active: !currentStatus });
      toast.success(!currentStatus ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản');
      setStaff(prev => prev.map(s => s._id === userId ? { ...s, isActive: !currentStatus } : s));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    const { default: api } = await import('./lib/api');
    const { default: toast } = await import('react-hot-toast');
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      toast.success('Cập nhật vai trò thành công');
      setStaff(prev => prev.map(s => s._id === userId ? { ...s, role: newRole } : s));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không thể đổi vai trò');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>🛡️ Quản lý nhân viên / Cán bộ</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Tạo tài khoản
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Chưa có nhân viên nào</td></tr>
              ) : staff.map(s => (
                <tr key={s._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.fullName}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{s.phone || '—'}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{s.email}</td>
                  <td>
                    <select
                      className="form-select"
                      style={{ fontSize: 12, padding: '4px 8px' }}
                      value={s.role}
                      onChange={e => handleChangeRole(s._id, e.target.value)}
                    >
                      <option value="union_officer">Cán bộ Hội</option>
                      <option value="province_admin">Admin Tỉnh</option>
                      <option value="admin">Admin Hệ thống</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`}>
                      {s.isActive ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${s.isActive ? 'btn-ghost' : 'btn-primary'}`}
                      style={{ fontSize: 12 }}
                      onClick={() => handleToggleStatus(s._id, s.isActive)}
                    >
                      {s.isActive ? 'Khóa' : 'Kích hoạt'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h2 style={{ marginBottom: 20, fontSize: 18, fontWeight: 800 }}>Tạo tài khoản mới</h2>
            <div className="form-group">
              <label className="form-label">Họ tên *</label>
              <input className="form-input" value={createForm.full_name}
                onChange={e => setCreateForm(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Nguyễn Văn A" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={createForm.email}
                onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                placeholder="example@hsv.vn" />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu *</label>
              <input className="form-input" type="password" value={createForm.password}
                onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
                placeholder="ít nhất 8 ký tự" />
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input className="form-input" value={createForm.phone}
                onChange={e => setCreateForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="0909xxxxxx" />
            </div>
            <div className="form-group">
              <label className="form-label">Vai trò</label>
              <select className="form-select" value={createForm.role}
                onChange={e => setCreateForm(p => ({ ...p, role: e.target.value }))}>
                <option value="union_officer">Cán bộ Hội</option>
                <option value="province_admin">Admin Tỉnh</option>
                <option value="admin">Admin Hệ thống</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? 'Đang tạo...' : 'Tạo tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin Audit Logs ──────────────────────────────────────────
function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const ACTION_COLORS = {
    USER_REGISTER: '#10b981', USER_DELETE: '#ef4444', ROLE_CHANGE: '#f59e0b',
    STATUS_CHANGE: '#3b82f6', REVIEW_APPLICATION: '#8b5cf6',
    ADMIN_DELETE_EVIDENCE: '#ef4444', USER_CREATE_BY_ADMIN: '#6366f1',
  };

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/audit-logs?page=${p}&limit=30`);
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>📋 Audit Log hệ thống</h2>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thực hiện</th>
                <th>Hành động</th>
                <th>Đối tượng</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Chưa có log nào</td></tr>
              ) : logs.map(log => (
                <tr key={log._id}>
                  <td style={{ fontSize: 12, color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{log.userId?.fullName || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{log.userId?.role}</div>
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                      background: `${ACTION_COLORS[log.action] || '#94a3b8'}20`,
                      color: ACTION_COLORS[log.action] || '#94a3b8'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {log.entityType && <span>{log.entityType}: {String(log.entityId || '').substring(0, 8)}...</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 20px', borderTop: '1px solid var(--gray-100)' }}>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                style={{ minWidth: 36 }}
                onClick={() => load(p)}
              >{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App Root ──────────────────────────────────────────────
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
