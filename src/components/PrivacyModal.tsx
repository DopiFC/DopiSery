import React from 'react';
import { ShieldCheck, Lock, Cpu, DatabaseZap, HardDrive, WifiOff, X, CheckCircle2 } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-800 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Chính Sách Quyền Riêng Tư & Bảo Mật</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Kiến trúc bảo mật 100% Client-Side của DopiSery</p>
          </div>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
            <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Cam kết cốt lõi: Tài liệu không bao giờ rời khỏi thiết bị của bạn
            </p>
            <p className="text-emerald-700 dark:text-emerald-400/90 text-xs sm:text-sm">
              DopiSery được thiết kế theo mô hình xử lý trực tiếp trên trình duyệt (client-side execution). Không có bất kỳ tệp tin, hình ảnh, văn bản hay mật khẩu nào được gửi đến máy chủ của chúng tôi hoặc bên thứ ba.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" />
              1. Kiến trúc xử lý trong bộ nhớ RAM trình duyệt
            </h3>
            <p>
              Tất cả các tác vụ như chuyển đổi PDF sang Word, mã hóa mật khẩu, gộp tách tệp, hoặc nhận dạng chữ OCR đều chạy trực tiếp trên CPU/GPU của máy tính hoặc điện thoại bạn thông qua <strong>WebAssembly (WASM)</strong> và <strong>Web Worker</strong>. Mã nguồn được tải về một lần khi bạn mở website, sau đó mọi thao tác đều là cục bộ.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-blue-500" />
              2. Không có yêu cầu mạng chứa nội dung tài liệu
            </h3>
            <p>
              Bạn có thể mở công cụ F12 (Network tab) trên trình duyệt để kiểm tra: Khi bạn chọn tệp PDF có dung lượng 10MB và bấm chuyển đổi hoặc mã hóa, sẽ <strong>không có bất kỳ yêu cầu mạng (POST/PUT request) nào mang tệp đó lên mạng</strong>.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              3. Bảo mật mật khẩu & Mã hóa chuẩn AES
            </h3>
            <p>
              Khi bạn đặt mật khẩu cho PDF, thuật toán mã hóa AES-256 thực thi trực tiếp bằng nhân QPDF WebAssembly. DopiSery không ghi nhận, không gửi và không thể khôi phục mật khẩu nếu bạn quên. Mật khẩu không bao giờ được lưu vào cookies, LocalStorage hay máy chủ.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <DatabaseZap className="w-4 h-4 text-rose-500" />
              4. Nhận dạng ký tự quang học (OCR) hoàn toàn Offline
            </h3>
            <p>
              Công cụ nhận diện tài liệu scan sử dụng thư viện Tesseract.js chạy trong Web Worker. Không sử dụng các API nhận dạng đám mây của bên thứ ba, bảo vệ an toàn tối đa cho hóa đơn, hợp đồng và bảng lương doanh nghiệp.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-500" />
              5. Giải phóng bộ nhớ tự động
            </h3>
            <p>
              Khi bạn hoàn thành xử lý hoặc đóng tab trình duyệt, các tham chiếu dữ liệu tạm thời (Blob URLs) sẽ được thu hồi ngay lập tức bởi trình duyệt. Không có dữ liệu lưu trữ vĩnh viễn trên máy tính ngoài tệp kết quả do chính bạn nhấn tải xuống.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-md shadow-indigo-500/20"
          >
            Đã hiểu và tin tưởng
          </button>
        </div>
      </div>
    </div>
  );
};
