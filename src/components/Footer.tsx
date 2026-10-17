import React from 'react';
import { ShieldCheck, Heart, Mail } from 'lucide-react';
import { ToolId } from '../types';

interface FooterProps {
  onSelectTool: (id: ToolId) => void;
  onOpenPrivacy: () => void;
  onOpenDonate?: () => void;
  onOpenFeedback?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTool,
  onOpenPrivacy,
  onOpenDonate,
  onOpenFeedback,
}) => {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs text-slate-600 dark:text-slate-400">
      {/* Privacy guarantee bar */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">Bảo mật tuyệt đối:</span>
            <span>Mọi tệp tin của bạn được xử lý trực tiếp trên trình duyệt của máy bạn, không tải lên bất kỳ máy chủ nào.</span>
          </div>
          <button
            onClick={onOpenPrivacy}
            className="underline hover:text-emerald-900 dark:hover:text-emerald-200 font-medium whitespace-nowrap cursor-pointer"
          >
            Tìm hiểu thêm →
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-3">
          <div 
            onClick={() => onSelectTool('home')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm">
              D
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              Dopi<span className="text-indigo-600 dark:text-indigo-400">Sery</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Smart Document Tools – Bộ công cụ văn phòng trực tuyến xử lý tài liệu thông minh, riêng tư và tiện lợi cho dân văn phòng, kế toán và sinh viên.
          </p>
          <div className="pt-2 text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} DopiSery. Hoạt động 100% Client-Side.
          </div>
        </div>

        {/* Chuyển đổi & Chỉnh sửa */}
        <div className="space-y-2">
          <h5 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider">
            Chuyển Đổi & Biên Tập
          </h5>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button 
                onClick={() => onSelectTool('merge-excel')}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition font-medium flex items-center gap-1 text-emerald-600 dark:text-emerald-400 cursor-pointer"
              >
                Gộp các file Excel (Mới)
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('pdf-to-word')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              >
                PDF sang Word (Chỉnh sửa trực tiếp)
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('extract-text')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              >
                Trích xuất văn bản & OCR
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('images-to-pdf')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              >
                Hình ảnh JPG/PNG sang PDF
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('text-tools')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              >
                Bộ đếm từ & Chuẩn hóa văn bản
              </button>
            </li>
          </ul>
        </div>

        {/* Bảo mật & Cấu trúc */}
        <div className="space-y-2">
          <h5 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider">
            Bảo Mật & Quản Lý PDF
          </h5>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button 
                onClick={() => onSelectTool('protect-pdf')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              >
                Bảo vệ PDF bằng mật khẩu (AES-256)
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('merge-pdf')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              >
                Gộp nhiều file PDF
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('split-pdf')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              >
                Tách trang PDF
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('organize-pdf')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              >
                Xoay, sắp xếp & xóa trang
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('watermark-pdf')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              >
                Thêm dấu bản quyền (Watermark)
              </button>
            </li>
          </ul>
        </div>

        {/* Cộng đồng, Ủng hộ & Trợ Giúp */}
        <div className="space-y-2">
          <h5 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider">
            Cộng Đồng & Hỗ Trợ
          </h5>
          <ul className="space-y-1.5 text-xs">
            {onOpenDonate && (
              <li>
                <button 
                  onClick={onOpenDonate}
                  className="hover:text-amber-600 dark:hover:text-amber-400 text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Ủng hộ bánh mỳ 🥖</span>
                </button>
              </li>
            )}
            {onOpenFeedback && (
              <li>
                <button 
                  onClick={onOpenFeedback}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Gửi phản hồi & Góp ý</span>
                </button>
              </li>
            )}
            <li>
              <button 
                onClick={onOpenPrivacy}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition text-emerald-600 dark:text-emerald-400 font-medium cursor-pointer"
              >
                Chính sách quyền riêng tư
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('qr-code')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              >
                Tạo mã QR Offline an toàn
              </button>
            </li>
            <li>
              <span className="text-slate-400 dark:text-slate-500">
                Miễn phí • Không giới hạn lượt dùng
              </span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
