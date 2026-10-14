import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  RefreshCw,
  Search,
} from 'lucide-react';
import { FileUploadZone } from '../components/FileUploadZone';
import { extractRawTextFromPdf } from '../services/pdfService';
import { downloadBlob, getBaseFileName } from '../utils/fileUtils';

export const ExtractTextTool: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setExtractedText(null);
    setErrorMessage(null);
    setIsExtracting(true);
    setProgress(0);

    try {
      const text = await extractRawTextFromPdf(file, (p) => setProgress(p));
      setExtractedText(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Lỗi trích xuất: ${msg}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopy = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      alert('Không thể tự động sao chép. Hãy chọn toàn bộ văn bản và ấn Ctrl+C.');
    }
  };

  const handleDownloadTxt = () => {
    if (!extractedText || !selectedFile) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const baseName = getBaseFileName(selectedFile.name);
    downloadBlob(blob, `${baseName}_TrichXuat.txt`);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setExtractedText(null);
    setProgress(0);
    setErrorMessage(null);
  };

  // Word & character stats
  const words = extractedText ? extractedText.trim().split(/\s+/).length : 0;
  const chars = extractedText ? extractedText.length : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
          <FileText className="w-3.5 h-3.5" />
          Trích xuất & Đọc văn bản thuần
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Trích Xuất Văn Bản Từ PDF
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Lấy toàn bộ nội dung chữ từ file PDF nhanh chóng, sao chép vào bộ nhớ đệm hoặc tải về dưới dạng tệp văn bản .TXT.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        {!selectedFile ? (
          <FileUploadZone
            accept=".pdf,application/pdf"
            multiple={false}
            title="Kéo & thả tệp PDF cần trích xuất chữ vào đây"
            subtitle="Hoặc chọn tệp từ máy tính / điện thoại"
            icon="pdf"
            onFilesSelected={handleFileSelected}
            errorMessage={errorMessage}
          />
        ) : isExtracting ? (
          <div className="py-16 text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                Đang đọc và trích xuất chữ từ PDF ({progress}%)...
              </p>
              <p className="text-xs text-slate-400">100% xử lý trong RAM máy tính</p>
            </div>
          </div>
        ) : (
          /* Extracted Text Viewer */
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-slate-400">
                  {words} từ • {chars} ký tự
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Đã sao chép' : 'Sao chép tất cả'}</span>
                </button>

                <button
                  onClick={handleDownloadTxt}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải tệp .TXT</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-500 transition"
                >
                  Đổi tệp
                </button>
              </div>
            </div>

            {/* Quick in-text search */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh trong văn bản trích xuất..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Textarea */}
            <textarea
              readOnly
              value={extractedText || ''}
              className="w-full h-80 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed outline-none resize-y"
            />
          </div>
        )}
      </div>
    </div>
  );
};
