import React, { useState } from 'react';
import {
  Minimize2,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  Zap,
  Info,
} from 'lucide-react';
import { FileUploadZone } from '../components/FileUploadZone';
import { optimizePdf } from '../services/qpdfService';
import { downloadUint8Array, getBaseFileName, formatBytes } from '../utils/fileUtils';

export const CompressPdfTool: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [compressedBytes, setCompressedBytes] = useState<Uint8Array | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [newSize, setNewSize] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setSelectedFile(f);
    setOriginalSize(f.size);
    setCompressedBytes(null);
    setErrorMessage(null);
  };

  const handleCompress = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('Đang phân tích cấu trúc luồng dữ liệu PDF...');

    try {
      const buffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const optimized = await optimizePdf(bytes, (msg) => setStatusMessage(msg));
      setCompressedBytes(optimized);
      setNewSize(optimized.length);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  const handleDownload = () => {
    if (!compressedBytes || !selectedFile) return;
    const baseName = getBaseFileName(selectedFile.name);
    downloadUint8Array(compressedBytes, `${baseName}_ToiUu.pdf`);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCompressedBytes(null);
    setOriginalSize(0);
    setNewSize(0);
    setErrorMessage(null);
  };

  const sizeDiff = originalSize - newSize;
  const percentSaved = originalSize > 0 ? Math.round((sizeDiff / originalSize) * 100) : 0;
  const isActuallySmaller = sizeDiff > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
          <Zap className="w-3.5 h-3.5" />
          Tối ưu hóa dữ liệu PDF
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Nén & Tối Ưu Dung Lượng PDF
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Tái cấu trúc các luồng đối tượng (Object Streams) và tuyến tính hóa PDF (Linearize) để tệp tải nhanh hơn mà không suy giảm chất lượng hiển thị.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        {!selectedFile ? (
          <FileUploadZone
            accept=".pdf,application/pdf"
            multiple={false}
            title="Kéo & thả tệp PDF cần nén vào đây"
            subtitle="Hoặc chọn tệp từ máy tính / điện thoại"
            icon="pdf"
            onFilesSelected={handleFileSelected}
            errorMessage={errorMessage}
          />
        ) : compressedBytes ? (
          /* Result comparison */
          <div className="text-center space-y-6 py-4 animate-fade-in">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
              isActuallySmaller
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
            }`}>
              {isActuallySmaller ? <CheckCircle2 className="w-8 h-8" /> : <Info className="w-8 h-8" />}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isActuallySmaller
                  ? `Đã tối ưu hóa! Giảm ${percentSaved}% dung lượng`
                  : 'Tài liệu đã ở mức tối ưu cao nhất'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {isActuallySmaller
                  ? `Đã tiết kiệm được ${formatBytes(sizeDiff)} dữ liệu thừa và tuyến tính hóa PDF cho duyệt web mượt mà.`
                  : 'Tệp này đã được nén trước đó hoặc cấu trúc nội dung không chứa dữ liệu thừa có thể loại bỏ an toàn.'}
              </p>
            </div>

            {/* Size Comparison Cards */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-center">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400">Dung lượng gốc</span>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-1">
                  {formatBytes(originalSize)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Sau khi tối ưu</span>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                  {formatBytes(newSize)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Tải Tệp PDF Đã Tối Ưu
              </button>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition"
              >
                Nén tệp khác
              </button>
            </div>
          </div>
        ) : (
          /* Compress action */
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Dung lượng ban đầu: {formatBytes(selectedFile.size)}
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

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Phương thức tối ưu hóa DopiSery:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Nén và gộp các đối tượng PDF thành luồng dữ liệu đồng nhất (Object Streams)</li>
                <li>Tuyến tính hóa (Linearize / Fast Web View) cho phép mở tệp ngay lập tức khi gửi email</li>
                <li>Loại bỏ bảng mã font và metadata trùng lặp</li>
              </ul>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errorMessage}
              </p>
            )}

            {isProcessing && (
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{statusMessage || 'Đang thực thi tối ưu luồng dữ liệu...'}</span>
              </div>
            )}

            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Minimize2 className="w-5 h-5" />
              <span>{isProcessing ? 'Đang Nén Tệp...' : 'Bắt Đầu Nén & Tối Ưu Hóa PDF'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
