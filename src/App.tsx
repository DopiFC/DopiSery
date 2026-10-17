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
import { DonateModal } from './components/DonateModal';
import { FeedbackModal } from './components/FeedbackModal';
import { MenuDrawer } from './components/MenuDrawer';

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
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getToolTitle = (id: ToolId): string => {
    switch (id) {
      case 'pdf-to-word': return 'PDF sang Word';
      case 'protect-pdf': return 'Bảo vệ PDF bằng mật khẩu';
      case 'merge-pdf': return 'Gộp nhiều PDF';
      case 'split-pdf': return 'Tách trang PDF';
      case 'compress-pdf': return 'Nén & Tối ưu PDF';
      case 'organize-pdf': return 'Xoay, sắp xếp & xóa trang';
      case 'watermark-pdf': return 'Đóng dấu bản quyền';
      case 'page-number-pdf': return 'Đánh số trang PDF';
      case 'images-to-pdf': return 'Hình ảnh sang PDF';
      case 'extract-text': return 'Trích xuất văn bản';
      case 'qr-code': return 'Tạo mã QR Offline';
      case 'text-tools': return 'Bộ đếm & Định dạng văn bản';
      case 'merge-excel': return 'Gộp các file Excel';
      default: return '';
    }
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
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
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
              className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition font-medium cursor-pointer"
            >
              Trang chủ
            </button>
            <span>/</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {getToolTitle(currentTool)}
            </span>
          </div>
        )}

        {renderActiveTool()}
      </main>

      {/* Footer */}
      <Footer
        onSelectTool={handleSelectTool}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenDonate={() => setIsDonateOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* Privacy Policy Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Donate Modal (Ủng hộ bánh mỳ) */}
      <DonateModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
      />

      {/* Feedback Modal (Gửi phản hồi) */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentToolName={getToolTitle(currentTool) || 'Trang chủ'}
      />

      {/* Right-Side Full Features Menu Drawer - Mounted at root to ensure 100% visibility */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentTool={currentTool}
        onSelectTool={handleSelectTool}
        onOpenDonate={() => {
          setIsMenuOpen(false);
          setIsDonateOpen(true);
        }}
        onOpenFeedback={() => {
          setIsMenuOpen(false);
          setIsFeedbackOpen(true);
        }}
        onOpenPrivacy={() => {
          setIsMenuOpen(false);
          setIsPrivacyOpen(true);
        }}
      />
    </div>
  );
}
