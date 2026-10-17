import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Smile, 
  ShieldCheck,
  Mail,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentToolName?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose,
  currentToolName 
}) => {
  const targetEmail = 'nhgb2605@gmail.com';
  
  const [name, setName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [category, setCategory] = useState<'bug' | 'feature' | 'ux' | 'other'>('bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [includeEnvInfo, setIncludeEnvInfo] = useState(true);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Prefill subject with tool if available
      if (!subject && currentToolName && currentToolName !== 'home') {
        setSubject(`[Phản hồi DopiSery] Về công cụ ${currentToolName}`);
      }
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, currentToolName, subject]);

  if (!isOpen) return null;

  const getCategoryLabel = () => {
    switch (category) {
      case 'bug': return 'Báo lỗi (Bug Report)';
      case 'feature': return 'Đề xuất tính năng mới';
      case 'ux': return 'Đánh giá & Trải nghiệm người dùng';
      case 'other': return 'Câu hỏi hoặc góp ý khác';
    }
  };

  const generateEmailBody = () => {
    let body = `Xin chào tác giả DopiSery,\n\n`;
    body += `Tôi gửi phản hồi với nội dung như sau:\n`;
    body += `------------------------------------\n`;
    body += `• Loại phản hồi: ${getCategoryLabel()}\n`;
    if (name) body += `• Người gửi: ${name}\n`;
    if (userEmail) body += `• Email liên hệ lại: ${userEmail}\n`;
    if (currentToolName) body += `• Công cụ đang thao tác: ${currentToolName}\n`;
    body += `\nNỘI DUNG CHI TIẾT:\n${message || '(Chưa nhập chi tiết)'}\n\n`;
    
    if (includeEnvInfo) {
      body += `------------------------------------\n`;
      body += `THÔNG TIN THIẾT BỊ HỖ TRỢ:\n`;
      body += `• Trình duyệt: ${navigator.userAgent}\n`;
      body += `• Màn hình: ${window.innerWidth}x${window.innerHeight}\n`;
      body += `• Thời gian: ${new Date().toLocaleString('vi-VN')}\n`;
    }
    return body;
  };

  const handleSendViaEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const emailSubject = encodeURIComponent(subject.trim() || `[Phản hồi DopiSery] ${getCategoryLabel()}`);
    const emailBody = encodeURIComponent(generateEmailBody());
    
    // Open mail client
    window.location.href = `mailto:${targetEmail}?subject=${emailSubject}&body=${emailBody}`;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  const handleCopyContent = () => {
    const fullText = `Tiêu đề: ${subject || getCategoryLabel()}\nGửi tới: ${targetEmail}\n\n${generateEmailBody()}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 my-8 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Gửi phản hồi & Góp ý
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đóng góp ý kiến giúp hoàn thiện bộ công cụ DopiSery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSendViaEmail} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Category selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Loại phản hồi
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setCategory('bug')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  category === 'bug'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-600 dark:text-rose-300 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Bug className="w-4 h-4 text-rose-500" />
                <span>Báo lỗi</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('feature')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  category === 'feature'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-600 dark:text-amber-300 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Thêm tính năng</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('ux')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  category === 'ux'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Smile className="w-4 h-4 text-indigo-500" />
                <span>Góp ý giao diện</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('other')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  category === 'other'
                    ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-400 text-purple-600 dark:text-purple-300 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-purple-500" />
                <span>Khác</span>
              </button>
            </div>
          </div>

          {/* Name & Sender Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên của bạn (Tùy chọn)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Gia Bảo, Nam..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email của bạn (Để nhận phản hồi)
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="emailcuaban@gmail.com"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tiêu đề phản hồi
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Tóm tắt ngắn gọn góp ý hoặc lỗi gặp phải"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Message content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>Nội dung chi tiết <span className="text-rose-500">*</span></span>
              <span className="text-[11px] text-slate-400 font-normal">
                {message.length} ký tự
              </span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hãy chia sẻ chi tiết vấn đề bạn gặp phải, công cụ đang dùng, hoặc tính năng bạn mong muốn DopiSery hỗ trợ thêm..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y"
            />
          </div>

          {/* Include environment info checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="envInfoCheck"
              checked={includeEnvInfo}
              onChange={(e) => setIncludeEnvInfo(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
            />
            <label htmlFor="envInfoCheck" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              Tự động kèm thông tin trình duyệt & độ phân giải (giúp sửa lỗi nhanh hơn)
            </label>
          </div>

          {/* Success banner if submitted or copied */}
          {submitted && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Đã mở trình duyệt thư! Nếu ứng dụng thư không tự mở, hãy dùng nút <strong>Sao chép nội dung</strong> bên dưới để dán vào Gmail.
              </span>
            </div>
          )}

          {copied && (
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800 text-xs text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                Đã sao chép nội dung vào khay nhớ tạm! Bạn có thể dán vào ứng dụng email để gửi đi.
              </span>
            </div>
          )}
        </form>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyContent}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>Sao chép nội dung</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleSendViaEmail}
              disabled={!message.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition shadow-md shadow-indigo-600/25 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Gửi qua Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
