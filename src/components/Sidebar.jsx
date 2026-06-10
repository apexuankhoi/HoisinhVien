import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Upload, Calendar, MessageSquare,
  Trophy, Bell, Settings, LogOut, Users, BarChart2,
  BookOpen, Star, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const studentNav = [
  {
    label: 'TỔNG QUAN', items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/profile', icon: Star, label: 'Hồ sơ cá nhân' },
    ]
  },
  {
    label: 'HỒ SƠ', items: [
      { path: '/application', icon: FileText, label: 'Hồ sơ của tôi' },
      { path: '/evidences', icon: Upload, label: 'Minh chứng' },
    ]
  },
  {
    label: 'KHÁM PHÁ', items: [
      { path: '/activities', icon: Calendar, label: 'Hoạt động' },
      { path: '/chat', icon: MessageSquare, label: 'Trợ lý AI' },
      { path: '/leaderboard', icon: Trophy, label: 'Bảng xếp hạng' },
    ]
  },
];

const adminNav = [
  {
    label: 'QUẢN TRỊ', items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
      { path: '/admin/applications', icon: FileText, label: 'Duyệt hồ sơ' },
      { path: '/admin/users', icon: Users, label: 'Sinh viên' },
      { path: '/admin/activities', icon: Calendar, label: 'Quản lý hoạt động' },
      { path: '/admin/stats', icon: BarChart2, label: 'Thống kê' },
    ]
  },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navSections = ['union_officer', 'province_admin', 'super_admin'].includes(user?.role)
    ? adminNav
    : studentNav;

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const initials = user?.full_name
    ?.split(' ')
    .slice(-2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || 'SV';

  return (
    <>
      <div
        className={`mobile-overlay ${mobileOpen ? 'show' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: 'transparent' }}>
            <img src="/logo.png" alt="Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </div>
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-title">Hội Sinh Viên</div>
            <div className="sidebar-logo-subtitle"></div>
          </div>
          <button
            onClick={onClose}
            style={{
              display: 'none', marginLeft: 'auto',
              background: 'transparent', border: 'none',
              color: 'rgba(255,255,255,0.6)', cursor: 'pointer'
            }}
            className="show-mobile"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navSections.map(section => (
            <div key={section.label}>
              <div className="nav-section-label">{section.label}</div>
              {section.items.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div
              className="avatar"
              style={{ width: 36, height: 36, fontSize: 13 }}
            >
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : initials
              }
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div className="sidebar-user-name">{user?.full_name || 'Người dùng'}</div>
              <div className="sidebar-user-role">
                {user?.role === 'student' ? 'Sinh viên' :
                  user?.role === 'union_officer' ? 'Cán bộ Hội' :
                    user?.role === 'province_admin' ? 'Admin Tỉnh' : 'Super Admin'}
              </div>
            </div>
            <button
              onClick={logout}
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}
              data-tooltip="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
