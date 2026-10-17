import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  X, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck,
  Building2,
  User,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { BIDV_QR_BASE64 } from './qrBase64';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);

  const bankInfo = {
    bankName: 'BIDV (Ngân hàng TMCP Đầu tư & Phát triển Việt Nam)',
    shortBank: 'BIDV',
    accountName: 'Nguyen Ho Gia Bao',
    accountNumber: '8839674754',
    transferContent: 'Ung ho DopiSery',
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyAcc = () => {
    navigator.clipboard.writeText(bankInfo.accountNumber);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(bankInfo.transferContent);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  const handleDownloadQR = () => {
    const a = document.createElement('a');
    a.href = BIDV_QR_BASE64;
    a.download = `BIDV-${bankInfo.accountNumber}-${bankInfo.accountName.replace(/\s+/g, '_')}-QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 my-8 animate-fade-in">
        {/* Decorative Top Banner */}
        <div className="h-24 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="flex items-center gap-2 text-white font-extrabold text-lg drop-shadow-sm">
            <span className="text-2xl">🥖</span>
            <span>Ủng hộ bánh mỳ</span>
            <Heart className="w-5 h-5 text-rose-300 fill-rose-300 animate-pulse" />
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 text-center">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
            Mời tác giả chiếc bánh mỳ hoặc ly cà phê để tiếp thêm năng lượng phát triển <strong className="text-indigo-600 dark:text-indigo-400">DopiSery</strong> hoàn toàn miễn phí & bảo mật 100% Client-Side.
          </p>

          {/* QR Code Container - Displays exact untouched BIDV VietQR with 100% fidelity */}
          <div className="relative inline-block mx-auto mb-4 p-2 bg-white rounded-2xl shadow-md border border-slate-200 dark:border-slate-300 max-w-full">
            <img
              src={BIDV_QR_BASE64}
              alt={`Mã QR chuyển khoản BIDV - ${bankInfo.accountName}`}
              className="max-h-[300px] sm:max-h-[320px] w-auto mx-auto object-contain rounded-xl select-none"
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Quét mã VietQR bằng ứng dụng Ngân hàng (BIDV, Vietcombank, MB, Techcombank...) hoặc Ví điện tử (MoMo, ZaloPay, ViettelPay...)
          </p>

          {/* Bank Account Details Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-left space-y-2.5 mb-4">
            {/* Bank Name */}
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                  Ngân hàng thụ hưởng
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  {bankInfo.bankName}
                </span>
              </div>
            </div>

            {/* Account Owner Name */}
            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                  Chủ tài khoản
                </span>
                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 block tracking-wide">
                  {bankInfo.accountName}
                </span>
              </div>
            </div>

            {/* Account Number with 1-click Copy */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                    Số tài khoản
                  </span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono tracking-wider">
                    {bankInfo.accountNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCopyAcc}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
                title="Sao chép số tài khoản"
              >
                {copiedAcc ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>

            {/* Suggested Transfer Message */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                  Lời nhắn chuyển khoản
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {bankInfo.transferContent}
                </span>
              </div>
              <button
                onClick={handleCopyContent}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-indigo-600 text-[11px] font-medium transition cursor-pointer"
              >
                {copiedContent ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedContent ? 'Đã chép' : 'Chép lời nhắn'}</span>
              </button>
            </div>
          </div>

          {/* Download QR Button */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              onClick={handleDownloadQR}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer shadow-sm active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Tải ảnh mã QR về máy</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Tài khoản chính chủ tác giả</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
