import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Copy, Check, Sparkles, Link, AlignLeft, Wifi } from 'lucide-react';

export const QrCodeTool: React.FC = () => {
  const [content, setContent] = useState('https://dopisery.app');
  const [qrType, setQrType] = useState<'url' | 'text' | 'wifi'>('url');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [darkColor, setDarkColor] = useState('#0f172a');
  const [lightColor, setLightColor] = useState('#ffffff');
  const [isCopied, setIsCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getEncodedPayload = () => {
    if (qrType === 'wifi') {
      return `WIFI:T:WPA;S:${wifiSsid};P:${wifiPassword};;`;
    }
    return content;
  };

  useEffect(() => {
    const payload = getEncodedPayload();
    if (!canvasRef.current || !payload) return;

    QRCode.toCanvas(
      canvasRef.current,
      payload,
      {
        width: 280,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      },
      (error) => {
        if (error) console.error('QR code error', error);
      }
    );
  }, [content, qrType, wifiSsid, wifiPassword, darkColor, lightColor]);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DopiSery_QRCode.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    } catch {
      alert('Trình duyệt không hỗ trợ sao chép ảnh trực tiếp. Vui lòng nhấn nút Tải PNG.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
          <QrCode className="w-3.5 h-3.5" />
          Tiện ích văn phòng không gửi dữ liệu ra ngoài
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Tạo Mã QR Offline Riêng Tư
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Tạo mã QR từ liên kết website, văn bản hoặc Wi-Fi. 100% kết xuất trực tiếp trên Canvas máy tính của bạn, không gửi link đến bất kỳ API bên thứ ba nào.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Input Configuration */}
        <div className="space-y-4">
          <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setQrType('url')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1 ${
                qrType === 'url' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              <Link className="w-3.5 h-3.5" /> Website
            </button>
            <button
              onClick={() => setQrType('text')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1 ${
                qrType === 'text' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" /> Văn bản
            </button>
            <button
              onClick={() => setQrType('wifi')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1 ${
                qrType === 'wifi' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" /> Wi-Fi
            </button>
          </div>

          {qrType === 'wifi' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
                  Tên mạng Wi-Fi (SSID)
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="Ví dụ: Coffee_5G"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
                  Mật khẩu Wi-Fi
                </label>
                <input
                  type="text"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="Mật khẩu truy cập..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">
                {qrType === 'url' ? 'Đường dẫn liên kết (URL)' : 'Nội dung văn bản'}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={qrType === 'url' ? 'https://example.com...' : 'Nhập ghi chú, số điện thoại hoặc thông điệp...'}
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
              />
            </div>
          )}

          {/* Color customization */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Màu mã QR
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent"
                />
                <span className="text-xs text-slate-500 font-mono">{darkColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Màu nền
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent"
                />
                <span className="text-xs text-slate-500 font-mono">{lightColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Canvas Preview & Action */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4">
          <div className="p-3 bg-white rounded-xl shadow-md border border-slate-100">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>

          <div className="flex items-center gap-2 w-full justify-center">
            <button
              onClick={handleCopyImage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Đã sao chép' : 'Sao chép ảnh'}</span>
            </button>

            <button
              onClick={handleDownloadPng}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Ảnh PNG</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            100% Offline • Quét được trên mọi máy ảnh điện thoại
          </p>
        </div>
      </div>
    </div>
  );
};
