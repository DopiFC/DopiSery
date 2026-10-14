import React, { useState } from 'react';
import {
  Binary,
  Download,
  CheckCircle2,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { FileUploadZone } from '../components/FileUploadZone';
import { addPageNumbersToPdf, inspectPdfFile, PageNumberOptions, PdfDocumentInfo } from '../services/pdfService';
import { downloadUint8Array, getBaseFileName, formatBytes } from '../utils/fileUtils';

export const PageNumberPdfTool: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docInfo, setDocInfo] = useState<PdfDocumentInfo | null>(null);
  const [position, setPosition] = useState<PageNumberOptions['position']>('bottom-center');
  const [format, setFormat] = useState<PageNumberOptions['format']>('page-n-of-total');
  const [startFrom, setStartFrom] = useState(1);
  const [fontSize, setFontSize] = useState(11);
  const [isProcessing, setIsProcessing] = useState(false);
  const [numberedBytes, setNumberedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setNumberedBytes(null);
    setErrorMessage(null);

    try {
      const info = await inspectPdfFile(file);
      setDocInfo(info);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    }
  };

  const handleApplyNumbers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await addPageNumbersToPdf(selectedFile, {
        position,
        format,
        startFrom,
        fontSize,
        margin: 30,
      });

      setNumberedBytes(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!numberedBytes || !selectedFile) return;
    const baseName = getBaseFileName(selectedFile.name);
    downloadUint8Array(numberedBytes, `${baseName}_SoTrang.pdf`);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setDocInfo(null);
    setNumberedBytes(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
          <Binary className="w-3.5 h-3.5" />
          Định dạng & Bố cục văn bản
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Đánh Số Trang Cho Tệp PDF
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Tự động chèn số thứ tự trang, chọn vị trí lề trên/dưới và định dạng hiển thị chuyên nghiệp cho báo cáo, hợp đồng.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        {!selectedFile ? (
          <FileUploadZone
            accept=".pdf,application/pdf"
            multiple={false}
            title="Kéo & thả tệp PDF cần đánh số trang vào đây"
            subtitle="Hoặc chọn tệp từ máy tính / điện thoại"
            icon="pdf"
            onFilesSelected={handleFileSelected}
            errorMessage={errorMessage}
          />
        ) : numberedBytes ? (
          /* Success Screen */
          <div className="text-center space-y-6 py-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Đã đánh số trang thành công!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Toàn bộ các trang tài liệu đã được đánh số theo định dạng bạn yêu cầu.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Tải Tệp PDF Đã Đánh Số
              </button>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition"
              >
                Đánh số tệp khác
              </button>
            </div>
          </div>
        ) : (
          /* Numbering Settings Form */
          <form onSubmit={handleApplyNumbers} className="space-y-6">
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
                    {formatBytes(selectedFile.size)} • {docInfo ? `${docInfo.numPages} trang` : 'Đang đọc...'}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Position */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Vị trí đặt số trang
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as PageNumberOptions['position'])}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="bottom-center">Dưới cùng - Chính giữa (Chuẩn)</option>
                  <option value="bottom-right">Dưới cùng - Bên phải</option>
                  <option value="top-right">Trên cùng - Bên phải</option>
                  <option value="top-center">Trên cùng - Chính giữa</option>
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Định dạng hiển thị
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as PageNumberOptions['format'])}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="page-n-of-total">Trang 1 / 10</option>
                  <option value="n-of-total">1 / 10</option>
                  <option value="page-n">Trang 1</option>
                  <option value="n">Chỉ số 1</option>
                </select>
              </div>

              {/* Start Page */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Bắt đầu đánh số từ
                </label>
                <input
                  type="number"
                  min="1"
                  value={startFrom}
                  onChange={(e) => setStartFrom(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Font size */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Cỡ chữ số trang
                </label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="9">Nhỏ (9pt)</option>
                  <option value="11">Chuẩn (11pt)</option>
                  <option value="13">Lớn (13pt)</option>
                </select>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errorMessage}
              </p>
            )}

            {isProcessing && (
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang thêm số trang vào PDF...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Binary className="w-5 h-5" />
              <span>Thực Hiện Đánh Số Trang</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
