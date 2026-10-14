import React, { useState } from 'react';
import {
  Scissors,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  FileCheck,
} from 'lucide-react';
import { FileUploadZone } from '../components/FileUploadZone';
import { splitPdfFile, inspectPdfFile, parsePageRanges, PdfDocumentInfo } from '../services/pdfService';
import { downloadUint8Array, getBaseFileName, formatBytes } from '../utils/fileUtils';

export const SplitPdfTool: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docInfo, setDocInfo] = useState<PdfDocumentInfo | null>(null);
  const [rangeInput, setRangeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitBytes, setSplitBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setSplitBytes(null);
    setErrorMessage(null);

    try {
      const info = await inspectPdfFile(file);
      setDocInfo(info);
      setRangeInput(`1-${Math.min(info.numPages, 3)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    }
  };

  const parsedIndices = docInfo ? parsePageRanges(rangeInput, docInfo.numPages) : [];

  const handleSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !docInfo) return;

    if (parsedIndices.length === 0) {
      setErrorMessage('Khoảng trang không hợp lệ. Vui lòng nhập ví dụ: 1-3, 5, 8-10');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const splitPdf = await splitPdfFile(selectedFile, rangeInput);
      setSplitBytes(splitPdf);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!splitBytes || !selectedFile) return;
    const baseName = getBaseFileName(selectedFile.name);
    downloadUint8Array(splitBytes, `${baseName}_TachTrang.pdf`);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setDocInfo(null);
    setRangeInput('');
    setSplitBytes(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
          <Scissors className="w-3.5 h-3.5" />
          Tiện ích tách trang PDF
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Tách Trang PDF Theo Yêu Cầu
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Trích xuất các trang cụ thể hoặc chia nhỏ tài liệu theo các khoảng trang bạn cần trong vài giây.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        {!selectedFile ? (
          <FileUploadZone
            accept=".pdf,application/pdf"
            multiple={false}
            title="Kéo & thả tệp PDF cần tách trang vào đây"
            subtitle="Hoặc chọn tệp từ máy tính / điện thoại"
            icon="pdf"
            onFilesSelected={handleFileSelected}
            errorMessage={errorMessage}
          />
        ) : splitBytes ? (
          /* Success Screen */
          <div className="text-center space-y-6 py-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Đã tách thành công {parsedIndices.length} trang!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Các trang trích xuất ({rangeInput}) đã được tạo thành tệp PDF mới.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Tải Tệp PDF Đã Tách
              </button>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition"
              >
                Tách tệp khác
              </button>
            </div>
          </div>
        ) : (
          /* Configuration Form */
          <form onSubmit={handleSplit} className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {formatBytes(selectedFile.size)} • {docInfo ? `Tổng số: ${docInfo.numPages} trang` : 'Đang đọc...'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Đổi tệp
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                Nhập các trang hoặc khoảng trang cần trích xuất
              </label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder="Ví dụ: 1-3, 5, 8-10"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                Nhập số trang phân tách bởi dấu phẩy, hoặc dấu gạch nối cho khoảng liên tiếp (Ví dụ: <strong>1-3, 5, 7</strong>)
              </p>
            </div>

            {/* Quick Presets */}
            {docInfo && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-slate-400">Gợi ý nhanh:</span>
                <button
                  type="button"
                  onClick={() => setRangeInput(`1-${Math.min(docInfo.numPages, 5)}`)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs text-slate-700 dark:text-slate-300 font-medium transition"
                >
                  5 trang đầu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const odds = Array.from({ length: docInfo.numPages }, (_, i) => i + 1).filter((p) => p % 2 !== 0).join(', ');
                    setRangeInput(odds);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs text-slate-700 dark:text-slate-300 font-medium transition"
                >
                  Trang lẻ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const evens = Array.from({ length: docInfo.numPages }, (_, i) => i + 1).filter((p) => p % 2 === 0).join(', ');
                    setRangeInput(evens);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs text-slate-700 dark:text-slate-300 font-medium transition"
                >
                  Trang chẵn
                </button>
              </div>
            )}

            {/* Preview of pages to be extracted */}
            {docInfo && parsedIndices.length > 0 && (
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                <span>Số trang sẽ được trích xuất: <strong>{parsedIndices.length} trang</strong></span>
                <span className="text-slate-500 text-[11px]">Trang: {parsedIndices.map((i) => i + 1).join(', ')}</span>
              </div>
            )}

            {errorMessage && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errorMessage}
              </p>
            )}

            {isProcessing && (
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang xử lý trích xuất trang PDF...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || parsedIndices.length === 0}
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Scissors className="w-5 h-5" />
              <span>Tách Và Tải {parsedIndices.length} Trang Này</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
