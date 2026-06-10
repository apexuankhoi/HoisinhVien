import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, CheckCircle, XCircle, Clock, Eye, Trash2, Plus } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const CATEGORIES = [
  { id: null, code: 'dao_duc_tot', name: '🛡️ Đạo đức tốt', color: '#6366f1' },
  { id: null, code: 'hoc_tap_tot', name: '📚 Học tập tốt', color: '#10b981' },
  { id: null, code: 'the_luc_tot', name: '💪 Thể lực tốt', color: '#f59e0b' },
  { id: null, code: 'tinh_nguyen_tot', name: '❤️ Tình nguyện tốt', color: '#ef4444' },
  { id: null, code: 'hoi_nhap_tot', name: '🌍 Hội nhập tốt', color: '#8b5cf6' },
];

function StatusIcon({ status }) {
  if (status === 'valid') return <CheckCircle size={16} color="var(--success)" />;
  if (status === 'invalid') return <XCircle size={16} color="var(--danger)" />;
  if (status === 'uncertain') return <Clock size={16} color="var(--warning)" />;
  return <Clock size={16} color="var(--gray-400)" />;
}

function UploadModal({ categories, onClose, onSuccess }) {
  const [form, setForm] = useState({
    criteria_category_id: '',
    title: '',
    issue_date: '',
    issuing_organization: '',
    description: ''
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(accepted => {
    setFiles(accepted.slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Vui lòng chọn file minh chứng');
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
        await api.post('/evidences/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      toast.success(`Đã tải lên ${files.length} minh chứng. AI đang xử lý...`);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Tải lên thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>📎 Nộp minh chứng mới</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--gray-400)' }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`upload-zone ${isDragActive ? 'dragover' : ''}`}
            style={{ marginBottom: 16 }}
          >
            <input {...getInputProps()} />
            <Upload size={36} color="var(--gray-400)" style={{ margin: '0 auto 12px' }} />
            {files.length > 0 ? (
              <div>
                <p style={{ fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
                  {files.length} file được chọn:
                </p>
                {files.map(f => (
                  <div key={f.name} className="file-preview" style={{ marginBottom: 6 }}>
                    <div className="file-icon" style={{ width: 30, height: 30, fontSize: 14 }}>
                      {f.type.startsWith('image/') ? '🖼️' : '📄'}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{(f.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p style={{ fontWeight: 600, color: 'var(--gray-700)', marginBottom: 4 }}>
                  {isDragActive ? 'Thả file vào đây' : 'Kéo thả file hoặc click để chọn'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                  Hỗ trợ: JPG, PNG, PDF · Tối đa 10MB/file · Tối đa 5 file
                </p>
              </>
            )}
          </div>

          <div className="grid grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Tiêu chí liên quan <span className="required">*</span></label>
              <select
                className="form-select"
                value={form.criteria_category_id}
                onChange={e => setForm(p => ({ ...p, criteria_category_id: e.target.value }))}
                required
              >
                <option value="">-- Chọn tiêu chí --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Ngày cấp</label>
              <input
                type="date"
                className="form-input"
                value={form.issue_date}
                onChange={e => setForm(p => ({ ...p, issue_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tiêu đề minh chứng <span className="required">*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: Giải Nhất Cuộc thi Học thuật khoa Công nghệ"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Đơn vị cấp</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: Hội Sinh viên trường ĐH Tây Nguyên"
              value={form.issuing_organization}
              onChange={e => setForm(p => ({ ...p, issuing_organization: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả thêm</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Thông tin bổ sung về minh chứng..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? '⏳ Đang tải lên...' : '📤 Nộp minh chứng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EvidencesPage() {
  const [evidences, setEvidences] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const fetchData = async () => {
    try {
      const [evRes, catRes] = await Promise.all([
        api.get('/evidences'),
        api.get('/criteria')
      ]);
      setEvidences(evRes.data.evidences || []);
      setCategories(catRes.data.criteria || []);
    } catch (err) {
      toast.error('Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Xóa minh chứng này?')) return;
    try {
      await api.delete(`/evidences/${id}`);
      toast.success('Đã xóa minh chứng');
      setEvidences(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      toast.error('Không thể xóa');
    }
  };

  const filtered = activeCategory === 'all'
    ? evidences
    : evidences.filter(e => e.criteria_category_id === activeCategory);

  const getStatusLabel = (status) => {
    if (status === 'valid') return { label: 'AI: Hợp lệ', color: 'badge-green' };
    if (status === 'invalid') return { label: 'AI: Không hợp lệ', color: 'badge-red' };
    if (status === 'uncertain') return { label: 'AI: Cần xem xét', color: 'badge-yellow' };
    return { label: 'Đang xử lý', color: 'badge-gray' };
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Minh chứng của tôi</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>{evidences.length} minh chứng đã nộp</p>
        </div>
        <button
          id="upload-evidence-btn"
          className="btn btn-primary"
          onClick={() => setShowUpload(true)}
        >
          <Plus size={18} /> Nộp minh chứng
        </button>
      </div>

      {/* Stats by category */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Tổng minh chứng', value: evidences.length, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'AI đã duyệt', value: evidences.filter(e => e.ai_status === 'valid').length, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Chờ xử lý', value: evidences.filter(e => e.ai_status === 'pending').length, color: '#f59e0b', bg: '#fff7ed' },
          { label: 'Cần xem xét', value: evidences.filter(e => e.ai_status === 'uncertain').length, color: '#ef4444', bg: '#fef2f2' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveCategory('all')}
          className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-ghost'}`}
        >
          Tất cả ({evidences.length})
        </button>
        {categories.map(cat => {
          const count = evidences.filter(e => e.criteria_category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`btn btn-sm ${activeCategory === cat.id ? 'btn-primary' : 'btn-ghost'}`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Evidence Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <Upload size={64} style={{ opacity: 0.2, marginBottom: 16 }} />
          <div className="empty-state-title">Chưa có minh chứng nào</div>
          <div className="empty-state-text">
            Hãy tải lên giấy khen, chứng nhận, bảng điểm... để AI tự động xác minh và tính điểm.
          </div>
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
            <Plus size={16} /> Nộp minh chứng đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-3" style={{ gap: 16 }}>
          {filtered.map(ev => {
            const statusInfo = getStatusLabel(ev.ai_status);
            const isImage = ev.file_type?.startsWith('image/');

            return (
              <div
                key={ev.id}
                className="card"
                style={{ padding: 16, cursor: 'pointer' }}
                onClick={() => setSelectedEvidence(ev)}
              >
                {/* Preview */}
                <div style={{
                  height: 120, borderRadius: 10,
                  background: 'var(--gray-100)',
                  marginBottom: 12, overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative'
                }}>
                  {isImage ? (
                    <img
                      src={ev.file_url}
                      alt={ev.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => e.target.style.display = 'none'}
                    />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <FileText size={40} color="var(--gray-400)" />
                      <p style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>PDF Document</p>
                    </div>
                  )}

                  {/* AI status overlay */}
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    background: ev.ai_status === 'valid' ? '#10b981' : ev.ai_status === 'invalid' ? '#ef4444' : '#f59e0b',
                    borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: 'white'
                  }}>
                    {ev.ai_status === 'valid' ? '✓ AI OK' : ev.ai_status === 'pending' ? '⏳' : '?'}
                  </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.title || ev.file_name}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  {ev.category_color && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: ev.category_color, flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                    {ev.category_name || 'Chưa phân loại'}
                  </span>
                </div>

                {ev.ai_status === 'invalid' && ev.ai_notes && (
                  <div style={{
                    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
                    padding: '8px 10px', fontSize: 11, color: '#dc2626',
                    marginBottom: 10, lineHeight: 1.5
                  }}>
                    <b>Lý do từ chối:</b> {ev.ai_notes}
                  </div>
                )}

                {ev.ocr_text && ev.ai_status !== 'invalid' && (
                  <div style={{
                    background: 'var(--gray-50)', borderRadius: 8,
                    padding: '6px 10px', fontSize: 11, color: 'var(--gray-600)',
                    marginBottom: 10, maxHeight: 60, overflow: 'hidden',
                    lineHeight: 1.5
                  }}>
                    🤖 {ev.ocr_text.substring(0, 100)}...
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`badge ${statusInfo.color}`} style={{ fontSize: 10 }}>
                    {statusInfo.label}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }}
                    style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', padding: 4 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          categories={categories}
          onClose={() => setShowUpload(false)}
          onSuccess={() => { setShowUpload(false); fetchData(); }}
        />
      )}

      {/* Evidence Detail Modal */}
      {selectedEvidence && (
        <div className="modal-overlay" onClick={() => setSelectedEvidence(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>Chi tiết minh chứng</h2>
              <button onClick={() => setSelectedEvidence(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 2 }}>Tiêu đề</p>
                <p style={{ fontWeight: 600 }}>{selectedEvidence.title || selectedEvidence.file_name}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 2 }}>Tiêu chí</p>
                <p style={{ fontWeight: 600 }}>{selectedEvidence.category_name || '—'}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 2 }}>Đơn vị cấp</p>
                <p style={{ fontWeight: 600 }}>{selectedEvidence.issuing_organization || '—'}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 2 }}>Ngày cấp</p>
                <p style={{ fontWeight: 600 }}>
                  {selectedEvidence.issue_date ? new Date(selectedEvidence.issue_date).toLocaleDateString('vi-VN') : '—'}
                </p>
              </div>
            </div>

            {selectedEvidence.ai_status === 'invalid' && selectedEvidence.ai_notes && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>❌ Lý do bị từ chối</p>
                <p style={{ fontSize: 13, color: '#dc2626', lineHeight: 1.6 }}>{selectedEvidence.ai_notes}</p>
              </div>
            )}

            {/* OCR Result */}
            {selectedEvidence.ocr_text && selectedEvidence.ai_status !== 'invalid' && (
              <div style={{ background: '#f0f9ff', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-light)', marginBottom: 8 }}>
                  🤖 Kết quả AI OCR (Độ chính xác: {Math.round((selectedEvidence.ocr_confidence || 0) * 100)}%)
                </p>
                <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {selectedEvidence.ocr_text}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <a
                href={selectedEvidence.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                <Eye size={14} /> Xem file
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
