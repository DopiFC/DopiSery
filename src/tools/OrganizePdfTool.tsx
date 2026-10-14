import React, { useState } from 'react';
import {
  RotateCw,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Undo,
  Download,
  CheckCircle2,
  RefreshCw,
  FileText,
  Layers,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { FileUploadZone } from '../components/FileUploadZone';
import { renderPageToCanvas, organizePdfPages } from '../services/pdfService';
import { downloadUint8Array, getBaseFileName, formatBytes } from '../utils/fileUtils';

interface PageCardState {
  originalIndex: number;
  rotationDelta: number;
  isDeleted: boolean;
  thumbnailUrl?: string;
}

export const OrganizePdfTool: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageCardState[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedBytes, setExportedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setExportedBytes(null);
    setErrorMessage(null);
    setIsLoadingPages(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        cMapUrl: '/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '/standard_fonts/',
      }).promise;
      const count = pdfDoc.numPages;

      const pageStates: PageCardState[] = [];
      for (let i = 1; i <= count; i++) {
        const canvas = await renderPageToCanvas(pdfDoc, i, 0.45);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        pageStates.push({
          originalIndex: i - 1,
          rotationDelta: 0,
          isDeleted: false,
          thumbnailUrl: dataUrl,
        });
      }

      setPages(pageStates);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsLoadingPages(false);
    }
  };

  const rotatePage = (index: number, degrees: number) => {
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === index
          ? { ...p, rotationDelta: (p.rotationDelta + degrees + 360) % 360 }
          : p
      )
    );
  };

  const movePage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= pages.length) return;
    const copy = [...pages];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    setPages(copy);
  };

  const toggleDelete = (index: number) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, isDeleted: !p.isDeleted } : p))
    );
  };

  const rotateAll = (deg: number) => {
    setPages((prev) =>
      prev.map((p) => ({ ...p, rotationDelta: (p.rotationDelta + deg + 360) % 360 }))
    );
  };

  const handleExport = async () => {
    if (!selectedFile) return;
    const active = pages.filter((p) => !p.isDeleted);
    if (active.length === 0) {
      setErrorMessage('Không thể xóa toàn bộ trang. Phải giữ lại ít nhất 1 trang.');
      return;
    }

    setIsExporting(true);
    setErrorMessage(null);

    try {
      const result = await organizePdfPages(selectedFile, pages);
      setExportedBytes(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (!exportedBytes || !selectedFile) return;
    const baseName = getBaseFileName(selectedFile.name);
    downloadUint8Array(exportedBytes, `${baseName}_SapXep.pdf`);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPages([]);
    setExportedBytes(null);
    setErrorMessage(null);
  };

  const activePagesCount = pages.filter((p) => !p.isDeleted).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
          <RotateCw className="w-3.5 h-3.5" />
          Quản lý bố cục trang
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Xoay, Sắp Xếp & Xóa Trang PDF
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Xem trước hình thu nhỏ từng trang, xoay góc ngang/dọc, kéo thả đổi thứ tự hoặc xóa trang không cần thiết.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        {!selectedFile ? (
          <FileUploadZone
            accept=".pdf,application/pdf"
            multiple={false}
            title="Kéo & thả tệp PDF cần sắp xếp hoặc xoay trang vào đây"
            subtitle="Hoặc chọn tệp từ máy tính / điện thoại"
            icon="pdf"
            onFilesSelected={handleFileSelected}
            errorMessage={errorMessage}
          />
        ) : exportedBytes ? (
          /* Success Screen */
          <div className="text-center space-y-6 py-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Đã lưu bố cục PDF mới thành công!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Tài liệu mới gồm {activePagesCount} trang đã sẵn sàng tải xuống.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Tải Tệp PDF Mới
              </button>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition"
              >
                Chỉnh sửa tệp khác
              </button>
            </div>
          </div>
        ) : isLoadingPages ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
              Đang kết xuất hình thu nhỏ các trang PDF trong bộ nhớ...
            </p>
          </div>
        ) : (
          /* Grid of Pages */
          <div className="space-y-6">
            {/* Header toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-slate-400">
                  {activePagesCount} / {pages.length} trang được giữ lại
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => rotateAll(90)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Xoay tất cả +90°
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition"
                >
                  Đổi tệp
                </button>
              </div>
            </div>

            {/* Thumbnail Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pages.map((p, idx) => (
                <div
                  key={`page-${p.originalIndex}`}
                  className={`group relative rounded-xl border p-2 flex flex-col items-center transition-all ${
                    p.isDeleted
                      ? 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/20 opacity-50'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:shadow-md'
                  }`}
                >
                  {/* Page Badge */}
                  <div className="w-full flex items-center justify-between text-xs pb-1 px-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Trang {idx + 1}
                    </span>
                    {p.rotationDelta !== 0 && (
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                        {p.rotationDelta}°
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Image */}
                  <div className="w-full h-44 flex items-center justify-center overflow-hidden bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 my-1">
                    {p.thumbnailUrl ? (
                      <img
                        src={p.thumbnailUrl}
                        alt={`Trang ${idx + 1}`}
                        className="max-h-full max-w-full object-contain transition-transform duration-200"
                        style={{ transform: `rotate(${p.rotationDelta}deg)` }}
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Đang tải...</span>
                    )}
                  </div>

                  {/* Controls Toolbar */}
                  <div className="w-full flex items-center justify-between pt-1 gap-1">
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => movePage(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                        title="Di chuyển sang trái"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePage(idx, idx + 1)}
                        disabled={idx === pages.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                        title="Di chuyển sang phải"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => rotatePage(idx, 90)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        title="Xoay phải 90°"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleDelete(idx)}
                        className={`p-1 rounded ${
                          p.isDeleted
                            ? 'text-emerald-600 hover:text-emerald-700'
                            : 'text-slate-400 hover:text-rose-600'
                        }`}
                        title={p.isDeleted ? 'Khôi phục trang' : 'Xóa trang này'}
                      >
                        {p.isDeleted ? <Undo className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errorMessage}
              </p>
            )}

            <button
              onClick={handleExport}
              disabled={isExporting || activePagesCount === 0}
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>{isExporting ? 'Đang Xử Lý Bố Cục...' : `Xuất Tệp PDF Đã Chỉnh Sửa (${activePagesCount} Trang)`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
