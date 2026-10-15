import React, { useState, useEffect, useRef } from 'react';
import {
  Stamp,
  Download,
  CheckCircle2,
  RefreshCw,
  FileText,
  Palette,
  Eye,
  Sliders,
  AlertTriangle,
  RotateCw,
  Layers,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { FileUploadZone } from '../components/FileUploadZone';
import {
  addWatermarkToPdf,
  inspectPdfFile,
  renderPageToCanvas,
  PdfDocumentInfo,
} from '../services/pdfService';
import { downloadUint8Array, getBaseFileName, formatBytes } from '../utils/fileUtils';
import { getAssetUrl } from '../utils/assetUtils';

export const WatermarkPdfTool: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docInfo, setDocInfo] = useState<PdfDocumentInfo | null>(null);
  const [watermarkText, setWatermarkText] = useState('BẢN QUYỀN - KHÔNG SAO CHÉP');
  const [opacity, setOpacity] = useState(0.25);
  const [fontSize, setFontSize] = useState(36);
  const [angle, setAngle] = useState(45);
  const [colorHex, setColorHex] = useState('#ef4444');
  const [applyToAllPages, setApplyToAllPages] = useState(true);
  const [pageRangeText, setPageRangeText] = useState('');
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkedBytes, setWatermarkedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Render real first page of PDF when file changes
  useEffect(() => {
    let isCancelled = false;

    async function loadPreview(file: File) {
      setIsPreviewLoading(true);
      try {
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({
          data: new Uint8Array(buf),
          cMapUrl: getAssetUrl('cmaps/'),
          cMapPacked: true,
          standardFontDataUrl: getAssetUrl('standard_fonts/'),
        }).promise;

        if (isCancelled) return;
        const canvas = await renderPageToCanvas(pdf, 1, 0.4);
        if (isCancelled) return;

        const dataUrl = canvas.toDataURL('image/png');
        setPreviewThumbnail(dataUrl);

        // Clean up
        canvas.width = 0;
        canvas.height = 0;
      } catch (err) {
        // If preview fails (e.g. encrypted), we fallback to clean mockup
        console.warn('Could not render live PDF preview thumbnail:', err);
        setPreviewThumbnail(null);
      } finally {
        if (!isCancelled) {
          setIsPreviewLoading(false);
        }
      }
    }

    if (selectedFile) {
      loadPreview(selectedFile);
    } else {
      setPreviewThumbnail(null);
    }

    return () => {
      isCancelled = true;
    };
  }, [selectedFile]);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setWatermarkedBytes(null);
    setErrorMessage(null);

    try {
      const info = await inspectPdfFile(file);
      if (info.isEncrypted) {
        setErrorMessage('Tệp PDF này đã được đặt mật khẩu bảo vệ. Vui lòng mở khóa mật khẩu trước khi thêm dấu bản quyền.');
        setDocInfo(null);
      } else {
        setDocInfo(info);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setDocInfo(null);
    }
  };

  const parseSelectedPages = (rangeStr: string, total: number): number[] => {
    if (!rangeStr.trim()) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set<number>();
    const parts = rangeStr.split(',');

    for (const part of parts) {
      const p = part.trim();
      if (!p) continue;
      if (p.includes('-')) {
        const [startStr, endStr] = p.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(total, end); i++) {
            pages.add(i);
          }
        }
      } else {
        const pageNum = parseInt(p, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= total) {
          pages.add(pageNum);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleApplyWatermark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (!watermarkText.trim()) {
      setErrorMessage('Vui lòng nhập nội dung dấu bản quyền.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let selectedPages: number[] | undefined = undefined;
      if (!applyToAllPages && docInfo) {
        selectedPages = parseSelectedPages(pageRangeText, docInfo.numPages);
        if (selectedPages.length === 0) {
          throw new Error('Không có trang hợp lệ nào được chọn để đóng dấu.');
        }
      }

      const result = await addWatermarkToPdf(selectedFile, {
        text: watermarkText.trim(),
        opacity,
        fontSize,
        colorHex,
        angle,
        allPages: applyToAllPages,
        selectedPages,
      });

      setWatermarkedBytes(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Lỗi đóng dấu bản quyền: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!watermarkedBytes || !selectedFile) return;
    const baseName = getBaseFileName(selectedFile.name);
    downloadUint8Array(watermarkedBytes, `${baseName}_Watermarked.pdf`);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setDocInfo(null);
    setWatermarkedBytes(null);
    setErrorMessage(null);
    setPreviewThumbnail(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-800">
          <Stamp className="w-3.5 h-3.5" />
          Dấu Nhận Diện Thương Hiệu & Bản Quyền PDF
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Đóng Dấu Bản Quyền PDF (Watermark)
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Chèn dấu chữ mờ bảo mật, "BẢO MẬT", "BẢN QUYỀN", logo thương hiệu chéo hoặc ngang lên từng trang PDF. Hỗ trợ 100% tiếng Việt có dấu.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        {!selectedFile ? (
          <FileUploadZone
            accept=".pdf,application/pdf"
            multiple={false}
            title="Kéo & thả tệp PDF cần đóng dấu vào đây"
            subtitle="Hoặc chọn tệp từ máy tính / điện thoại (xử lý an toàn trên RAM thiết bị)"
            icon="pdf"
            onFilesSelected={handleFileSelected}
            errorMessage={errorMessage}
          />
        ) : watermarkedBytes ? (
          /* Success Screen */
          <div className="text-center space-y-6 py-6 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Đã đóng dấu bản quyền thành công!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Dấu mờ <span className="font-semibold text-slate-800 dark:text-slate-200">"{watermarkText}"</span> đã được áp dụng vào tài liệu PDF của bạn với chuẩn đồ họa vector sắc nét.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Tải Tệp PDF Đã Đóng Dấu
              </button>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition cursor-pointer"
              >
                Đóng dấu tệp khác
              </button>
            </div>
          </div>
        ) : (
          /* Watermark Settings Form */
          <form onSubmit={handleApplyWatermark} className="space-y-6">
            {/* Selected File Details */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {formatBytes(selectedFile.size)} • {docInfo ? `${docInfo.numPages} trang` : 'Đang phân tích...'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer font-medium"
              >
                Đổi tệp
              </button>
            </div>

            {/* Layout: Settings on Left, Live Real Preview on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Text input */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Nội dung con dấu (Watermark Text)
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Ví dụ: BẢN QUYỀN - KHÔNG SAO CHÉP..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500/30 outline-none"
                  />
                </div>

                {/* Text Presets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Gợi ý mẫu con dấu phổ biến:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'BẢN QUYỀN - KHÔNG SAO CHÉP',
                      'BẢO MẬT',
                      'CHỈ LƯU HÀNH NỘI BỘ',
                      'BẢN NHÁP (DRAFT)',
                      'ĐÃ PHÊ DUYỆT',
                      'HỢP ĐỒNG MẪU',
                    ].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => setWatermarkText(sample)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                          watermarkText === sample
                            ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Angle selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Góc xoay dấu
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 45, label: 'Nghiêng 45° (Chéo)' },
                      { val: 0, label: 'Ngang 0° (Chính diện)' },
                      { val: -45, label: 'Nghiêng -45°' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setAngle(item.val)}
                        className={`py-2 px-1 text-xs font-medium rounded-xl border transition text-center cursor-pointer ${
                          angle === item.val
                            ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders: Opacity & Font Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Độ trong suốt (Opacity)</span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">{Math.round(opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.8"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Mờ nhạt (5%)</span>
                      <span>Rõ nét (80%)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Cỡ chữ (Font size)</span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">{fontSize} pt</span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="72"
                      step="2"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Nhỏ (18pt)</span>
                      <span>Cực lớn (72pt)</span>
                    </div>
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Màu sắc con dấu
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent shrink-0"
                    />
                    <div className="flex flex-wrap gap-2">
                      {[
                        { color: '#ef4444', label: 'Đỏ bảo mật' },
                        { color: '#94a3b8', label: 'Xám mờ' },
                        { color: '#3b82f6', label: 'Xanh doanh nghiệp' },
                        { color: '#10b981', label: 'Xanh lục' },
                        { color: '#f59e0b', label: 'Cam cảnh báo' },
                        { color: '#0f172a', label: 'Đen' },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => setColorHex(c.color)}
                          className={`w-7 h-7 rounded-lg border cursor-pointer transition ${
                            colorHex.toLowerCase() === c.color.toLowerCase()
                              ? 'ring-2 ring-offset-2 ring-rose-500 scale-110 border-white'
                              : 'border-slate-300 dark:border-slate-700 opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Page Selection Option */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-rose-500" />
                      Phạm vi áp dụng
                    </span>
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyToAllPages}
                        onChange={(e) => setApplyToAllPages(e.target.checked)}
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span>Tất cả các trang ({docInfo?.numPages || 1})</span>
                    </label>
                  </div>

                  {!applyToAllPages && (
                    <div className="pt-1 space-y-1">
                      <input
                        type="text"
                        value={pageRangeText}
                        onChange={(e) => setPageRangeText(e.target.value)}
                        placeholder="Ví dụ: 1-3, 5, 7"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none"
                      />
                      <p className="text-[10px] text-slate-400">
                        Nhập các số trang hoặc dải trang cách nhau bởi dấu phẩy (Tổng số {docInfo?.numPages} trang).
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Real Live Visual Preview (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col items-center justify-center space-y-3">
                  <div className="flex items-center justify-between w-full text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-rose-500" />
                      Xem trước trực tiếp (Trang 1)
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Cập nhật thời gian thực
                    </span>
                  </div>

                  {/* Document preview container */}
                  <div className="w-56 h-80 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-md relative overflow-hidden flex items-center justify-center select-none">
                    {/* Rendered thumbnail of actual PDF page */}
                    {previewThumbnail ? (
                      <img
                        src={previewThumbnail}
                        alt="PDF Trang 1 Preview"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    ) : (
                      /* Mock page layout */
                      <div className="space-y-2 p-4 w-full opacity-20 text-[6px] text-slate-400 leading-tight">
                        <div className="h-2 w-3/4 bg-slate-400 rounded"></div>
                        <div className="h-1.5 w-full bg-slate-400 rounded"></div>
                        <div className="h-1.5 w-full bg-slate-400 rounded"></div>
                        <div className="h-1.5 w-5/6 bg-slate-400 rounded"></div>
                        <div className="h-1.5 w-full bg-slate-400 rounded"></div>
                        <div className="h-1.5 w-2/3 bg-slate-400 rounded"></div>
                        <div className="h-1.5 w-full bg-slate-400 rounded"></div>
                        <div className="h-1.5 w-4/5 bg-slate-400 rounded"></div>
                      </div>
                    )}

                    {/* Overlaid simulated live watermark */}
                    <div
                      className="absolute font-extrabold text-center pointer-events-none tracking-wider transition-all duration-100 px-2"
                      style={{
                        color: colorHex,
                        opacity: opacity,
                        fontSize: `${Math.round(fontSize * 0.38)}px`,
                        transform: `rotate(${angle}deg)`,
                        textShadow: '0 0 1px rgba(0,0,0,0.1)',
                        maxWidth: '260px',
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                      }}
                    >
                      {watermarkText || 'WATERMARK'}
                    </div>

                    {isPreviewLoading && (
                      <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin text-rose-500" />
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                    Dấu bản quyền sẽ được in chìm tinh tế lên trang và giữ nguyên toàn bộ định dạng gốc của tệp PDF.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isProcessing || !watermarkText.trim()}
              className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Đang đóng dấu bản quyền lên PDF...</span>
                </>
              ) : (
                <>
                  <Stamp className="w-5 h-5" />
                  <span>Đóng Dấu Bản Quyền Ngay</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
