import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Plus, Sparkles, BookOpen, FileText, Calendar } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  'Điều kiện đạt Sinh viên 5 tốt cấp tỉnh là gì?',
  'GPA 3.2 có đủ tiêu chí Học tập tốt không?',
  'Cần bao nhiêu giờ tình nguyện?',
  'IELTS 5.5 có được tính điểm Hội nhập không?',
  'Hạn nộp hồ sơ năm nay là khi nào?',
  'Hồ sơ của tôi còn thiếu gì?',
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Bot size={16} color="white" />
        </div>
      )}
      <div
        className={`chat-bubble ${isUser ? 'user' : 'assistant'}`}
        style={{ maxWidth: '75%' }}
        dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }}
      />
      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'var(--gray-200)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <User size={16} color="var(--gray-600)" />
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Initial greeting message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Xin chào! 👋 Tôi là **Trợ lý AI Hội Sinh Viên**.

Tôi có thể giúp bạn:
• 📋 Giải đáp mọi câu hỏi về tiêu chí **Sinh viên 5 tốt**
• 🎯 Đánh giá tiến độ hồ sơ của bạn
• 📅 Gợi ý hoạt động phù hợp để bổ sung điểm
• 📎 Hướng dẫn nộp minh chứng

Bạn muốn hỏi gì hôm nay?`,
      created_at: new Date().toISOString()
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    const userMsg = { id: Date.now(), role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: msg,
        conversation_id: conversationId
      });
      setConversationId(res.data.conversation_id);
      setMessages(prev => [...prev, res.data.message]);
    } catch (err) {
      toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: '❌ Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const analyzeProfile = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post('/ai/analyze-profile', {});
      setAnalysis(res.data);

      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: `📊 **Phân tích hồ sơ của bạn:**\n\n${res.data.summary}\n\n${res.data.missing_categories.length > 0
            ? `**Tiêu chí cần bổ sung:**\n${res.data.missing_categories.map(c => `• ${c}`).join('\n')}`
            : '✅ Tất cả tiêu chí đều có minh chứng!'
          }`
      }]);
    } catch (err) {
      toast.error('Không thể phân tích hồ sơ.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="page-container" style={{ height: 'calc(100dvh - 100px)', display: 'flex', flexDirection: 'column', padding: '12px' }}>
      <div style={{ display: 'flex', gap: 16, height: '100%' }}>
        {/* Sidebar gợi ý */}
        <div className="hide-mobile" style={{ width: 240, flexShrink: 0 }}>
          <div className="card" style={{ height: '100%', overflow: 'auto' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="var(--accent)" />
              Câu hỏi gợi ý
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
                    borderRadius: 10, padding: '10px 12px', textAlign: 'left',
                    fontSize: 12, color: 'var(--gray-700)', cursor: 'pointer',
                    lineHeight: 1.5, transition: 'var(--transition-fast)'
                  }}
                  onMouseOver={e => e.target.style.background = '#eff6ff'}
                  onMouseOut={e => e.target.style.background = 'var(--gray-50)'}
                >
                  💬 {s}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 20, borderTop: '1px solid var(--gray-200)', paddingTop: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Bot size={16} color="var(--primary-light)" />
                AI Phân tích
              </div>
              <button
                onClick={analyzeProfile}
                className="btn btn-primary btn-full"
                disabled={analyzing}
                style={{ fontSize: 13 }}
              >
                {analyzing ? '⏳ Đang phân tích...' : '🔍 Phân tích hồ sơ tôi'}
              </button>
              <p style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 8, lineHeight: 1.5 }}>
                AI sẽ quét toàn bộ minh chứng của bạn và đưa ra gợi ý cụ thể.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Main */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--gray-200)',
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Bot size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Trợ lý AI SV5T</div>
              <div style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                Đang hoạt động · Powered by VNPT Smartbot
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Bot size={16} color="white" />
                </div>
                <div style={{
                  background: 'white', border: '1px solid var(--gray-200)',
                  borderRadius: '18px 18px 18px 4px',
                  padding: '12px 16px', display: 'flex', gap: 4
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--gray-400)',
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Mobile suggestions */}
          <div className="show-mobile" style={{ padding: '8px 16px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
              {SUGGESTIONS.slice(0, 3).map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: 'var(--gray-100)', border: '1px solid var(--gray-200)',
                    borderRadius: 20, padding: '6px 14px', fontSize: 12,
                    color: 'var(--gray-700)', cursor: 'pointer', whiteSpace: 'nowrap'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--gray-200)',
            display: 'flex', gap: 8, background: 'white'
          }}>
            <textarea
              ref={inputRef}
              id="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi... (Enter để gửi)"
              style={{
                flex: 1, padding: '10px 14px',
                border: '2px solid var(--gray-200)',
                borderRadius: 12, fontSize: 14,
                fontFamily: 'inherit', resize: 'none',
                height: 44, maxHeight: 120, outline: 'none',
                transition: 'border-color 0.2s',
                lineHeight: 1.5
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary-light)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
              rows={1}
            />
            <button
              id="send-btn"
              onClick={() => sendMessage()}
              className="btn btn-primary"
              disabled={loading || !input.trim()}
              style={{ borderRadius: 12, padding: '0 14px', flexShrink: 0 }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
