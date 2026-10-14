import React from 'react';
import {
  FileText,
  Cpu,
  Sparkles,
  FileCheck2,
  CheckCircle2,
  Loader2,
  XCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PageProcessingProgress, ConversionMode } from '../services/pdfService';

interface PdfConversionProgressProps {
  progress: PageProcessingProgress | null;
  conversionMode?: ConversionMode;
  forceOcr?: boolean;
  hasScannedPages?: boolean;
  fileName?: string;
  onCancel?: () => void;
}

type StepStatus = 'completed' | 'active' | 'pending' | 'skipped';

interface StageDefinition {
  id: 'loading' | 'extracting' | 'ocr' | 'building';
  label: string;
  shortName: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: StageDefinition[] = [
  {
    id: 'loading',
    label: 'Đang tải',
    shortName: 'Tải PDF',
    sublabel: 'Nạp an toàn vào RAM',
    icon: FileText,
  },
  {
    id: 'extracting',
    label: 'Trích xuất',
    shortName: 'Trích xuất',
    sublabel: 'Phân tích cấu trúc & chữ',
    icon: Cpu,
  },
  {
    id: 'ocr',
    label: 'OCR (nếu có)',
    shortName: 'OCR quét',
    sublabel: 'Nhận diện ảnh scan',
    icon: Sparkles,
  },
  {
    id: 'building',
    label: 'Xuất DOCX',
    shortName: 'Tạo Word',
    sublabel: 'Hoàn tất tài liệu .docx',
    icon: FileCheck2,
  },
];

export const PdfConversionProgress: React.FC<PdfConversionProgressProps> = ({
  progress,
  forceOcr = false,
  hasScannedPages = false,
  fileName,
  onCancel,
}) => {
  if (!progress) return null;

  const currentStage = progress.stage || 'loading';
  const percent = Math.min(100, Math.max(0, progress.percent || 0));

  // Determine status of OCR stage:
  // If no scanned pages detected and forceOcr is false, OCR is skipped for super-fast performance
  const isOcrNeeded = forceOcr || hasScannedPages || Boolean(progress.hasOcrPages);

  const getStageStatus = (stageId: StageDefinition['id']): StepStatus => {
    if (stageId === 'ocr' && !isOcrNeeded) {
      return 'skipped';
    }

    if (stageId === 'loading') {
      if (currentStage === 'loading') return 'active';
      return 'completed';
    }

    if (stageId === 'extracting') {
      if (currentStage === 'loading') return 'pending';
      if (currentStage === 'extracting') return 'active';
      return 'completed';
    }

    if (stageId === 'ocr') {
      if (currentStage === 'loading' || currentStage === 'extracting') return 'pending';
      if (currentStage === 'ocr') return 'active';
      return 'completed';
    }

    if (stageId === 'building') {
      if (currentStage === 'building') {
        return percent >= 100 ? 'completed' : 'active';
      }
      return 'pending';
    }

    return 'pending';
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 shadow-md shadow-indigo-100/30 dark:shadow-none space-y-5 animate-fade-in">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            <Zap className="w-4 h-4 text-amber-300" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {fileName ? `Đang xử lý: ${fileName}` : 'Đang xử lý chuyển đổi tài liệu...'}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Client-Side
              </span>
              <span>•</span>
              <span>
                {progress.totalPages > 0
                  ? `Trang ${progress.currentPage} / ${progress.totalPages}`
                  : 'Khởi động bộ xử lý...'}
              </span>
            </div>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/80 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold transition cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Hủy tác vụ</span>
          </button>
        )}
      </div>

      {/* 4 Multi-Stage Visual Process Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {STAGES.map((st, index) => {
          const status = getStageStatus(st.id);
          const Icon = st.icon;

          let cardBg = 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400';
          let iconWrap = 'bg-slate-100 dark:bg-slate-800 text-slate-400';
          let statusBadge = (
            <span className="text-[10px] text-slate-400 font-medium">Chờ</span>
          );

          if (status === 'completed') {
            cardBg = 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200';
            iconWrap = 'bg-emerald-500 text-white';
            statusBadge = (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Xong
              </span>
            );
          } else if (status === 'active') {
            cardBg = 'bg-white dark:bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-200 shadow-sm';
            iconWrap = 'bg-indigo-600 text-white shadow-xs';
            statusBadge = (
              <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
                Đang chạy
              </span>
            );
          } else if (status === 'skipped') {
            cardBg = 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/50 text-slate-400 dark:text-slate-500 opacity-75';
            iconWrap = 'bg-slate-200/70 dark:bg-slate-800 text-slate-400';
            statusBadge = (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Bỏ qua
              </span>
            );
          }

          return (
            <div
              key={st.id}
              className={`p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${cardBg}`}
            >
              {/* Step counter banner */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                  Giai đoạn {index + 1}
                </span>
                {statusBadge}
              </div>

              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${iconWrap}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">
                    {st.label}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {status === 'skipped' ? 'Tự động bỏ qua (Văn bản số)' : st.sublabel}
                  </p>
                </div>
              </div>

              {/* Active step progress indicator */}
              {status === 'active' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Primary Linear Progress Bar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-2 truncate pr-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="truncate">{progress.message}</span>
          </span>
          <span className="font-extrabold text-indigo-600 dark:text-indigo-400 shrink-0">
            {percent}%
          </span>
        </div>

        <div className="w-full h-3 bg-indigo-100 dark:bg-indigo-950 rounded-full overflow-hidden p-0.5 border border-indigo-200/80 dark:border-indigo-800/80">
          <div
            className="h-full bg-linear-to-r from-indigo-600 via-indigo-500 to-indigo-600 rounded-full transition-all duration-300 relative shadow-inner"
            style={{ width: `${percent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      {/* Helpful Hint */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Toàn bộ công đoạn xử lý trực tiếp trên CPU thiết bị của bạn.
        </span>
        <span className="font-medium text-slate-600 dark:text-slate-300">
          Chế độ chuyển nhanh • Không gửi dữ liệu lên mạng
        </span>
      </div>
    </div>
  );
};
