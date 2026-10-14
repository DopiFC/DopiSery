import React, { useState } from 'react';
import {
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  Plus,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { FileUploadZone } from '../components/FileUploadZone';
import { imagesToPdf, ImageToPdfOptions } from '../services/pdfService';
import { downloadUint8Array, formatBytes } from '../utils/fileUtils';

export const ImagesToPdfTool: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<ImageToPdfOptions['pageSize']>('A4');
  const [orientation, setOrientation] = useState<ImageToPdfOptions['orientation']>('auto');
  const [margin, setMargin] = useState(20);
  const [isConverting, setIsConverting] = useState(false);
  const [generatedPdfBytes, setGeneratedPdfBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImagesSelected = (files: File[]) => {
    setImages((prev) => [...prev, ...files]);
    setGeneratedPdfBytes(null);
    setErrorMessage(null);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const copy = [...images];
    const item = copy.splice(index, 1)[0];
    copy.splice(targetIndex, 0, item);
    setImages(copy);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setGeneratedPdfBytes(null);
  };

  const handleConvertToPdf = async () => {
    if (images.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một hình ảnh.');
      return;
    }

    setIsConverting(true);
    setErrorMessage(null);

    try {
      const pdfBytes = await imagesToPdf(images, {
        pageSize,
        orientation,
        margin,
      });

      setGeneratedPdfBytes(pdfBytes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Lỗi tạo PDF từ ảnh: ${msg}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!generatedPdfBytes) return;
    downloadUint8Array(generatedPdfBytes, 'DopiSery_HinhAnh.pdf');
  };

  const handleReset = () => {
    setImages([]);
    setGeneratedPdfBytes(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 text-xs font-semibold border border-sky-200 dark:border-sky-800">
          <ImageIcon className="w-3.5 h-3.5" />
          Chuyển đổi hình ảnh sang tài liệu
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Chuyển Hình Ảnh JPG / PNG Sang PDF
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Ghép nhiều bức ảnh chụp chứng từ, biên lai, CMND/CCCD hoặc trang tài liệu thành một file PDF duy nhất.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        {images.length === 0 ? (
          <FileUploadZone
            accept="image/png,image/jpeg,image/webp,.jpg,.jpeg,.png,.webp"
            multiple={true}
            title="Kéo & thả hình ảnh JPG / PNG vào đây"
            subtitle="Có thể chọn nhiều ảnh cùng lúc để ghép thành tài liệu"
            icon="image"
            onFilesSelected={handleImagesSelected}
            errorMessage={errorMessage}
          />
        ) : generatedPdfBytes ? (
          /* Success Screen */
          <div className="text-center space-y-6 py-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Đã tạo PDF từ {images.length} hình ảnh!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Tài liệu PDF hoàn chỉnh đã sẵn sàng tải về thiết bị của bạn.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Tải Tệp PDF Hoàn Chỉnh
              </button>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition"
              >
                Chuyển ảnh khác
              </button>
            </div>
          </div>
        ) : (
          /* Image list and formatting controls */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Danh sách hình ảnh ({images.length} ảnh)
              </span>
              <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Thêm ảnh
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleImagesSelected(Array.from(e.target.files));
                    e.target.value = '';
                  }}
                />
              </label>
            </div>

            {/* Images List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {images.map((img, idx) => (
                <div
                  key={`${img.name}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-3 truncate pr-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {img.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatBytes(img.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveImage(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                      title="Di chuyển lên"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveImage(idx, 'down')}
                      disabled={idx === images.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                      title="Di chuyển xuống"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeImage(idx)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                      title="Xóa ảnh này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Layout options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Khổ giấy PDF
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as ImageToPdfOptions['pageSize'])}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="A4">Khổ A4 tiêu chuẩn</option>
                  <option value="FitImage">Tự động vừa kích thước ảnh</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chiều xoay trang
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as ImageToPdfOptions['orientation'])}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="auto">Tự động theo ảnh</option>
                  <option value="portrait">Trang đứng (Portrait)</option>
                  <option value="landscape">Trang ngang (Landscape)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lề trang (Margin)
                </label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="0">Không có lề (Tràn viền)</option>
                  <option value="20">Lề hẹp (20px)</option>
                  <option value="40">Lề chuẩn (40px)</option>
                </select>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errorMessage}
              </p>
            )}

            {isConverting && (
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang xử lý tạo file PDF từ ảnh...</span>
              </div>
            )}

            <button
              onClick={handleConvertToPdf}
              disabled={isConverting || images.length === 0}
              className="w-full py-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <ImageIcon className="w-5 h-5" />
              <span>Chuyển {images.length} Ảnh Thành PDF</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
