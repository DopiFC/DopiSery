import React from 'react';
import { ShieldCheck, HardDrive, Cpu, Lock, Heart, ArrowUpRight } from 'lucide-react';
import { ToolId } from '../types';

interface FooterProps {
  onSelectTool: (id: ToolId) => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTool, onOpenPrivacy }) => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 text-sm transition-colors">
      {/* Live Security Inspector Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="p-6 bg-gradient-to-r from-indigo-900/90 via-slate-900 to-slate-950 text-white rounded-2xl border border-indigo-500/20 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h4 className="font-bold text-base text-white tracking-wide">
                  Kiểm soát an toàn trực tiếp: 0 byte tải lên máy chủ
                </h4>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Tất cả tài liệu được xử lý bằng công nghệ <strong>WebAssembly</strong> và <strong>Web Worker</strong> ngay trong bộ nhớ RAM thiết bị của bạn. Không gửi dữ liệu đi, không lưu trữ cơ sở dữ liệu, không ghi nhật ký.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Server Uploads: 0 bytes
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sky-300 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                No Cookie Logs
              </div>
              <button
                onClick={onOpenPrivacy}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer flex items-center gap-1"
              >
                Chi tiết bảo mật <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
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
                onClick={() => onSelectTool('pdf-to-word')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                PDF sang Word (Chỉnh sửa trực tiếp)
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('extract-text')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Trích xuất văn bản & OCR
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('images-to-pdf')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Hình ảnh JPG/PNG sang PDF
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('text-tools')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
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
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Bảo vệ PDF bằng mật khẩu (AES-256)
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('merge-pdf')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Gộp nhiều file PDF
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('split-pdf')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Tách trang PDF
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('organize-pdf')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Xoay, sắp xếp & xóa trang
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('watermark-pdf')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Thêm dấu bản quyền (Watermark)
              </button>
            </li>
          </ul>
        </div>

        {/* Cam kết & Chính sách */}
        <div className="space-y-2">
          <h5 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider">
            Bảo Mật & Trợ Giúp
          </h5>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button 
                onClick={onOpenPrivacy}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition text-emerald-600 dark:text-emerald-400 font-medium"
              >
                Chính sách quyền riêng tư
              </button>
            </li>
            <li>
              <button 
                onClick={() => onSelectTool('qr-code')}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Tạo mã QR Offline an toàn
              </button>
            </li>
            <li>
              <span className="text-slate-400 dark:text-slate-500">
                Miễn phí • Không cần đăng ký tài khoản
              </span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
