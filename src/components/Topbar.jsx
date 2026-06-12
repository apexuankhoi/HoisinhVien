import { useState, useEffect } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/profile': 'Hồ sơ cá nhân',
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
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);

  const title = pageTitles[location.pathname] || 'Hội Sinh Viên';

  useEffect(() => {
    if (user) {
      api.get('/notifications?unread_only=true')
        .then(r => setUnreadCount(r.data.unread_count || 0))
        .catch(() => { });
    }
  }, [user, location.pathname]);

  const toggleNotif = async () => {
    setShowNotif(!showNotif);
    if (!showNotif) {
      setLoadingNotif(true);
      try {
        const res = await api.get('/notifications?limit=5');
        setNotifications(res.data.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingNotif(false);
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

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

      <div className="topbar-actions" style={{ position: 'relative' }}>
        <button
          className="icon-btn"
          id="notifications-btn"
          onClick={toggleNotif}
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="notif-dot" />}
        </button>

        {showNotif && (
          <>
            <style>{`
              .notif-dropdown-fixed {
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 12px;
                width: 340px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                border: 1px solid var(--gray-200);
                overflow: hidden;
                z-index: 100;
                animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
              }
              .notif-item-fixed {
                padding: 12px 16px;
                display: flex;
                gap: 12px;
                border-bottom: 1px solid var(--gray-100);
                cursor: pointer;
                transition: background 0.2s;
                text-align: left;
              }
              .notif-item-fixed:hover { background: var(--gray-50); }
              .notif-item-fixed.unread { background: #eff6ff; }
              @media (max-width: 768px) {
                .notif-dropdown-fixed {
                  position: fixed;
                  top: 70px;
                  left: 16px;
                  right: 16px;
                  width: auto;
                  margin-top: 0;
                }
              }
            `}</style>
            <div className="notif-dropdown-fixed">
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Thông báo</h4>
                {unreadCount > 0 && <span style={{ fontSize: 12, color: 'var(--primary-light)', cursor: 'pointer' }} onClick={() => notifications.forEach(n => !n.isRead && markAsRead(n._id))}>Đánh dấu đã đọc</span>}
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {loadingNotif ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--gray-500)', fontSize: 13 }}>Đang tải...</div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--gray-500)', fontSize: 13 }}>Không có thông báo mới.</div>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} className={`notif-item-fixed ${!n.isRead ? 'unread' : ''}`} onClick={() => markAsRead(n._id)}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: !n.isRead ? 600 : 400, color: 'var(--gray-900)' }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>{n.content}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: vi })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: 10, textAlign: 'center', borderTop: '1px solid var(--gray-100)', background: 'var(--gray-50)' }}>
                <a href="#all" style={{ fontSize: 12, color: 'var(--primary-light)', fontWeight: 600 }}>Xem tất cả</a>
              </div>
            </div>
          </>
        )}

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
            {user?.avatarUrl || user?.avatar_url 
              ? <img src={user.avatarUrl || user.avatar_url} style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} alt="avatar"/>
              : (user?.fullName || user?.full_name || 'U').split(' ').slice(-1)[0]?.[0] || 'U'}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }} className="hide-mobile">
            {(user?.fullName || user?.full_name || '').split(' ').slice(-2).join(' ')}
          </span>
        </div>
      </div>
    </header>
  );
}
