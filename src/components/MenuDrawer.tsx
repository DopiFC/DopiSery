import React, { useEffect } from 'react';
import { 
  FileText, 
  Lock, 
  ShieldCheck, 
  Layers, 
  X, 
  FileSpreadsheet, 
  Scissors, 
  Minimize2, 
  RotateCw, 
  Stamp, 
  Binary, 
  Image as ImageIcon, 
  AlignLeft, 
  QrCode, 
  Type, 
  Home, 
  Check, 
  ChevronRight, 
  Heart, 
  Mail,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { ToolId } from '../types';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTool: ToolId;
  onSelectTool: (id: ToolId) => void;
  onOpenDonate: () => void;
  onOpenFeedback: () => void;
  onOpenPrivacy: () => void;
}

interface ToolMenuItem {
  id: ToolId;
  title: string;
  tagline: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  badge?: string;
  badgeColor?: string;
}

interface ToolGroup {
  categoryName: string;
  items: ToolMenuItem[];
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  currentTool,
  onSelectTool,
  onOpenDonate,
  onOpenFeedback,
  onOpenPrivacy,
}) => {
  // Close on Escape key and prevent background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toolGroups: ToolGroup[] = [
    {
      categoryName: 'Chuyển đổi & Bảng tính',
      items: [
        {
          id: 'pdf-to-word',
          title: 'PDF sang Word',
          tagline: 'Trích xuất & Chỉnh sửa trực tiếp trên web',
          icon: FileText,
          iconColor: 'text-indigo-600 dark:text-indigo-400',
          iconBg: 'bg-indigo-100 dark:bg-indigo-950/60',
          badge: 'Trọng tâm',
          badgeColor: 'bg-indigo-600 text-white',
        },
        {
          id: 'merge-excel',
          title: 'Gộp các file Excel',
          tagline: 'Mỗi file thành một sheet riêng, tốc độ tức thì',
          icon: FileSpreadsheet,
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
          badge: 'MỚI',
          badgeColor: 'bg-emerald-500 text-white',
        },
        {
          id: 'images-to-pdf',
          title: 'Hình ảnh sang PDF',
          tagline: 'Ghép nhiều ảnh JPG, PNG thành tài liệu PDF',
          icon: ImageIcon,
          iconColor: 'text-violet-600 dark:text-violet-400',
          iconBg: 'bg-violet-100 dark:bg-violet-950/60',
        },
        {
          id: 'extract-text',
          title: 'Trích xuất văn bản',
          tagline: 'Lấy toàn bộ chữ trong PDF & xuất file .TXT',
          icon: AlignLeft,
          iconColor: 'text-blue-600 dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-950/60',
        },
      ],
    },
    {
      categoryName: 'Bảo mật & Bản quyền',
      items: [
        {
          id: 'protect-pdf',
          title: 'Bảo vệ PDF bằng mật khẩu',
          tagline: 'Mã hóa chuẩn AES-256 thực sự (QPDF WASM)',
          icon: Lock,
          iconColor: 'text-amber-600 dark:text-amber-400',
          iconBg: 'bg-amber-100 dark:bg-amber-950/60',
          badge: 'Bảo mật cao',
          badgeColor: 'bg-amber-500 text-white',
        },
        {
          id: 'watermark-pdf',
          title: 'Đóng dấu bản quyền',
          tagline: 'Chèn Watermark chữ mờ, logo nhận diện thương hiệu',
          icon: Stamp,
          iconColor: 'text-rose-600 dark:text-rose-400',
          iconBg: 'bg-rose-100 dark:bg-rose-950/60',
        },
      ],
    },
    {
      categoryName: 'Chỉnh sửa & Quản lý PDF',
      items: [
        {
          id: 'merge-pdf',
          title: 'Gộp nhiều file PDF',
          tagline: 'Hợp nhất nhiều tập tin PDF theo thứ tự tùy chọn',
          icon: Layers,
          iconColor: 'text-sky-600 dark:text-sky-400',
          iconBg: 'bg-sky-100 dark:bg-sky-950/60',
        },
        {
          id: 'split-pdf',
          title: 'Tách trang PDF',
          tagline: 'Trích xuất các trang cụ thể hoặc chia nhỏ tệp',
          icon: Scissors,
          iconColor: 'text-cyan-600 dark:text-cyan-400',
          iconBg: 'bg-cyan-100 dark:bg-cyan-950/60',
        },
        {
          id: 'organize-pdf',
          title: 'Xoay, Sắp xếp & Xóa trang',
          tagline: 'Xem trước trang, xoay góc 90°/180°, đảo vị trí',
          icon: RotateCw,
          iconColor: 'text-teal-600 dark:text-teal-400',
          iconBg: 'bg-teal-100 dark:bg-teal-950/60',
        },
        {
          id: 'page-number-pdf',
          title: 'Đánh số trang PDF',
          tagline: 'Đánh số trang tự động ở đầu hoặc cuối trang',
          icon: Binary,
          iconColor: 'text-indigo-600 dark:text-indigo-400',
          iconBg: 'bg-indigo-100 dark:bg-indigo-950/60',
        },
        {
          id: 'compress-pdf',
          title: 'Nén & Tối ưu PDF',
          tagline: 'Giảm dung lượng tệp tin mà vẫn giữ độ sắc nét',
          icon: Minimize2,
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
        },
      ],
    },
    {
      categoryName: 'Tiện ích văn phòng trực tuyến',
      items: [
        {
          id: 'qr-code',
          title: 'Tạo mã QR Offline',
          tagline: 'Tạo mã QR từ liên kết, text mà không gửi ra ngoài',
          icon: QrCode,
          iconColor: 'text-purple-600 dark:text-purple-400',
          iconBg: 'bg-purple-100 dark:bg-purple-950/60',
        },
        {
          id: 'text-tools',
          title: 'Bộ đếm & Định dạng chữ',
          tagline: 'Đếm từ, ký tự, thời gian đọc & chuẩn hóa văn bản',
          icon: Type,
          iconColor: 'text-pink-600 dark:text-pink-400',
          iconBg: 'bg-pink-100 dark:bg-pink-950/60',
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Dark backdrop overlay covering full screen */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* Right Drawer Panel attached to right edge */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 z-10 h-full">
        {/* Drawer Header with Title & Close button */}
        <div className="shrink-0 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Danh mục tính năng
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  13 công cụ
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xử lý tài liệu 100% trên trình duyệt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list of ALL FEATURES */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Home button */}
          <div>
            <button
              onClick={() => onSelectTool('home')}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left cursor-pointer ${
                currentTool === 'home'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Trang chủ
                    {currentTool === 'home' && (
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded">
                        Đang mở
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Bảng điều khiển và tổng hợp tất cả công cụ
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* All 13 tools divided into groups */}
          {toolGroups.map((group, gIdx) => (
            <div key={gIdx} className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>{group.categoryName}</span>
                <span className="text-[10px] font-normal">{group.items.length} công cụ</span>
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTool === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTool(item.id)}
                      className={`w-full group flex items-start gap-3 p-2.5 rounded-xl transition text-left cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${item.iconBg} ${item.iconColor} group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isActive
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300'
                            }`}
                          >
                            {item.title}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                                item.badgeColor || 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {item.tagline}
                        </p>
                      </div>

                      {isActive ? (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Actions: Donate & Feedback */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Cộng đồng & Hỗ trợ
            </div>

            {/* Donate */}
            <button
              onClick={onOpenDonate}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/40 text-xs font-semibold transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <div className="text-left">
                  <span className="block font-bold">Ủng hộ bánh mỳ 🥖</span>
                  <span className="text-[11px] text-amber-700/90 dark:text-amber-400 font-normal">
                    Nguyen Ho Gia Bao • BIDV 8839674754
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-500" />
            </button>

            {/* Feedback */}
            <button
              onClick={onOpenFeedback}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-800/40 text-xs font-semibold transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block font-bold">Gửi phản hồi (Feedback)</span>
                  <span className="text-[11px] text-indigo-700/90 dark:text-indigo-400 font-normal">
                    nhgb2605@gmail.com
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-600" />
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 space-y-2">
          <button
            onClick={onOpenPrivacy}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-medium hover:bg-emerald-100/80 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Cam kết bảo mật 100% Client-Side</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1 pt-1">
            <span>DopiSery • Smart Document Tools</span>
            <span>v2.4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
