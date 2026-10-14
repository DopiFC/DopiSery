import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Sparkles,
  Download,
  Trash2,
  Clock,
  Type,
  AlignLeft,
} from 'lucide-react';
import { downloadBlob } from '../utils/fileUtils';

export const TextToolsTool: React.FC = () => {
  const [text, setText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Statistics
  const charCountWithSpaces = text.length;
  const charCountNoSpaces = text.replace(/\s+/g, '').length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split('\n').length : 0;
  const paragraphCount = text ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  const readingTimeMin = Math.ceil(wordCount / 200);

  // Transformation actions
  const cleanWhitespace = () => {
    const cleaned = text
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
    setText(cleaned);
  };

  const removeEmptyLines = () => {
    const cleaned = text
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .join('\n');
    setText(cleaned);
  };

  const toUpperCase = () => setText(text.toUpperCase());
  const toLowerCase = () => setText(text.toLowerCase());
  
  const toTitleCase = () => {
    const formatted = text.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
    setText(formatted);
  };

  const toSentenceCase = () => {
    const formatted = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    setText(formatted);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      alert('Không thể tự động sao chép. Vui lòng nhấn Ctrl+C.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'DopiSery_VanBan.txt');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
          <Type className="w-3.5 h-3.5" />
          Tiện ích xử lý văn bản văn phòng
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Bộ Đếm & Định Dạng Văn Bản
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Đếm từ, ký tự, dòng văn bản theo thời gian thực và chuẩn hóa khoảng trắng thừa, viết hoa chữ cái nhanh chóng.
        </p>
      </div>

      {/* Realtime Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Số từ</span>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{wordCount}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Ký tự (kèm space)</span>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{charCountWithSpaces}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Ký tự (không space)</span>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{charCountNoSpaces}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Số dòng</span>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{lineCount}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Số đoạn</span>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{paragraphCount}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Thời gian đọc</span>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">~{readingTimeMin}p</p>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4">
        {/* Quick action toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={cleanWhitespace}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition"
          >
            Chuẩn hóa khoảng trắng
          </button>
          <button
            onClick={removeEmptyLines}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition"
          >
            Xóa dòng trống
          </button>
          <button
            onClick={toUpperCase}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition"
          >
            IN HOA
          </button>
          <button
            onClick={toLowerCase}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition"
          >
            in thường
          </button>
          <button
            onClick={toTitleCase}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition"
          >
            Hoa Đầu Từ
          </button>
          <button
            onClick={toSentenceCase}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition"
          >
            Hoa đầu câu
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Đã chép' : 'Sao chép'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải .TXT</span>
            </button>
            <button
              onClick={() => setText('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
              title="Xóa trắng nội dung"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Text input area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Dán hoặc nhập nội dung văn bản của bạn vào đây để đếm từ và chuẩn hóa định dạng..."
          rows={14}
          className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500/30 resize-y"
        />
      </div>
    </div>
  );
};
