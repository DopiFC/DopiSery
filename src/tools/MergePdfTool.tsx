import React, { useState } from 'react';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  Plus,
  CheckCircle2,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { FileUploadZone } from '../components/FileUploadZone';
import { mergePdfFiles } from '../services/pdfService';
import { downloadUint8Array, formatBytes } from '../utils/fileUtils';

export const MergePdfTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergedBytes, setMergedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setMergedBytes(null);
    setErrorMessage(null);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    const copy = [...files];
    const item = copy.splice(index, 1)[0];
    copy.splice(targetIndex, 0, item);
    setFiles(copy);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedBytes(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setErrorMessage('Vui lòng chọn ít nhất 2 tệp PDF để gộp lại.');
      return;
    }

    setIsMerging(true);
    setErrorMessage(null);
    setProgress(0);

    try {
      const merged = await mergePdfFiles(files, (p) => setProgress(p));
      setMergedBytes(merged);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Lỗi gộp PDF: ${msg}`);
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergedBytes) return;
    downloadUint8Array(mergedBytes, 'DopiSery_HopNhat.pdf');
  };

  const handleReset = () => {
    setFiles([]);
    setMergedBytes(null);
    setProgress(0);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 text-xs font-semibold border border-sky-200 dark:border-sky-800">
          <Layers className="w-3.5 h-3.5" />
          Tiện ích quản lý PDF
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Gộp Nhiều Tệp PDF Thành Một
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Chọn nhiều tệp PDF, sắp xếp thứ tự các file theo mong muốn và gộp lại thành một tài liệu duy nhất trong tích tắc.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        {files.length === 0 ? (
          <FileUploadZone
            accept=".pdf,application/pdf"
            multiple={true}
            title="Kéo & thả các tệp PDF cần gộp vào đây"
            subtitle="Có thể chọn nhiều tệp cùng lúc"
            icon="pdf"
            onFilesSelected={handleFilesSelected}
            errorMessage={errorMessage}
          />
        ) : mergedBytes ? (
          /* Merged Result */
          <div className="text-center space-y-6 py-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Đã gộp thành công {files.length} tệp PDF!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Tài liệu hợp nhất đã sẵn sàng để tải xuống máy tính của bạn.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Tải Tệp PDF Đã Gộp
              </button>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition"
              >
                Gộp các tệp khác
              </button>
            </div>
          </div>
        ) : (
          /* File list & ordering */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Thứ tự gộp ({files.length} tệp)
              </span>
              <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Thêm tệp
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                    e.target.value = '';
                  }}
                />
              </label>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-3 truncate pr-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveFile(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                      title="Di chuyển lên"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveFile(idx, 'down')}
                      disabled={idx === files.length - 1}
                      className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                      title="Di chuyển xuống"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                      title="Xóa tệp khỏi danh sách"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errorMessage}
              </p>
            )}

            {isMerging && (
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang xử lý gộp PDF ({progress}%)...</span>
              </div>
            )}

            <button
              onClick={handleMerge}
              disabled={isMerging || files.length < 2}
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Layers className="w-5 h-5" />
              <span>Gộp {files.length} Tệp PDF Ngay</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
