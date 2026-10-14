import React, { useState, useRef } from 'react';
import {
  FileText,
  Sparkles,
  Languages,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Zap,
  LayoutTemplate,
  XCircle,
  FileCheck,
  Clock,
} from 'lucide-react';
import { FileUploadZone } from '../components/FileUploadZone';
import { DocumentEditor } from '../components/DocumentEditor';
import { PdfConversionProgress } from '../components/PdfConversionProgress';
import {
  inspectPdfFile,
  convertPdfToEditableHtml,
  PageProcessingProgress,
  PdfDocumentInfo,
  ConversionPerformanceTiming,
  ConversionMode,
} from '../services/pdfService';
import { OcrLanguage } from '../services/ocrService';
import { formatBytes } from '../utils/fileUtils';

export const PdfToWordTool: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docInfo, setDocInfo] = useState<PdfDocumentInfo | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionMode, setConversionMode] = useState<ConversionMode>('fast');
  const [ocrLanguage, setOcrLanguage] = useState<OcrLanguage>('vie+eng');
  const [forceOcr, setForceOcr] = useState(false);
  const [progress, setProgress] = useState<PageProcessingProgress | null>(null);
  const [convertedHtml, setConvertedHtml] = useState<string | null>(null);
  const [timing, setTiming] = useState<ConversionPerformanceTiming | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setErrorMessage(null);
    setConvertedHtml(null);
    setTiming(null);
    setIsInspecting(true);

    try {
      const info = await inspectPdfFile(file);
      if (info.isEncrypted) {
        setErrorMessage('Tệp PDF này đã được đặt mật khẩu bảo vệ. Vui lòng mở khóa mật khẩu trước khi chuyển đổi.');
        setDocInfo(null);
      } else {
        setDocInfo(info);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setDocInfo(null);
    } finally {
      setIsInspecting(false);
    }
  };

  const handleStartConversion = async () => {
    if (!selectedFile) return;
    setIsConverting(true);
    setErrorMessage(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await convertPdfToEditableHtml(selectedFile, {
        mode: conversionMode,
        ocrLanguage,
        forceOcr,
        signal: controller.signal,
        onProgress: (p) => setProgress(p),
      });

      setConvertedHtml(result.html);
      setTiming(result.timing);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (controller.signal.aborted || msg.includes('hủy')) {
        setErrorMessage('Bạn đã hủy tác vụ chuyển đổi.');
      } else {
        setErrorMessage(`Lỗi chuyển đổi: ${msg}`);
      }
    } finally {
      setIsConverting(false);
      setProgress(null);
      abortControllerRef.current = null;
    }
  };

  const handleCancelConversion = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsConverting(false);
    setProgress(null);
  };

  const handleReset = () => {
    handleCancelConversion();
    setSelectedFile(null);
    setDocInfo(null);
    setConvertedHtml(null);
    setTiming(null);
    setProgress(null);
    setErrorMessage(null);
  };

  // If conversion finished, show the full Document Editor screen!
  if (convertedHtml && selectedFile) {
    return (
      <DocumentEditor
        initialHtml={convertedHtml}
        sourceFileName={selectedFile.name}
        timing={timing || undefined}
        onBack={() => setConvertedHtml(null)}
      />
    );
  }

  // Scanned pages detection
  const scannedPagesCount = docInfo
    ? docInfo.pagesInfo.filter((p) => !p.hasText).length
    : 0;
  const nativePagesCount = docInfo ? docInfo.numPages - scannedPagesCount : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
          <Zap className="w-3.5 h-3.5" />
          Hiệu Năng Cao • Trích Xuất Siêu Tốc 100% Client-Side
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Chuyển Đổi PDF sang Word (.docx)
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Tối ưu hóa tốc độ: Ưu tiên trích xuất trực tiếp văn bản thật trong vài tích tắc và chỉ chạy OCR quang học cho những trang scan cần thiết.
        </p>
      </div>

      {/* Main Upload or Configure Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        {!selectedFile ? (
          <FileUploadZone
            accept=".pdf,application/pdf"
            multiple={false}
            title="Kéo & thả tệp PDF cần chuyển đổi sang Word"
            subtitle="Hoặc bấm để duyệt tệp từ thiết bị • Tối đa 100MB"
            icon="pdf"
            onFilesSelected={handleFileSelected}
            errorMessage={errorMessage}
          />
        ) : (
          <div className="space-y-6">
            {/* File Info Bar */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatBytes(selectedFile.size)} • {docInfo ? `${docInfo.numPages} trang` : 'Đang phân tích...'}
                  </p>
                </div>
              </div>

              {!isConverting && (
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 transition"
                >
                  Chọn tệp khác
                </button>
              )}
            </div>

            {/* Analysis Result Banner */}
            {docInfo && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-indigo-500" />
                  Đánh giá phân loại trang tự động:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Trang văn bản thật:</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                        {nativePagesCount} / {docInfo.numPages} trang
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Trích xuất tức thì
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Trang scan / hình ảnh:</p>
                      <p className={`font-bold text-sm mt-0.5 ${scannedPagesCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {scannedPagesCount} / {docInfo.numPages} trang
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {scannedPagesCount > 0 ? 'Cần OCR' : 'Không cần OCR'}
                    </span>
                  </div>
                </div>

                {scannedPagesCount > 0 ? (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>
                      Chỉ {scannedPagesCount} trang scan sẽ được nhận dạng qua OCR (tái sử dụng worker). Các trang còn lại sẽ được trích xuất trực tiếp siêu nhanh.
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>
                      Tài liệu 100% là văn bản số. Toàn bộ tài liệu sẽ được chuyển đổi ngay lập tức mà không cần tốn thời gian chạy OCR!
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Mode Selection */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <LayoutTemplate className="w-4 h-4 text-indigo-500" />
                Chế độ chuyển đổi
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => !isConverting && setConversionMode('fast')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    conversionMode === 'fast'
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Chế độ 1 – Chuyển nhanh
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Mặc định
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Tối ưu tốc độ cao nhất. Trích xuất trực tiếp văn bản thật, chỉ OCR trang scan thực sự. Xử lý trong vài giây.
                  </p>
                </div>

                <div
                  onClick={() => !isConverting && setConversionMode('layout')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    conversionMode === 'layout'
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <LayoutTemplate className="w-4 h-4 text-sky-500" />
                      Chế độ 2 – Ưu tiên bố cục
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Phân tích sâu hơn về căn chỉnh cột, bảng biểu và danh sách khi tài liệu có định dạng phức tạp.
                  </p>
                </div>
              </div>
            </div>

            {/* OCR Options */}
            <div className="space-y-4 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-indigo-500" />
                    Ngôn ngữ nhận dạng OCR
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Chỉ kích hoạt khi phát hiện trang scan hoặc ảnh chụp
                  </p>
                </div>
                <select
                  value={ocrLanguage}
                  onChange={(e) => setOcrLanguage(e.target.value as OcrLanguage)}
                  disabled={isConverting}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                >
                  <option value="vie+eng">Tiếng Việt + Tiếng Anh (Mặc định)</option>
                  <option value="vie">Chỉ Tiếng Việt</option>
                  <option value="eng">Chỉ Tiếng Anh</option>
                </select>
              </div>

              {/* Force OCR checkbox */}
              <label className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={forceOcr}
                  onChange={(e) => setForceOcr(e.target.checked)}
                  disabled={isConverting}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span>Bắt buộc chạy OCR cho toàn bộ trang (chỉ dùng nếu PDF bị lỗi font mã hóa không đọc được)</span>
              </label>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Multi-Stage Progress Bar during conversion (Loading, Extracting, OCR, DOCX Export) */}
            {isConverting && progress && (
              <PdfConversionProgress
                progress={progress}
                conversionMode={conversionMode}
                forceOcr={forceOcr}
                hasScannedPages={scannedPagesCount > 0}
                fileName={selectedFile?.name}
                onCancel={handleCancelConversion}
              />
            )}

            {/* Convert Action Button */}
            {!isConverting && (
              <button
                onClick={handleStartConversion}
                disabled={isInspecting || !docInfo}
                className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Chuyển Đổi Sang Word & Mở Trình Soạn Thảo</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Feature Guarantee Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
            <Zap className="w-4 h-4 text-amber-500" />
            Tốc độ siêu tốc
          </div>
          <p>
            Văn bản có sẵn được đọc trực tiếp qua PDF.js (dưới 15ms/trang), loại bỏ hoàn toàn render hình ảnh nặng nề khi không cần thiết.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Văn bản chỉnh sửa được
          </div>
          <p>
            Chỉnh sửa trực tiếp trên trình soạn thảo Word của DopiSery và xuất ra tệp .docx chuẩn tương thích với Microsoft Word.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
            <ShieldCheck className="w-4 h-4 text-sky-500" />
            100% Riêng tư trên thiết bị
          </div>
          <p>
            Toàn bộ quá trình diễn ra trong bộ nhớ RAM trình duyệt. Không tải tệp lên máy chủ hay lưu trữ dữ liệu nhạy cảm.
          </p>
        </div>
      </div>
    </div>
  );
};
