import { useState, useEffect } from 'react';
import { FileText, Send, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const STATUS_MAP = {
  draft: { label: 'Bản nháp', color: '#64748b', bg: '#f1f5f9', icon: '📝' },
  submitted: { label: 'Đã nộp', color: '#3b82f6', bg: '#eff6ff', icon: '📤' },
  under_review: { label: 'Đang xét duyệt', color: '#f59e0b', bg: '#fff7ed', icon: '🔍' },
  approved_school: { label: '✅ Đạt cấp trường', color: '#10b981', bg: '#ecfdf5', icon: '🏫' },
  approved_province: { label: '🏆 Đạt cấp tỉnh', color: '#8b5cf6', bg: '#f5f3ff', icon: '🌟' },
  rejected: { label: 'Không đạt', color: '#ef4444', bg: '#fef2f2', icon: '❌' },
  revision_needed: { label: 'Cần bổ sung', color: '#f97316', bg: '#fff7ed', icon: '📋' },
};

export default function ApplicationPage() {
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appRes, catRes] = await Promise.all([
        api.get('/applications?limit=1'),
        api.get('/criteria')
      ]);
      const apps = appRes.data.applications || [];
      if (apps.length > 0) {
        const detail = await api.get(`/applications/${apps[0].id}`);
        setApplication(detail.data);
      }
      setCategories(catRes.data.criteria || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async () => {
    setCreating(true);
    try {
      await api.post('/applications');
      toast.success('Đã tạo hồ sơ thành công!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không thể tạo hồ sơ.');
    } finally {
      setCreating(false);
    }
  };

  const submitApplication = async () => {
    if (!confirm('Bạn chắc chắn muốn nộp hồ sơ? Sau khi nộp không thể chỉnh sửa.')) return;
    setSubmitting(true);
    try {
      await api.post(`/applications/${application.application.id}/submit`);
      toast.success('Nộp hồ sơ thành công! 🎉');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không thể nộp hồ sơ.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  if (!application) {
    return (
      <div className="page-container">
        <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📋</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Chưa có hồ sơ</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: 28, lineHeight: 1.7 }}>
            Bạn chưa có hồ sơ đăng ký danh hiệu "Sinh viên 5 tốt" cho năm học 2025-2026.
            Tạo hồ sơ ngay để bắt đầu hành trình!
          </p>
          <button
            id="create-application-btn"
            className="btn btn-primary btn-lg"
            onClick={createApplication}
            disabled={creating}
          >
            {creating ? 'Đang tạo...' : '🚀 Tạo hồ sơ ngay'}
          </button>
        </div>
      </div>
    );
  }

  const { application: app, categories: cats } = application;
  const statusInfo = STATUS_MAP[app.status] || STATUS_MAP.draft;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="card" style={{ marginBottom: 24, background: 'var(--gradient-hero)', border: 'none', padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: statusInfo.bg, color: statusInfo.color,
              padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
              marginBottom: 12
            }}>
              {statusInfo.icon} {statusInfo.label}
            </div>
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
              Hồ sơ Sinh viên 5 tốt
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
              Năm học 2025-2026 · Nộp trước {app.submission_deadline
                ? new Date(app.submission_deadline).toLocaleDateString('vi-VN') : '30/04/2026'}
            </p>
          </div>

          {app.total_score && (
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 24px' }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: '#fbbf24' }}>
                {parseFloat(app.total_score).toFixed(1)}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Điểm AI sơ bộ</div>
            </div>
          )}
        </div>

        {app.status === 'draft' && (
          <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/evidences" className="btn btn-accent">
              📎 Bổ sung minh chứng
            </Link>
            <button
              className="btn btn-outline"
              onClick={submitApplication}
              disabled={submitting}
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
            >
              {submitting ? '⏳ Đang nộp...' : <><Send size={16} /> Nộp hồ sơ</>}
            </button>
          </div>
        )}

        {app.review_notes && (
          <div style={{
            marginTop: 16, padding: '12px 16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 10, color: 'white', fontSize: 14
          }}>
            💬 <strong>Nhận xét từ hội đồng:</strong> {app.review_notes}
          </div>
        )}
      </div>

      {/* Scores by criterion */}
      {app.score_dao_duc && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>🤖 Kết quả chấm điểm AI</div>
          <div className="grid grid-4" style={{ gap: 16 }}>
            {[
              { name: '🛡️ Đạo đức', score: app.score_dao_duc, color: '#6366f1' },
              { name: '📚 Học tập', score: app.score_hoc_tap, color: '#10b981' },
              { name: '💪 Thể lực', score: app.score_the_luc, color: '#f59e0b' },
              { name: '❤️ Tình nguyện', score: app.score_tinh_nguyen, color: '#ef4444' },
              { name: '🌍 Hội nhập', score: app.score_hoi_nhap, color: '#8b5cf6' },
            ].map(s => (
              <div key={s.name} style={{ textAlign: 'center', padding: '16px', background: 'var(--gray-50)', borderRadius: 12 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>
                  {parseFloat(s.score || 0).toFixed(0)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 4 }}>{s.name}</div>
                <div className="progress-bar" style={{ marginTop: 8 }}>
                  <div className="progress-fill" style={{ width: `${s.score || 0}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>

          {app.ai_analysis && (() => {
            try {
              const analysis = JSON.parse(app.ai_analysis);
              return (
                <div style={{ marginTop: 16, padding: 16, background: '#f0f9ff', borderRadius: 12 }}>
                  <p style={{ fontWeight: 700, color: 'var(--primary-light)', marginBottom: 8 }}>💡 AI Nhận xét:</p>
                  {analysis.strengths?.length > 0 && (
                    <p style={{ fontSize: 14, color: 'var(--gray-700)', marginBottom: 6 }}>
                      ✅ <strong>Điểm mạnh:</strong> {analysis.strengths.join(' · ')}
                    </p>
                  )}
                  {analysis.improvements?.length > 0 && (
                    <p style={{ fontSize: 14, color: 'var(--gray-700)', marginBottom: 6 }}>
                      📈 <strong>Cần cải thiện:</strong> {analysis.improvements.join(' · ')}
                    </p>
                  )}
                  <p style={{ fontSize: 14, fontWeight: 600, color: app.total_score >= 80 ? 'var(--success)' : 'var(--warning)' }}>
                    🎯 {analysis.recommendation}
                  </p>
                </div>
              );
            } catch { return null; }
          })()}
        </div>
      )}

      {/* Evidence by Category */}
      <div className="section-title" style={{ marginBottom: 16 }}>Minh chứng theo tiêu chí</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {(cats || categories).map(cat => {
          const catEvidences = cat.evidences || [];
          const validCount = catEvidences.filter(e => e.ai_status === 'valid' || e.admin_status === 'approved').length;
          const pct = Math.min(100, validCount * 50);

          return (
            <div
              key={cat.id}
              className="card criterion-card"
              style={{ '--cat-color': cat.color }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${cat.color}20`, border: `2px solid ${cat.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                }}>
                  {cat.code === 'dao_duc_tot' ? '🛡️' : cat.code === 'hoc_tap_tot' ? '📚' :
                   cat.code === 'the_luc_tot' ? '💪' : cat.code === 'tinh_nguyen_tot' ? '❤️' : '🌍'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{cat.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                    {validCount}/{catEvidences.length} minh chứng hợp lệ
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: cat.color }}>{pct}%</div>
                  <div style={{ fontSize: 11, color: pct >= 100 ? 'var(--success)' : 'var(--gray-500)' }}>
                    {pct >= 100 ? '✅ Đạt' : 'Chưa đạt'}
                  </div>
                </div>
              </div>

              <div className="progress-bar" style={{ marginBottom: catEvidences.length > 0 ? 12 : 0 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: cat.color }} />
              </div>

              {catEvidences.length > 0 ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {catEvidences.slice(0, 4).map(ev => (
                    <div
                      key={ev.id}
                      style={{
                        padding: '4px 10px', background: 'var(--gray-50)',
                        border: '1px solid var(--gray-200)', borderRadius: 8,
                        fontSize: 12, display: 'flex', alignItems: 'center', gap: 4
                      }}
                    >
                      {ev.ai_status === 'valid' ? '✅' : ev.ai_status === 'pending' ? '⏳' : '⚠️'}
                      {ev.title || ev.file_name}
                    </div>
                  ))}
                  {catEvidences.length > 4 && (
                    <div style={{ padding: '4px 10px', fontSize: 12, color: 'var(--gray-500)' }}>
                      +{catEvidences.length - 4} minh chứng khác
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/evidences"
                  style={{ color: cat.color, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={14} /> Thêm minh chứng cho tiêu chí này
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
