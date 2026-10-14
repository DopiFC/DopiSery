import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { formatBytes } from '../utils/fileUtils';

interface FileUploadZoneProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  title?: string;
  subtitle?: string;
  icon?: 'pdf' | 'image' | 'generic' | 'excel';
  onFilesSelected: (files: File[]) => void;
  selectedFiles?: File[];
  onRemoveFile?: (index: number) => void;
  onClearAll?: () => void;
  isProcessing?: boolean;
  errorMessage?: string | null;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  accept = '.pdf,application/pdf',
  multiple = false,
  maxSizeMB = 100,
  title = 'Kéo và thả tệp vào đây',
  subtitle = 'hoặc bấm để duyệt tệp từ thiết bị của bạn',
  icon = 'pdf',
  onFilesSelected,
  selectedFiles = [],
  onRemoveFile,
  onClearAll,
  isProcessing = false,
  errorMessage = null,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateAndPassFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const validFiles = files.filter((f) => {
      if (f.size > maxSizeMB * 1024 * 1024) {
        alert(`Tệp "${f.name}" vượt quá kích thước cho phép (${maxSizeMB}MB) để xử lý an toàn trong bộ nhớ trình duyệt.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onFilesSelected(multiple ? validFiles : [validFiles[0]]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isProcessing) return;
    validateAndPassFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    validateAndPassFiles(e.target.files);
    // Reset input value so same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openPicker = () => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleFileInputChange}
        disabled={isProcessing}
      />

      {/* Main Drag-Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openPicker}
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 select-none ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-500/80 hover:bg-slate-50/80 dark:hover:bg-slate-900'
        } ${isProcessing ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 duration-200 shadow-md ${
            icon === 'pdf'
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
              : icon === 'image'
              ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/40'
              : icon === 'excel'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
              : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40'
          }`}>
            {icon === 'pdf' ? (
              <FileText className="w-10 h-10" />
            ) : icon === 'image' ? (
              <ImageIcon className="w-10 h-10" />
            ) : icon === 'excel' ? (
              <FileSpreadsheet className="w-10 h-10" />
            ) : (
              <UploadCloud className="w-10 h-10" />
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium shadow-sm transition">
            <UploadCloud className="w-4 h-4" />
            Chọn tệp từ máy tính / điện thoại
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {multiple ? 'Hỗ trợ chọn nhiều tệp cùng lúc' : 'Xử lý an toàn'} • Tối đa {maxSizeMB}MB • 100% Client-Side
          </p>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1">
            <p className="font-medium">Không thể xử lý tệp</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
            <span>Tệp đã chọn ({selectedFiles.length})</span>
            {onClearAll && selectedFiles.length > 1 && !isProcessing && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-rose-600 dark:text-rose-400 hover:underline normal-case text-xs"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs sm:text-sm text-slate-700 dark:text-slate-200"
              >
                <div className="flex items-center gap-3 truncate pr-2">
                  <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-medium truncate text-slate-900 dark:text-white" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>

                {onRemoveFile && !isProcessing && (
                  <button
                    type="button"
                    onClick={() => onRemoveFile(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition"
                    title="Xóa tệp"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
