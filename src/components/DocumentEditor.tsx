import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Table as TableIcon,
  Download,
  Copy,
  Check,
  Undo2,
  Redo2,
  Search,
  Replace,
  Scissors,
  SplitSquareVertical,
  Type,
  Palette,
  FileDown,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { exportHtmlToDocxBlob } from '../services/docxExportService';
import { downloadBlob, getBaseFileName } from '../utils/fileUtils';
import { ConversionPerformanceTiming } from '../services/pdfService';

interface DocumentEditorProps {
  initialHtml: string;
  sourceFileName: string;
  timing?: ConversionPerformanceTiming;
  onBack: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  initialHtml,
  sourceFileName,
  timing,
  onBack,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSearchReplace, setShowSearchReplace] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [fontFamily, setFontFamily] = useState('Plus Jakarta Sans');
  const [fontSize, setFontSize] = useState('14px');
  const [textColor, setTextColor] = useState('#1e293b');

  // Load initial content
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialHtml;
      updateMetrics();
    }
  }, [initialHtml]);

  const updateMetrics = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
    setHasUnsavedChanges(true);
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    updateMetrics();
  };

  const handleHeading = (tag: 'h1' | 'h2' | 'h3' | 'p') => {
    executeCommand('formatBlock', tag);
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #cbd5e1;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left;">Tiêu đề 1</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left;">Tiêu đề 2</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left;">Tiêu đề 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px;">Dữ liệu 1</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px;">Dữ liệu 2</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px;">Dữ liệu 3</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px;">Dữ liệu 4</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px;">Dữ liệu 5</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px;">Dữ liệu 6</td>
          </tr>
        </tbody>
      </table>
      <p></p>
    `;
    executeCommand('insertHTML', tableHtml);
  };

  const handleInsertPageBreak = () => {
    const pageBreakHtml = `
      <div class="page-break" style="margin: 24px 0; border-top: 2px dashed #94a3b8; text-align: center; color: #64748b; font-size: 12px; padding-top: 4px; user-select: none;">
        — Ngắt trang tài liệu —
      </div>
      <p></p>
    `;
    executeCommand('insertHTML', pageBreakHtml);
  };

  const handleFindReplace = (replaceAll = false) => {
    if (!editorRef.current || !searchQuery) return;
    const currentHtml = editorRef.current.innerHTML;
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), replaceAll ? 'gi' : 'i');

    if (regex.test(editorRef.current.innerText)) {
      if (replaceAll) {
        editorRef.current.innerHTML = currentHtml.replace(regex, replaceQuery);
      } else {
        editorRef.current.innerHTML = currentHtml.replace(regex, replaceQuery);
      }
      updateMetrics();
      alert(replaceAll ? 'Đã thay thế tất cả các từ trùng khớp!' : 'Đã thay thế từ đầu tiên tìm thấy!');
    } else {
      alert(`Không tìm thấy từ "${searchQuery}" trong văn bản.`);
    }
  };

  const handleDownloadDocx = async () => {
    if (!editorRef.current) return;
    setIsExporting(true);

    try {
      const html = editorRef.current.innerHTML;
      const baseName = getBaseFileName(sourceFileName) || 'Tai_lieu';
      const outName = `${baseName}_DopiSery.docx`;

      const blob = await exportHtmlToDocxBlob(html, baseName);
      downloadBlob(blob, outName);
      setHasUnsavedChanges(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Lỗi xuất tệp Word (.docx): ' + msg);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const baseName = getBaseFileName(sourceFileName) || 'Tai_lieu';
    downloadBlob(blob, `${baseName}_van_ban.txt`);
  };

  const handleCopyText = async () => {
    if (!editorRef.current) return;
    try {
      await navigator.clipboard.writeText(editorRef.current.innerText || '');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      alert('Không thể sao chép tự động. Vui lòng nhấn Ctrl+A rồi Ctrl+C.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                {sourceFileName}
              </h2>
              {hasUnsavedChanges ? (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
                  Chưa xuất DOCX
                </span>
              ) : (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                  Đã đồng bộ
                </span>
              )}
              {timing && (
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                  ⚡ Chuyển đổi: {(timing.totalMs / 1000).toFixed(2)}s ({timing.nativePagesRun} trang số • {timing.ocrPagesRun} trang scan)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Trình soạn thảo trực tiếp DopiSery • {wordCount} từ • {charCount} ký tự
            </p>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition"
            title="Sao chép toàn bộ văn bản"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{isCopied ? 'Đã sao chép' : 'Sao chép'}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition"
            title="Tải văn bản thô (.txt)"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Tải TXT</span>
          </button>

          <button
            onClick={handleDownloadDocx}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Đang tạo DOCX...' : 'Tải xuống Word (.docx)'}
          </button>
        </div>
      </div>

      {/* Ribbon Toolbar */}
      <div className="bg-slate-100 dark:bg-slate-900 border-x border-b border-slate-200 dark:border-slate-800 rounded-b-xl p-2 flex flex-wrap items-center gap-1 sm:gap-1.5 text-slate-700 dark:text-slate-200 text-xs shadow-sm overflow-x-auto">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 border-r border-slate-300 dark:border-slate-700 pr-1.5">
          <button
            onClick={() => executeCommand('undo')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => executeCommand('redo')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
            title="Làm lại (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-0.5 border-r border-slate-300 dark:border-slate-700 pr-1.5">
          <button
            onClick={() => handleHeading('h1')}
            className="px-2 py-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg font-bold transition"
            title="Tiêu đề 1"
          >
            H1
          </button>
          <button
            onClick={() => handleHeading('h2')}
            className="px-2 py-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg font-semibold transition"
            title="Tiêu đề 2"
          >
            H2
          </button>
          <button
            onClick={() => handleHeading('h3')}
            className="px-2 py-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg font-medium transition"
            title="Tiêu đề 3"
          >
            H3
          </button>
          <button
            onClick={() => handleHeading('p')}
            className="px-2 py-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
            title="Đoạn văn bình thường"
          >
            Văn bản
          </button>
        </div>

        {/* Text styling */}
        <div className="flex items-center gap-0.5 border-r border-slate-300 dark:border-slate-700 pr-1.5">
          <button
            onClick={() => executeCommand('bold')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg font-bold transition"
            title="In đậm (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => executeCommand('italic')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg italic transition"
            title="In nghiêng (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => executeCommand('underline')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg underline transition"
            title="Gạch chân (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => executeCommand('strikeThrough')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
            title="Gạch giữa chữ"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-r border-slate-300 dark:border-slate-700 pr-1.5">
          <button
            onClick={() => executeCommand('justifyLeft')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
            title="Căn lề trái"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => executeCommand('justifyCenter')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
            title="Căn giữa"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => executeCommand('justifyRight')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
            title="Căn lề phải"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => executeCommand('justifyFull')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
            title="Căn đều hai bên"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 border-r border-slate-300 dark:border-slate-700 pr-1.5">
          <button
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
            title="Danh sách dấu đầu dòng"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
            title="Danh sách đánh số"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Insert Table & Page break */}
        <div className="flex items-center gap-0.5 border-r border-slate-300 dark:border-slate-700 pr-1.5">
          <button
            onClick={handleInsertTable}
            className="flex items-center gap-1 px-2 py-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
            title="Chèn bảng biểu"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Bảng</span>
          </button>
          <button
            onClick={handleInsertPageBreak}
            className="flex items-center gap-1 px-2 py-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
            title="Chèn ngắt trang"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ngắt trang</span>
          </button>
        </div>

        {/* Find & Replace toggle */}
        <button
          onClick={() => setShowSearchReplace(!showSearchReplace)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
            showSearchReplace ? 'bg-indigo-600 text-white' : 'hover:bg-white dark:hover:bg-slate-800'
          }`}
          title="Tìm kiếm & Thay thế"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tìm kiếm</span>
        </button>
      </div>

      {/* Search & Replace Floating Bar */}
      {showSearchReplace && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 my-2 shadow-lg flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 flex-1 min-w-[140px]">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Từ khóa cần tìm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 flex-1 min-w-[140px]">
            <Replace className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Thay thế bằng..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={() => handleFindReplace(false)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition"
          >
            Thay thế
          </button>
          <button
            onClick={() => handleFindReplace(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
          >
            Thay tất cả
          </button>
        </div>
      )}

      {/* Editor Main Canvas (Word Paper Simulation) */}
      <div className="flex-1 overflow-y-auto bg-slate-200/60 dark:bg-slate-950/80 p-2 sm:p-6 flex justify-center mt-2 rounded-xl">
        <div
          ref={editorRef}
          contentEditable
          onInput={updateMetrics}
          spellCheck={false}
          className="w-full max-w-4xl min-h-[700px] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-8 sm:p-14 shadow-xl rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/30 font-sans leading-relaxed text-sm sm:text-base border border-slate-200/80 dark:border-slate-800 transition-shadow"
          style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        />
      </div>
    </div>
  );
};
