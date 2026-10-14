/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ToolId } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToolGrid } from './components/ToolGrid';
import { PrivacyModal } from './components/PrivacyModal';

// Tools
import { PdfToWordTool } from './tools/PdfToWordTool';
import { ProtectPdfTool } from './tools/ProtectPdfTool';
import { MergePdfTool } from './tools/MergePdfTool';
import { SplitPdfTool } from './tools/SplitPdfTool';
import { CompressPdfTool } from './tools/CompressPdfTool';
import { OrganizePdfTool } from './tools/OrganizePdfTool';
import { WatermarkPdfTool } from './tools/WatermarkPdfTool';
import { PageNumberPdfTool } from './tools/PageNumberPdfTool';
import { ImagesToPdfTool } from './tools/ImagesToPdfTool';
import { ExtractTextTool } from './tools/ExtractTextTool';
import { QrCodeTool } from './tools/QrCodeTool';
import { TextToolsTool } from './tools/TextToolsTool';
import { MergeExcelTool } from './tools/MergeExcelTool';

export default function App() {
  const [currentTool, setCurrentTool] = useState<ToolId>('home');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Sync dark mode class on html tag
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Scroll to top when switching tools
  const handleSelectTool = (id: ToolId) => {
    setCurrentTool(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveTool = () => {
    switch (currentTool) {
      case 'home':
        return (
          <ToolGrid
            onSelectTool={handleSelectTool}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
          />
        );
      case 'pdf-to-word':
        return <PdfToWordTool />;
      case 'protect-pdf':
        return <ProtectPdfTool />;
      case 'merge-pdf':
        return <MergePdfTool />;
      case 'split-pdf':
        return <SplitPdfTool />;
      case 'compress-pdf':
        return <CompressPdfTool />;
      case 'organize-pdf':
        return <OrganizePdfTool />;
      case 'watermark-pdf':
        return <WatermarkPdfTool />;
      case 'page-number-pdf':
        return <PageNumberPdfTool />;
      case 'images-to-pdf':
        return <ImagesToPdfTool />;
      case 'extract-text':
        return <ExtractTextTool />;
      case 'qr-code':
        return <QrCodeTool />;
      case 'text-tools':
        return <TextToolsTool />;
      case 'merge-excel':
        return <MergeExcelTool />;
      default:
        return (
          <ToolGrid
            onSelectTool={handleSelectTool}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        currentTool={currentTool}
        onSelectTool={handleSelectTool}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Breadcrumb when inside a specific tool */}
        {currentTool !== 'home' && (
          <div className="mb-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={() => handleSelectTool('home')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition font-medium"
            >
              Trang chủ
            </button>
            <span>/</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {currentTool === 'pdf-to-word' && 'PDF sang Word'}
              {currentTool === 'protect-pdf' && 'Bảo vệ PDF bằng mật khẩu'}
              {currentTool === 'merge-pdf' && 'Gộp nhiều PDF'}
              {currentTool === 'split-pdf' && 'Tách trang PDF'}
              {currentTool === 'compress-pdf' && 'Nén & Tối ưu PDF'}
              {currentTool === 'organize-pdf' && 'Xoay, sắp xếp & xóa trang'}
              {currentTool === 'watermark-pdf' && 'Đóng dấu bản quyền'}
              {currentTool === 'page-number-pdf' && 'Đánh số trang PDF'}
              {currentTool === 'images-to-pdf' && 'Hình ảnh sang PDF'}
              {currentTool === 'extract-text' && 'Trích xuất văn bản'}
              {currentTool === 'qr-code' && 'Tạo mã QR Offline'}
              {currentTool === 'text-tools' && 'Bộ đếm & Định dạng văn bản'}
              {currentTool === 'merge-excel' && 'Gộp các file Excel'}
            </span>
          </div>
        )}

        {renderActiveTool()}
      </main>

      {/* Footer */}
      <Footer
        onSelectTool={handleSelectTool}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Privacy Policy and Security Guarantees Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
