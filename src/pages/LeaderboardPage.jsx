import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Award } from 'lucide-react';
import api from '../lib/api';

const CRITERIA_COLORS = {
  dao_duc: '#6366f1', hoc_tap: '#10b981',
  the_luc: '#f59e0b', tinh_nguyen: '#ef4444', hoi_nhap: '#8b5cf6'
};

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard?limit=50')
      .then(r => setData(r.data.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={20} color="#fbbf24" />;
    if (rank === 2) return <Medal size={20} color="#94a3b8" />;
    if (rank === 3) return <Medal size={20} color="#cd7c2f" />;
    return <span style={{ width: 20, textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--gray-500)' }}>{rank}</span>;
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Trophy size={24} color="#fbbf24" /> Bảng xếp hạng Sinh viên 5 tốt
        </h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Năm học 2025-2026 — Cập nhật theo thời gian thực</p>
      </div>

      {/* Podium Top 3 */}
      {data.length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, marginBottom: 36, padding: '20px 0' }}>
          {/* 2nd */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: 180 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#94a3b820', border: '3px solid #94a3b8', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
              {data[1]?.full_name?.[0]}
            </div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{data[1]?.full_name?.split(' ').slice(-2).join(' ')}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{data[1]?.university_short}</div>
            <div style={{
              background: 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
              borderRadius: '10px 10px 0 0', padding: '16px 12px', marginTop: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
            }}>
              <Medal size={20} color="white" />
              <div style={{ color: 'white', fontWeight: 800, fontSize: 18, marginTop: 4 }}>
                {data[1]?.total_score?.toFixed(1) || '—'}
              </div>
            </div>
          </div>

          {/* 1st */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: 200 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>👑</div>
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#fbbf2420', border: '3px solid #fbbf24', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>
              {data[0]?.full_name?.[0]}
            </div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{data[0]?.full_name?.split(' ').slice(-2).join(' ')}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{data[0]?.university_short}</div>
            <div style={{
              background: 'var(--gradient-accent)',
              borderRadius: '10px 10px 0 0', padding: '20px 12px', marginTop: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
            }}>
              <Trophy size={24} color="white" />
              <div style={{ color: 'white', fontWeight: 800, fontSize: 22, marginTop: 4 }}>
                {data[0]?.total_score?.toFixed(1) || '—'}
              </div>
            </div>
          </div>

          {/* 3rd */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: 180 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#cd7c2f20', border: '3px solid #cd7c2f', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>
              {data[2]?.full_name?.[0]}
            </div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{data[2]?.full_name?.split(' ').slice(-2).join(' ')}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{data[2]?.university_short}</div>
            <div style={{
              background: 'linear-gradient(135deg, #cd7c2f, #e8a87c)',
              borderRadius: '10px 10px 0 0', padding: '12px 12px', marginTop: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
            }}>
              <Award size={18} color="white" />
              <div style={{ color: 'white', fontWeight: 800, fontSize: 16, marginTop: 4 }}>
                {data[2]?.total_score?.toFixed(1) || '—'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Table */}
      <div className="card" style={{ padding: 0 }}>
        {data.length === 0 ? (
          <div className="empty-state">
            <Trophy size={64} style={{ opacity: 0.2, marginBottom: 16 }} />
            <div className="empty-state-title">Bảng xếp hạng trống</div>
            <div className="empty-state-text">Chưa có hồ sơ được duyệt. Hãy nộp hồ sơ của bạn!</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sinh viên</th>
                  <th>Trường</th>
                  <th>Đạo đức</th>
                  <th>Học tập</th>
                  <th>Thể lực</th>
                  <th>Tình nguyện</th>
                  <th>Hội nhập</th>
                  <th>Tổng điểm</th>
                  <th>Danh hiệu</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry, i) => (
                  <tr key={entry.id} style={{ background: i < 3 ? `${['#fbbf2408', '#94a3b808', '#cd7c2f08'][i]}` : '' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getRankIcon(entry.rank || i + 1)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--gradient-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0
                        }}>
                          {entry.full_name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{entry.full_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{entry.student_id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{entry.university_short || '—'}</td>
                    {['score_dao_duc', 'score_hoc_tap', 'score_the_luc', 'score_tinh_nguyen', 'score_hoi_nhap'].map((key, ci) => (
                      <td key={key} style={{ textAlign: 'center' }}>
                        <span style={{
                          fontWeight: 700,
                          color: Object.values(CRITERIA_COLORS)[ci]
                        }}>
                          {entry[key]?.toFixed(0) || '—'}
                        </span>
                      </td>
                    ))}
                    <td>
                      <span style={{
                        fontWeight: 800, fontSize: 16,
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                      }}>
                        {entry.total_score?.toFixed(1) || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${entry.status === 'approved_province' ? 'badge-purple' : 'badge-green'}`}>
                        {entry.status === 'approved_province' ? '🏆 Cấp tỉnh' : '✅ Cấp trường'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
