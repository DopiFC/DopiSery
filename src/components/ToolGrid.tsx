import React, { useState } from 'react';
import {
  FileText,
  Lock,
  Layers,
  Scissors,
  Minimize2,
  RotateCw,
  Stamp,
  Binary,
  Image as ImageIcon,
  AlignLeft,
  QrCode,
  Type,
  Search,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  FileSpreadsheet,
} from 'lucide-react';
import { ToolId, ToolItem } from '../types';

interface ToolGridProps {
  onSelectTool: (id: ToolId) => void;
  onOpenPrivacy: () => void;
}

export const TOOLS_DATA: ToolItem[] = [
  {
    id: 'pdf-to-word',
    name: 'PDF sang Word',
    tagline: 'Chuyển đổi & Chỉnh sửa trực tiếp',
    category: 'convert',
    isPopular: true,
    badge: 'Trọng tâm',
    iconName: 'FileText',
    description: 'Trích xuất văn bản thật hoặc nhận diện trang scan bằng OCR. Tích hợp trình soạn thảo Word trên web và tải file .DOCX chuẩn.',
  },
  {
    id: 'protect-pdf',
    name: 'Bảo vệ PDF bằng mật khẩu',
    tagline: 'Mã hóa chuẩn AES-256 thực sự',
    category: 'security',
    isPopular: true,
    badge: 'Bảo mật cao',
    iconName: 'Lock',
    description: 'Khóa tài liệu bằng mật khẩu mở và phân quyền in ấn, sao chép. Mã hóa trực tiếp bằng nhân QPDF WebAssembly trên máy tính bạn.',
  },
  {
    id: 'merge-pdf',
    name: 'Gộp nhiều PDF',
    tagline: 'Hợp nhất tệp theo thứ tự tùy chọn',
    category: 'edit',
    isPopular: true,
    iconName: 'Layers',
    description: 'Chọn nhiều tệp PDF, kéo thả sắp xếp thứ tự và gộp thành một file duy nhất với tốc độ tức thì.',
  },
  {
    id: 'split-pdf',
    name: 'Tách trang PDF',
    tagline: 'Trích xuất trang theo khoảng',
    category: 'edit',
    iconName: 'Scissors',
    description: 'Trích xuất các trang cụ thể (ví dụ 1-3, 5, 8-10) hoặc chia nhỏ tài liệu theo nhu cầu công việc.',
  },
  {
    id: 'compress-pdf',
    name: 'Nén & Tối ưu PDF',
    tagline: 'Giảm dung lượng & Tuyến tính hóa',
    category: 'optimize',
    iconName: 'Minimize2',
    description: 'Tối ưu hóa luồng đối tượng (Object Streams) và nén cấu trúc PDF để gửi email nhanh hơn mà vẫn giữ độ nét.',
  },
  {
    id: 'organize-pdf',
    name: 'Xoay, Sắp xếp & Xóa trang',
    tagline: 'Quản lý bố cục trang trực quan',
    category: 'edit',
    iconName: 'RotateCw',
    description: 'Xem trước hình thu nhỏ từng trang, xoay góc 90°/180°, đảo vị trí hoặc xóa các trang không mong muốn.',
  },
  {
    id: 'watermark-pdf',
    name: 'Đóng dấu bản quyền',
    tagline: 'Watermark nhận diện thương hiệu',
    category: 'security',
    iconName: 'Stamp',
    description: 'Chèn dấu mờ bản quyền, logo hoặc dòng chữ "BẢO MẬT", "NỘI BỘ" với độ trong suốt và góc nghiêng tùy chỉnh.',
  },
  {
    id: 'page-number-pdf',
    name: 'Đánh số trang PDF',
    tagline: 'Chèn số thứ tự trang chuẩn văn bản',
    category: 'edit',
    iconName: 'Binary',
    description: 'Đánh số trang tự động ở đầu hoặc cuối trang với nhiều định dạng đẹp mắt cho hồ sơ và hợp đồng.',
  },
  {
    id: 'images-to-pdf',
    name: 'Hình ảnh sang PDF',
    tagline: 'Ghép JPG, PNG thành tài liệu',
    category: 'convert',
    iconName: 'ImageIcon',
    description: 'Ghép nhiều ảnh chụp biên lai, hóa đơn, giấy tờ tùy thân thành một tập tin PDF khổ A4 chuyên nghiệp.',
  },
  {
    id: 'extract-text',
    name: 'Trích xuất văn bản',
    tagline: 'Lấy nội dung chữ & Tải file .TXT',
    category: 'office',
    iconName: 'AlignLeft',
    description: 'Trích xuất toàn bộ văn bản trong PDF siêu tốc, sao chép nhanh vào Clipboard hoặc xuất tệp TXT.',
  },
  {
    id: 'qr-code',
    name: 'Tạo mã QR Offline',
    tagline: 'Không gửi link ra ngoài máy chủ',
    category: 'office',
    iconName: 'QrCode',
    description: 'Tạo mã QR từ website, văn bản hay mật khẩu Wi-Fi trực tiếp trên trình duyệt, an toàn cho thông tin nội bộ.',
  },
  {
    id: 'text-tools',
    name: 'Bộ đếm & Định dạng chữ',
    tagline: 'Đếm từ, ký tự & Chuẩn hóa văn bản',
    category: 'office',
    iconName: 'Type',
    description: 'Thống kê số từ, ký tự, thời gian đọc và công cụ chuẩn hóa khoảng trắng, viết hoa viết thường tiện lợi.',
  },
  {
    id: 'merge-excel',
    name: 'Gộp các file Excel',
    tagline: 'Mỗi file thành một Sheet riêng biệt',
    category: 'office',
    isPopular: true,
    isNew: true,
    badge: 'Mới',
    iconName: 'FileSpreadsheet',
    description: 'Gộp nhiều tệp Excel (.xlsx, .xls, .csv) thành 1 file duy nhất. Mỗi file tải lên sẽ hiển thị ở từng sheet khác nhau, tự do đổi tên và sắp xếp.',
  },
];

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool, onOpenPrivacy }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tất cả công cụ' },
    { id: 'convert', label: 'Chuyển đổi tài liệu' },
    { id: 'security', label: 'Bảo mật PDF' },
    { id: 'edit', label: 'Chỉnh sửa & Bố cục' },
    { id: 'optimize', label: 'Tối ưu hóa' },
    { id: 'office', label: 'Tiện ích văn phòng' },
  ];

  const filteredTools = TOOLS_DATA.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-6 h-6 text-indigo-500" />;
      case 'Lock': return <Lock className="w-6 h-6 text-emerald-500" />;
      case 'Layers': return <Layers className="w-6 h-6 text-sky-500" />;
      case 'Scissors': return <Scissors className="w-6 h-6 text-purple-500" />;
      case 'Minimize2': return <Minimize2 className="w-6 h-6 text-emerald-500" />;
      case 'RotateCw': return <RotateCw className="w-6 h-6 text-amber-500" />;
      case 'Stamp': return <Stamp className="w-6 h-6 text-rose-500" />;
      case 'Binary': return <Binary className="w-6 h-6 text-indigo-500" />;
      case 'ImageIcon': return <ImageIcon className="w-6 h-6 text-sky-500" />;
      case 'AlignLeft': return <AlignLeft className="w-6 h-6 text-teal-500" />;
      case 'QrCode': return <QrCode className="w-6 h-6 text-blue-500" />;
      case 'Type': return <Type className="w-6 h-6 text-orange-500" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />;
      default: return <FileText className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-6 pb-2 max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Phiên bản 1.0 • Miễn phí • Không cần tạo tài khoản</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Xử Lý Tài Liệu Dễ Dàng <br className="hidden sm:block" />
          Cùng <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500">DopiSery</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Bộ công cụ văn phòng trực tuyến bảo mật: Chuyển đổi PDF sang Word có thể chỉnh sửa, mã hóa mật khẩu AES-256 và tối ưu tài liệu <strong>100% trên trình duyệt</strong>.
        </p>

        {/* Two Core Quick Access Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onSelectTool('pdf-to-word')}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <FileText className="w-5 h-5" />
            <span>PDF sang Word (Chỉnh sửa trực tiếp)</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>

          <button
            onClick={() => onSelectTool('protect-pdf')}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm sm:text-base shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2.5 border border-slate-700 cursor-pointer"
          >
            <Lock className="w-5 h-5 text-emerald-400" />
            <span>Bảo Vệ PDF Bằng Mật Khẩu</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="pt-4 max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm công cụ: Word, mật khẩu, gộp, tách, OCR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm focus:ring-2 focus:ring-indigo-500/30 outline-none transition"
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Tools Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/60 dark:hover:border-indigo-500/60 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 group-hover:scale-110 transition-transform">
                    {getToolIcon(tool.iconName)}
                  </div>
                  {tool.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 mb-2">
                  {tool.tagline}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {tool.description}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                <span>Sử dụng ngay</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Không tìm thấy công cụ nào khớp với từ khóa "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold underline"
            >
              Hiển thị lại tất cả công cụ
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
