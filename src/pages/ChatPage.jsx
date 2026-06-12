import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    <div className={`bubble-wrapper ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <div className="avatar-assistant">
          <Bot size={18} color="white" />
        </div>
      )}
      <div className={`bubble-content ${isUser ? 'user' : 'assistant'}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {msg.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Xin chào! 👋 Tôi là **Trợ lý AI Hội Sinh Viên**.

Tôi có thể giúp bạn:
- 📋 Giải đáp mọi câu hỏi về tiêu chí **Sinh viên 5 tốt**
- 🎯 Đánh giá tiến độ hồ sơ của bạn
- 📅 Gợi ý hoạt động phù hợp để bổ sung điểm
- 📎 Hướng dẫn nộp minh chứng

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
      // Only focus on desktop to avoid keyboard popping up unnecessarily on mobile
      if (window.innerWidth > 768) {
        inputRef.current?.focus();
      }
    }
  };

  const analyzeProfile = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post('/ai/analyze-profile', {});
      
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
    <div className="chat-page-root">
      <div className="chat-wrapper">
        {/* Sidebar Gợi ý */}
        <div className="chat-sidebar hide-mobile">
          <div className="chat-sidebar-card">
            <div className="sidebar-header">
              <div className="icon-wrap"><Sparkles size={16} color="white" /></div>
              Câu hỏi gợi ý
            </div>
            <div className="suggestion-list">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)} className="suggestion-btn">
                  {s}
                </button>
              ))}
            </div>

            <div className="analyze-section">
              <div className="sidebar-header" style={{ marginBottom: 12 }}>
                <div className="icon-wrap bot"><Bot size={16} color="white" /></div>
                AI Phân tích
              </div>
              <button
                onClick={analyzeProfile}
                className="btn btn-primary btn-full"
                disabled={analyzing}
              >
                {analyzing ? '⏳ Đang phân tích...' : '🔍 Phân tích hồ sơ tôi'}
              </button>
              <p className="analyze-desc">
                AI sẽ quét toàn bộ minh chứng của bạn và đưa ra gợi ý cụ thể.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Main */}
        <div className="chat-main-card">
          {/* Header */}
          <div className="chat-header">
            <div className="header-avatar">
              <Bot size={22} color="white" />
            </div>
            <div>
              <div className="header-title">Trợ lý AI SV5T</div>
              <div className="header-status">
                <div className="status-dot" />
                Đang hoạt động · Powered by VNPT Smartbot
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {loading && (
              <div className="bubble-wrapper assistant">
                <div className="avatar-assistant">
                  <Bot size={18} color="white" />
                </div>
                <div className="bubble-content loading">
                  <div className="typing-dot" style={{ animationDelay: '0s' }} />
                  <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
                  <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Mobile suggestions */}
          <div className="mobile-suggestions show-mobile">
            <div className="mobile-suggestions-scroll">
              {SUGGESTIONS.slice(0, 4).map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)} className="mobile-suggestion-btn">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="chat-input-container">
            <div className="input-wrapper">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi... (Enter để gửi)"
                className="chat-textarea"
                rows={1}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="send-btn"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Root Layout */
        .chat-page-root {
          height: calc(100dvh - var(--header-height, 64px));
          display: flex;
          background: #f1f5f9;
        }

        .chat-wrapper {
          display: flex;
          gap: 20px;
          height: 100%;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          padding: 24px;
        }

        /* Sidebar */
        .chat-sidebar {
          width: 280px;
          flex-shrink: 0;
        }
        .chat-sidebar-card {
          background: white;
          border-radius: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.05);
          overflow-y: auto;
        }
        .sidebar-header {
          font-weight: 700;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 20px 12px;
          color: var(--gray-800);
        }
        .icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(245, 158, 11, 0.2);
        }
        .icon-wrap.bot {
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          box-shadow: 0 2px 10px rgba(59, 130, 246, 0.2);
        }
        .suggestion-list {
          padding: 0 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .suggestion-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          text-align: left;
          font-size: 13px;
          color: #475569;
          cursor: pointer;
          line-height: 1.5;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .suggestion-btn:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1e40af;
          transform: translateY(-1px);
        }
        .analyze-section {
          margin-top: auto;
          border-top: 1px solid #f1f5f9;
          padding: 20px;
          background: #f8fafc;
        }
        .analyze-desc {
          font-size: 12px;
          color: #64748b;
          margin-top: 12px;
          line-height: 1.5;
          text-align: center;
        }

        /* Main Chat Area */
        .chat-main-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .chat-header {
          padding: 16px 24px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 10;
        }
        .header-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }
        .header-title {
          font-weight: 800;
          font-size: 16px;
          color: #0f172a;
        }
        .header-status {
          font-size: 12px;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
          margin-top: 2px;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.2);
        }

        /* Messages */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .bubble-wrapper {
          display: flex;
          gap: 12px;
          max-width: 85%;
          animation: slideUpFade 0.3s ease-out forwards;
        }
        .bubble-wrapper.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .bubble-wrapper.assistant {
          align-self: flex-start;
        }
        .avatar-assistant {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(59,130,246,0.2);
        }
        .bubble-content {
          padding: 14px 20px;
          border-radius: 20px;
          font-size: 15px;
          line-height: 1.6;
          word-break: break-word;
        }
        .bubble-content strong {
          font-weight: 700;
        }
        .bubble-wrapper.user .bubble-content {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 12px rgba(37,99,235,0.2);
        }
        .bubble-wrapper.assistant .bubble-content {
          background: white;
          color: #334155;
          border: 1px solid #e2e8f0;
          border-bottom-left-radius: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        
        .bubble-content p {
          margin: 0 0 10px 0;
        }
        .bubble-content p:last-child {
          margin-bottom: 0;
        }
        .bubble-content ul, .bubble-content ol {
          margin: 8px 0;
          padding-left: 24px;
        }
        .bubble-content li {
          margin-bottom: 4px;
        }
        .bubble-content h1, .bubble-content h2, .bubble-content h3, .bubble-content h4 {
          margin: 16px 0 8px 0;
          font-weight: 700;
          line-height: 1.3;
          color: #0f172a;
        }
        .bubble-wrapper.user .bubble-content h1, 
        .bubble-wrapper.user .bubble-content h2, 
        .bubble-wrapper.user .bubble-content h3, 
        .bubble-wrapper.user .bubble-content h4 {
          color: white;
        }
        .bubble-content h3 {
          font-size: 16px;
        }
        .bubble-content code {
          background: rgba(0,0,0,0.05);
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
        }
        .bubble-wrapper.user .bubble-content code {
          background: rgba(255,255,255,0.2);
        }

        /* Loading */
        .bubble-content.loading {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 16px 20px;
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #94a3b8;
          animation: typingBounce 1.4s infinite ease-in-out both;
        }

        /* Input */
        .chat-input-container {
          padding: 16px 24px;
          background: white;
          border-top: 1px solid #f1f5f9;
        }
        .input-wrapper {
          display: flex;
          align-items: flex-end;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 6px 6px 6px 20px;
          transition: all 0.2s;
        }
        .input-wrapper:focus-within {
          background: white;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
        }
        .chat-textarea {
          flex: 1;
          padding: 10px 0;
          background: transparent;
          border: none;
          outline: none;
          font-size: 15px;
          resize: none;
          max-height: 120px;
          line-height: 1.5;
          color: #0f172a;
          font-family: inherit;
        }
        .chat-textarea::placeholder {
          color: #94a3b8;
        }
        .send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          box-shadow: 0 2px 10px rgba(37,99,235,0.2);
        }
        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(37,99,235,0.3);
        }
        .send-btn:disabled {
          background: #cbd5e1;
          box-shadow: none;
          cursor: not-allowed;
          opacity: 0.7;
        }

        /* Mobile specific utilities */
        .show-mobile {
          display: none;
        }

        /* Animations */
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .chat-page-root {
            /* Tràn viền để đè lên padding của .main-content */
            margin: -16px;
            margin-top: -16px;
            height: calc(100vh - 64px);
            background: white; /* Nền trắng cho mobile sạch sẽ */
          }
          .chat-wrapper {
            padding: 0;
          }
          .hide-mobile {
            display: none !important;
          }
          .show-mobile {
            display: block;
          }
          .chat-main-card {
            border-radius: 0;
            border: none;
            box-shadow: none;
            background: #f8fafc; /* Nền chat hơi xám nhẹ */
          }
          /* Ẩn header bị trùng lặp trên mobile */
          .chat-header {
            display: none;
          }
          .chat-messages {
            padding: 16px 12px;
            gap: 16px;
          }
          .bubble-wrapper {
            max-width: 92%;
          }
          .bubble-content {
            padding: 12px 16px;
            font-size: 14.5px;
            border-radius: 18px;
          }
          
          .mobile-suggestions {
            padding: 10px 0;
            background: white;
            border-top: 1px solid #f1f5f9;
          }
          .mobile-suggestions-scroll {
            display: flex;
            gap: 8px;
            padding: 0 12px;
            overflow-x: auto;
            scrollbar-width: none;
          }
          .mobile-suggestions-scroll::-webkit-scrollbar {
            display: none;
          }
          .mobile-suggestion-btn {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            padding: 8px 16px;
            font-size: 13.5px;
            color: #3b82f6;
            font-weight: 500;
            white-space: nowrap;
            box-shadow: none;
          }
          
          .chat-input-container {
            padding: 10px 12px;
            padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
            background: white;
            border-top: 1px solid #f1f5f9;
            box-shadow: none;
          }
          .input-wrapper {
            background: #f1f5f9;
            border-color: transparent;
            padding: 4px 4px 4px 16px;
            border-radius: 24px;
          }
          .input-wrapper:focus-within {
            background: white;
            border-color: #3b82f6;
          }
          .chat-textarea {
            font-size: 15px;
            padding: 8px 0;
            max-height: 100px;
          }
          .send-btn {
            width: 38px;
            height: 38px;
          }
        }
      `}</style>
    </div>
  );
}

