import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  Plus,
  CheckCircle2,
  RefreshCw,
  Eye,
  Settings,
  Layers,
  Table,
  AlertCircle,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FileUploadZone } from '../components/FileUploadZone';
import {
  parseExcelFile,
  mergeExcelFiles,
  ParsedExcelFile,
  ExcelMergeMode,
  ExcelMergeResult,
  sanitizeExcelSheetName,
} from '../services/excelService';
import { downloadUint8Array, formatBytes } from '../utils/fileUtils';

export const MergeExcelTool: React.FC = () => {
  const [parsedFiles, setParsedFiles] = useState<ParsedExcelFile[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [mergeResult, setMergeResult] = useState<ExcelMergeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings
  const [mergeMode, setMergeMode] = useState<ExcelMergeMode>('file-as-sheet');
  const [outputFileName, setOutputFileName] = useState('DopiSery_Gop_Excel.xlsx');
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);

  // Handle uploaded files
  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    setIsParsing(true);
    setErrorMessage(null);
    setMergeResult(null);

    try {
      const newlyParsed: ParsedExcelFile[] = [];
      for (const file of newFiles) {
        try {
          const parsed = await parseExcelFile(file);
          newlyParsed.push(parsed);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`Lỗi đọc file ${file.name}:`, err);
          setErrorMessage(`Không thể đọc tệp "${file.name}". Vui lòng kiểm tra định dạng Excel (.xlsx, .xls, .csv). Chi tiết: ${msg}`);
        }
      }

      setParsedFiles((prev) => [...prev, ...newlyParsed]);
    } finally {
      setIsParsing(false);
    }
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= parsedFiles.length) return;
    const copy = [...parsedFiles];
    const item = copy.splice(index, 1)[0];
    copy.splice(targetIndex, 0, item);
    setParsedFiles(copy);
    setMergeResult(null);
  };

  const removeFile = (id: string) => {
    setParsedFiles((prev) => prev.filter((f) => f.id !== id));
    if (previewFileId === id) setPreviewFileId(null);
    setMergeResult(null);
  };

  const updateTargetSheetName = (id: string, newName: string) => {
    setParsedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, targetSheetName: newName } : f))
    );
  };

  const handleMerge = async () => {
    if (parsedFiles.length < 2) {
      setErrorMessage('Vui lòng chọn ít nhất 2 tệp Excel để gộp.');
      return;
    }

    setIsMerging(true);
    setErrorMessage(null);
    setMergeProgress(0);
    setProgressMessage('Bắt đầu chuẩn bị gộp các tệp Excel...');

    try {
      const result = await mergeExcelFiles(
        parsedFiles,
        {
          mode: mergeMode,
          outputFileName: outputFileName || 'DopiSery_Gop_Excel.xlsx',
          includeSourceColumn: true,
          skipHeaderRows: true,
        },
        (percent, message) => {
          setMergeProgress(percent);
          setProgressMessage(message);
        }
      );

      setMergeResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Lỗi khi gộp tệp Excel: ${msg}`);
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergeResult) return;
    downloadUint8Array(
      mergeResult.data,
      mergeResult.fileName,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  };

  const handleReset = () => {
    setParsedFiles([]);
    setMergeResult(null);
    setMergeProgress(0);
    setProgressMessage('');
    setErrorMessage(null);
    setPreviewFileId(null);
  };

  const previewItem = parsedFiles.find((f) => f.id === previewFileId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title & Introduction */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Tiện ích Excel & Bảng tính
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Gộp Nhiều File Excel Thành Một File
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Gộp nhiều tệp Excel (.xlsx, .xls, .csv) vào một tệp mới duy nhất. Mặc định{' '}
          <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
            mỗi file gộp sẽ hiện ở từng sheet riêng biệt
          </strong>
          , tự động bảo toàn dữ liệu và tối ưu thứ tự trình bày.
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        {/* Upload Zone */}
        {parsedFiles.length === 0 ? (
          <FileUploadZone
            accept=".xlsx,.xls,.csv,.xlsm,.ods,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            multiple={true}
            title="Kéo & thả các tệp Excel cần gộp vào đây"
            subtitle="Hỗ trợ chọn cùng lúc nhiều file .xlsx, .xls, .csv"
            icon="excel"
            onFilesSelected={handleFilesSelected}
            isProcessing={isParsing}
            errorMessage={errorMessage}
          />
        ) : (
          <div className="space-y-6">
            {/* Header controls inside list */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Danh sách tệp Excel ({parsedFiles.length} tệp)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kéo hoặc bấm mũi tên để sắp xếp thứ tự sheet trong file gộp
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition">
                  <Plus className="w-3.5 h-3.5" />
                  Thêm tệp
                  <input
                    type="file"
                    multiple
                    accept=".xlsx,.xls,.csv,.xlsm,.ods"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFilesSelected(Array.from(e.target.files));
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium transition"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>

            {/* Parsing indicator */}
            {isParsing && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang nạp và phân tích dữ liệu các tệp Excel...
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* Files List */}
            <div className="space-y-3">
              {parsedFiles.map((item, idx) => {
                const totalRows = item.sheets.reduce((acc, s) => acc + s.rowCount, 0);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/70 hover:border-emerald-300 dark:hover:border-emerald-700/60 transition space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                      {/* Left info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <div className="p-2 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">
                            {item.fileName}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span>{formatBytes(item.fileSize)}</span>
                            <span>•</span>
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              {item.sheets.length} Sheet ({totalRows.toLocaleString()} dòng)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                        {/* Preview button */}
                        <button
                          onClick={() =>
                            setPreviewFileId(previewFileId === item.id ? null : item.id)
                          }
                          className={`p-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1 ${
                            previewFileId === item.id
                              ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                          }`}
                          title="Xem trước dữ liệu bảng tính"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Xem trước</span>
                          {previewFileId === item.id ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        {/* Order buttons */}
                        <button
                          onClick={() => moveFile(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Đưa lên trên"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveFile(idx, 'down')}
                          disabled={idx === parsedFiles.length - 1}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Đưa xuống dưới"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => removeFile(item.id)}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Xóa tệp khỏi danh sách"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Sheet Name configuration field */}
                    {mergeMode === 'file-as-sheet' && (
                      <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/70 flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs">
                        <span className="text-slate-600 dark:text-slate-400 font-medium shrink-0 flex items-center gap-1">
                          <Table className="w-3.5 h-3.5 text-emerald-500" />
                          Tên Sheet hiển thị trong file gộp:
                        </span>
                        <input
                          type="text"
                          maxLength={31}
                          value={item.targetSheetName}
                          onChange={(e) =>
                            updateTargetSheetName(
                              item.id,
                              sanitizeExcelSheetName(e.target.value, 'Sheet')
                            )
                          }
                          placeholder="Nhập tên sheet..."
                          className="px-2.5 py-1 flex-1 min-w-[180px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                        />
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.targetSheetName.length}/31 ký tự
                        </span>
                      </div>
                    )}

                    {/* Inline Preview Table if toggled */}
                    {previewFileId === item.id && (
                      <div className="mt-3 p-3 bg-white dark:bg-slate-950 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            Xem trước 5 dòng đầu tiên của Sheet chính:
                          </span>
                          <span className="text-[11px]">
                            {item.sheets[0]?.sheetName} ({item.sheets[0]?.colCount} cột ×{' '}
                            {item.sheets[0]?.rowCount} dòng)
                          </span>
                        </div>

                        {item.sheets[0]?.previewData && item.sheets[0].previewData.length > 0 ? (
                          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                            <table className="min-w-full text-xs divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {item.sheets[0].previewData.map((row, rIdx) => (
                                  <tr
                                    key={rIdx}
                                    className={
                                      rIdx === 0
                                        ? 'bg-slate-100/90 dark:bg-slate-800/90 font-semibold text-slate-800 dark:text-slate-200'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                                    }
                                  >
                                    <td className="px-2 py-1 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900 w-6 text-center select-none">
                                      {rIdx + 1}
                                    </td>
                                    {row.map((cell, cIdx) => (
                                      <td
                                        key={cIdx}
                                        className="px-3 py-1.5 whitespace-nowrap border-l border-slate-200 dark:border-slate-800/60 max-w-[200px] truncate"
                                      >
                                        {cell !== '' ? String(cell) : <span className="text-slate-300 dark:text-slate-600">--</span>}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic py-2">
                            Bảng tính trống hoặc không có dữ liệu để hiển thị xem trước.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Merge Options Panel */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Settings className="w-4 h-4 text-emerald-500" />
                Cấu hình tùy chọn gộp Excel
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mode Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Chế độ phân bổ Sheet:
                  </label>
                  <div className="space-y-2">
                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                        mergeMode === 'file-as-sheet'
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 text-slate-900 dark:text-white ring-1 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mergeMode"
                        checked={mergeMode === 'file-as-sheet'}
                        onChange={() => setMergeMode('file-as-sheet')}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold flex items-center gap-1.5">
                          Mỗi file thành một Sheet riêng (Khuyên dùng)
                          <span className="px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 text-[10px]">
                            Mặc định
                          </span>
                        </span>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                          Mỗi file tải lên sẽ trở thành một trang tính (Sheet) độc lập mang tên tệp đó.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                        mergeMode === 'all-sheets'
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 text-slate-900 dark:text-white ring-1 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mergeMode"
                        checked={mergeMode === 'all-sheets'}
                        onChange={() => setMergeMode('all-sheets')}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold">Giữ nguyên tất cả Sheet từ mọi file</span>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                          Tất cả các sheet con trong từng file sẽ được gom vào file mới, tự động đánh số nếu trùng tên.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                        mergeMode === 'append-rows'
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 text-slate-900 dark:text-white ring-1 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mergeMode"
                        checked={mergeMode === 'append-rows'}
                        onChange={() => setMergeMode('append-rows')}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold">Nối dòng vào 1 Sheet duy nhất</span>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                          Ghép nối tiếp dữ liệu các file thành một bảng tổng hợp duy nhất, tự động thêm cột tên file nguồn.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* File Name & Summary */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Tên tệp Excel kết quả (.xlsx):
                    </label>
                    <input
                      type="text"
                      value={outputFileName}
                      onChange={(e) => setOutputFileName(e.target.value)}
                      placeholder="DopiSery_Gop_Excel.xlsx"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Số lượng file đã chọn:</span>
                      <strong className="text-slate-900 dark:text-white font-bold">
                        {parsedFiles.length} tệp
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Tổng số Sheet dự kiến:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {mergeMode === 'append-rows'
                          ? '1 Sheet tổng hợp'
                          : `${parsedFiles.length} Sheet`}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Bảo mật dữ liệu:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 100% Client-Side
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Merge Progress Bar */}
            {isMerging && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-medium text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    {progressMessage || 'Đang tiến hành gộp dữ liệu...'}
                  </span>
                  <span className="font-mono font-bold">{mergeProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-emerald-200 dark:bg-emerald-900 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${mergeProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleReset}
                disabled={isMerging}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition disabled:opacity-50"
              >
                Hủy bỏ
              </button>

              <button
                onClick={handleMerge}
                disabled={isMerging || parsedFiles.length < 2}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isMerging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Đang gộp file...
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    Gộp {parsedFiles.length} File Excel Thành Một
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Result & Download Panel */}
        {mergeResult && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-300 dark:border-emerald-700/60 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                  Gộp File Excel Thành Công!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Đã tạo file <strong className="text-slate-800 dark:text-slate-200 font-mono">{mergeResult.fileName}</strong> với{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{mergeResult.sheetCount} Sheet</strong> ({formatBytes(mergeResult.fileSize)}).
                </p>
              </div>
            </div>

            {/* Created Sheets overview */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Các Sheet có trong tệp Excel kết quả:
              </p>
              <div className="flex flex-wrap gap-2">
                {mergeResult.sheetNames.map((name, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-medium"
                  >
                    <Table className="w-3 h-3 text-emerald-500" />
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* Download CTA */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium transition"
              >
                <RefreshCw className="w-4 h-4" />
                Gộp thêm file khác
              </button>

              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition transform hover:scale-[1.02] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Tải Xuống File Excel Đã Gộp (.xlsx)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feature Guide & Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            Mỗi File Ở Từng Sheet Riêng
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Hệ thống tự động chuyển mỗi tệp Excel tải lên thành một trang tính (Sheet) riêng biệt, lấy tên file làm tên Sheet chuẩn tối đa 31 ký tự.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            Tự Do Đổi Tên & Sắp Xếp
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Xem trước 5 dòng dữ liệu của từng file, chỉnh sửa tên Sheet tùy ý và bấm mũi tên để sắp xếp thứ tự sheet theo đúng nhu cầu báo cáo.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            100% Bảo Mật Offline
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Toàn bộ quá trình đọc, xử lý dữ liệu và tạo file .XLSX được thực thi ngay trong bộ nhớ trình duyệt bạn, không gửi bất kỳ dữ liệu nhạy cảm nào ra máy chủ.
          </p>
        </div>
      </div>
    </div>
  );
};
