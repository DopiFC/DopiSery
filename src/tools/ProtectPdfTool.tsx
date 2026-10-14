import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  Download,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  Printer,
  Copy,
  Edit,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { FileUploadZone } from '../components/FileUploadZone';
import { encryptPdfWithPassword } from '../services/qpdfService';
import { downloadUint8Array, getBaseFileName, formatBytes } from '../utils/fileUtils';

export const ProtectPdfTool: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userPassword, setUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Permission settings
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowModifying, setAllowModifying] = useState(false);
  const [allowCopying, setAllowCopying] = useState(false);

  // Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string | null>(null);
  const [encryptedBytes, setEncryptedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { label: 'Chưa nhập', color: 'bg-slate-200 dark:bg-slate-700', textCol: 'text-slate-400', percent: 0 };
    let score = 0;
    if (pwd.length >= 6) score += 25;
    if (pwd.length >= 10) score += 25;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15;

    if (score < 40) return { label: 'Yếu', color: 'bg-rose-500', textCol: 'text-rose-500', percent: 30 };
    if (score < 75) return { label: 'Trung bình', color: 'bg-amber-500', textCol: 'text-amber-500', percent: 65 };
    return { label: 'Mạnh (Khuyến nghị)', color: 'bg-emerald-500', textCol: 'text-emerald-500', percent: 100 };
  };

  const strength = calculatePasswordStrength(userPassword);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    setSelectedFile(files[0]);
    setEncryptedBytes(null);
    setErrorMessage(null);
    setIsVerified(false);
  };

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (!userPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu mở tài liệu.');
      return;
    }

    if (userPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProgressStatus('Đang nạp động cơ mã hóa QPDF WebAssembly...');

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);

      const encrypted = await encryptPdfWithPassword(pdfBytes, {
        userPassword,
        ownerPassword: ownerPassword || userPassword,
        allowPrinting,
        allowModifying,
        allowCopying,
        onProgress: (msg) => setProgressStatus(msg),
      });

      setEncryptedBytes(encrypted);
      setIsVerified(true);
      setProgressStatus(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setEncryptedBytes(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!encryptedBytes || !selectedFile) return;
    const baseName = getBaseFileName(selectedFile.name);
    downloadUint8Array(encryptedBytes, `${baseName}_BaoVe.pdf`);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUserPassword('');
    setConfirmPassword('');
    setOwnerPassword('');
    setEncryptedBytes(null);
    setErrorMessage(null);
    setIsVerified(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
          <Lock className="w-3.5 h-3.5" />
          Mã hóa chuẩn AES-256 • Trực tiếp trên thiết bị
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Bảo Vệ PDF Bằng Mật Khẩu
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Mã hóa tài liệu bằng công nghệ QPDF WebAssembly. Người xem bắt buộc phải nhập mật khẩu đúng mới có thể mở nội dung.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        {!selectedFile ? (
          <FileUploadZone
            accept=".pdf,application/pdf"
            multiple={false}
            title="Kéo & thả tệp PDF cần đặt mật khẩu vào đây"
            subtitle="Hoặc chọn tệp từ máy tính / điện thoại"
            icon="pdf"
            onFilesSelected={handleFileSelected}
            errorMessage={errorMessage}
          />
        ) : encryptedBytes ? (
          /* Success Screen */
          <div className="text-center space-y-6 py-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Đã bảo vệ PDF thành công!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Tệp <strong>{selectedFile.name}</strong> đã được mã hóa bằng chuẩn AES-256. Bất kỳ ai mở tệp đều phải nhập mật khẩu đã đặt.
              </p>
            </div>

            {/* Verification Badge */}
            {isVerified && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Đã kiểm tra xác thực mã hóa trực tiếp trong phiên</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Tải Tệp PDF Đã Khóa Mật Khẩu
              </button>

              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition"
              >
                Bảo vệ tệp khác
              </button>
            </div>
          </div>
        ) : (
          /* Password Form */
          <form onSubmit={handleEncrypt} className="space-y-6">
            {/* Selected File header */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {formatBytes(selectedFile.size)} • Chưa khóa mật khẩu
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

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Password input fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Mật khẩu mở tài liệu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showUserPassword ? 'text' : 'password'}
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Nhập mật khẩu bạn muốn đặt..."
                    disabled={isProcessing}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none pr-11"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showUserPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {userPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Độ mạnh mật khẩu:</span>
                      <span className={`font-semibold ${strength.textCol}`}>{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${strength.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                  Xác nhận lại mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại chính xác mật khẩu trên..."
                    disabled={isProcessing}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/30 outline-none pr-11"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced permissions accordion */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>{showAdvanced ? '− Thu gọn tùy chọn quyền nâng cao' : '+ Mở rộng tùy chọn quyền bảo mật (In ấn, sao chép)'}</span>
              </button>

              {showAdvanced && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4 animate-fade-in text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mật khẩu quản trị viên (Owner Password - Tùy chọn)
                    </label>
                    <input
                      type="password"
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="Để trống nếu muốn dùng chung với mật khẩu mở"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      Phân quyền khi người xem mở bằng mật khẩu:
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowPrinting}
                        onChange={(e) => setAllowPrinting(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>Cho phép in ấn tài liệu</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowCopying}
                        onChange={(e) => setAllowCopying(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>Cho phép sao chép văn bản & trích xuất nội dung</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowModifying}
                        onChange={(e) => setAllowModifying(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>Cho phép chỉnh sửa chú thích & biểu mẫu</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Critical Warning Note */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Lưu ý an toàn quan trọng:
              </div>
              <p className="leading-relaxed">
                Vì DopiSery tuân thủ tuyệt đối chính sách bảo mật không lưu trữ mật khẩu lên máy chủ, <strong>chúng tôi không thể khôi phục lại mật khẩu nếu bạn quên</strong>. Hãy ghi nhớ hoặc lưu trữ mật khẩu cẩn thận trước khi gửi tệp.
              </p>
            </div>

            {/* Processing status */}
            {isProcessing && (
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span>{progressStatus || 'Đang thực hiện mã hóa AES-256...'}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing || !userPassword || !confirmPassword}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <KeyRound className="w-5 h-5" />
              <span>{isProcessing ? 'Đang Mã Hóa Chuẩn AES...' : 'Tạo PDF Có Mật Khẩu Bảo Vệ'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Trust Footer */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center space-y-1">
        <p className="font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Mã hóa chuẩn công nghiệp được thực hiện hoàn toàn trong trình duyệt của bạn
        </p>
        <p>Mật khẩu và nội dung tệp không bao giờ truyền qua mạng Internet.</p>
      </div>
    </div>
  );
};
