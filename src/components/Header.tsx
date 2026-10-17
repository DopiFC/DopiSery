import React from 'react';
import { 
  ShieldCheck, 
  Sun, 
  Moon, 
  Menu, 
  X,
  FileCheck2,
} from 'lucide-react';
import { ToolId } from '../types';

interface HeaderProps {
  currentTool: ToolId;
  onSelectTool: (id: ToolId) => void;
  onOpenPrivacy: () => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectTool,
  onOpenPrivacy,
  isMenuOpen,
  onToggleMenu,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand on Left */}
          <div
            onClick={() => onSelectTool('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="Về trang chủ DopiSery"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  Dopi<span className="text-indigo-600 dark:text-indigo-400">Sery</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block -mt-0.5">
                Smart Document Tools
              </p>
            </div>
          </div>

          {/* Right actions: Clean Toolbar with Only Privacy Badge, Dark Mode & Hamburger Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Privacy Indicator */}
            <button
              onClick={onOpenPrivacy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition cursor-pointer"
              title="Nhấn để xem cam kết bảo mật 100% Client-Side"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">100% Client-Side</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Đổi giao diện Sáng / Tối"
              title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* HAMBURGER MENU BUTTON ON THE FAR RIGHT */}
            <button
              onClick={onToggleMenu}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer ${
                isMenuOpen
                  ? 'bg-slate-800 text-white dark:bg-slate-700'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
              }`}
              aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu tính năng'}
              title="Mở toàn bộ danh mục tính năng"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
              <span>Menu tính năng</span>
              <span className="inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/25 text-white">
                13
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
