import { useState, useEffect } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/profile': 'Tiến độ 5 tốt',
  '/application': 'Hồ sơ của tôi',
  '/evidences': 'Minh chứng',
  '/activities': 'Hoạt động',
  '/chat': 'Trợ lý AI',
  '/leaderboard': 'Bảng xếp hạng',
  '/admin/applications': 'Duyệt hồ sơ',
  '/admin/users': 'Quản lý sinh viên',
  '/admin/activities': 'Quản lý hoạt động',
  '/admin/stats': 'Thống kê',
};

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const title = pageTitles[location.pathname] || 'SV5T Đắk Lắk';

  useEffect(() => {
    if (user) {
      api.get('/notifications?unread_only=true')
        .then(r => setUnreadCount(r.data.unread_count || 0))
        .catch(() => {});
    }
  }, [user, location.pathname]);

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="icon-btn show-mobile"
          onClick={onMenuClick}
          id="menu-toggle"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="topbar-title">{title}</h1>
        </div>
      </div>

      <div className="topbar-actions">
        <button
          className="icon-btn"
          id="notifications-btn"
          onClick={() => window.location.href = '#notifications'}
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="notif-dot" />}
        </button>

        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', background: 'var(--gray-100)',
            borderRadius: 'var(--radius-full)', cursor: 'pointer'
          }}
        >
          <div
            className="avatar"
            style={{ width: 28, height: 28, fontSize: 11 }}
          >
            {user?.full_name?.split(' ').slice(-1)[0]?.[0] || 'U'}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }} className="hide-mobile">
            {user?.full_name?.split(' ').slice(-2).join(' ')}
          </span>
        </div>
      </div>
    </header>
  );
}
