/**
 * Core PDF processing service using pdfjs-dist and pdf-lib.
 * All computations take place in browser memory.
 */
import * as pdfjsLib from 'pdfjs-dist';
import {
  PDFDocument,
  rgb,
  degrees,
  StandardFonts,
} from 'pdf-lib';
import { createOcrSession, OcrSession, OcrLanguage } from './ocrService';

// Configure pdf.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export interface PdfDocumentInfo {
  numPages: number;
  fileName: string;
  fileSize: number;
  isEncrypted: boolean;
  pagesInfo: {
    pageNumber: number;
    hasText: boolean;
    textLength: number;
    width: number;
    height: number;
  }[];
}

export interface PageProcessingProgress {
  currentPage: number;
  totalPages: number;
  mode: 'reading' | 'ocr' | 'formatting';
  stage: 'loading' | 'extracting' | 'ocr' | 'building';
  message: string;
  percent: number;
  hasOcrPages?: boolean;
}

export interface ConversionPerformanceTiming {
  loadPdfMs: number;
  extractTextMs: number;
  ocrMs: number;
  buildDocMs: number;
  totalMs: number;
  ocrPagesRun: number;
  nativePagesRun: number;
}

export type ConversionMode = 'fast' | 'layout';

/**
 * Loads a PDF file and inspects basic metadata and text presence per page.
 */
export async function inspectPdfFile(file: File): Promise<PdfDocumentInfo> {
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      cMapUrl: '/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: '/standard_fonts/',
    });

    // 20-second timeout guard to prevent infinite hang on corrupted files
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Hết thời gian chờ (Timeout): Tệp PDF có thể bị hỏng hoặc chứa cấu trúc bất thường.')), 20000)
    );

    const pdfDoc = await Promise.race([loadingTask.promise, timeoutPromise]);
    const numPages = pdfDoc.numPages;
    const pagesInfo = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const textLength = textContent.items.reduce((acc, item: unknown) => {
        const textItem = item as { str?: string };
        return acc + (textItem.str?.length || 0);
      }, 0);

      const viewport = page.getViewport({ scale: 1 });
      pagesInfo.push({
        pageNumber: i,
        hasText: textLength > 20, // Has real text layer
        textLength,
        width: viewport.width,
        height: viewport.height,
      });
    }

    return {
      numPages,
      fileName: file.name,
      fileSize: file.size,
      isEncrypted: false,
      pagesInfo,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('password') || msg.includes('Password')) {
      return {
        numPages: 0,
        fileName: file.name,
        fileSize: file.size,
        isEncrypted: true,
        pagesInfo: [],
      };
    }
    throw new Error(`Không thể đọc tài liệu PDF: ${msg}`);
  }
}

/**
 * Renders a specific page to an HTML Canvas (used for OCR and page thumbnails).
 */
export async function renderPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale = 1.8
): Promise<HTMLCanvasElement> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render
  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderContext).promise;
  return canvas;
}

/**
 * Extracts and converts PDF pages into editable HTML for the Word editor.
 * Accurately classifies native text vs scan pages, uses Tesseract.js when needed,
 * and maintains headings, paragraphs, and page breaks.
 */
export interface ConvertPdfOptions {
  ocrLanguage?: OcrLanguage;
  forceOcr?: boolean;
  mode?: ConversionMode;
  signal?: AbortSignal;
  onProgress?: (progress: PageProcessingProgress) => void;
}

export interface ConvertPdfResult {
  html: string;
  totalPages: number;
  ocrPagesCount: number;
  nativePagesCount: number;
  timing: ConversionPerformanceTiming;
}

/**
 * Extracts and converts PDF pages into editable HTML for the Word editor.
 * Highly optimized performance:
 * - Prioritizes native vector text extraction (< 15ms/page).
 * - Only spins up OCR for purely scanned/image pages.
 * - Reuses a single Tesseract WebAssembly worker across all scan pages.
 * - Uses optimal 1.3x canvas scale and releases memory immediately.
 * - Supports instant cancellation via AbortSignal.
 * - Records latency timing for each phase.
 */
export async function convertPdfToEditableHtml(
  file: File,
  options: ConvertPdfOptions = {}
): Promise<ConvertPdfResult> {
  const tStart = performance.now();
  let loadPdfMs = 0;
  let extractTextMs = 0;
  let ocrMs = 0;
  let buildDocMs = 0;

  // Step 1: Read and load PDF document into memory
  const tLoadStart = performance.now();
  options.onProgress?.({
    currentPage: 0,
    totalPages: 0,
    mode: 'reading',
    stage: 'loading',
    message: 'Đang tải và nạp tài liệu PDF vào bộ nhớ...',
    percent: 5,
  });

  const arrayBuffer = await file.arrayBuffer();
  if (options.signal?.aborted) {
    throw new Error('Tác vụ chuyển đổi đã được hủy.');
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: '/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: '/standard_fonts/',
  });

  const loadTimeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Hết thời gian nạp PDF (Timeout sau 25s): Tệp PDF có thể bị lỗi định dạng.')), 25000)
  );

  const pdfDoc = await Promise.race([loadingTask.promise, loadTimeoutPromise]);
  const totalPages = pdfDoc.numPages;
  loadPdfMs = Math.round(performance.now() - tLoadStart);

  let ocrPagesCount = 0;
  let nativePagesCount = 0;
  let ocrSession: OcrSession | null = null;
  const pageHtmlChunks: string[] = [];
  const mode = options.mode || 'fast';

  try {
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (options.signal?.aborted) {
        throw new Error('Tác vụ chuyển đổi đã được hủy theo yêu cầu của bạn.');
      }

      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const items = textContent.items as Array<{
        str: string;
        transform: number[];
        width: number;
        height: number;
        fontName: string;
      }>;

      const rawText = items.map((it) => it.str).join(' ').trim();
      
      // Smart detection: A page has native text if it has real items and non-trivial content
      const hasNativeText =
        !options.forceOcr &&
        items.length > 0 &&
        (rawText.length >= 6 || items.some((it) => it.str.trim().length >= 2));

      let pageHtml = '';

      if (hasNativeText) {
        // --- FAST PATH: Native Text Extraction ---
        nativePagesCount++;
        const tExtractStart = performance.now();

        options.onProgress?.({
          currentPage: pageNum,
          totalPages,
          mode: 'reading',
          stage: 'extracting',
          message: `Đang trích xuất văn bản số trang ${pageNum}/${totalPages}...`,
          percent: Math.round(((pageNum - 0.3) / totalPages) * 90),
          hasOcrPages: ocrPagesCount > 0,
        });

        // Group text items into lines by Y position
        const lines: Array<{
          y: number;
          fontSize: number;
          items: Array<{ str: string; x: number; fontSize: number }>;
        }> = [];

        const sortedItems = [...items].filter((i) => i.str.trim().length > 0);
        sortedItems.sort((a, b) => b.transform[5] - a.transform[5]);

        for (const item of sortedItems) {
          const y = Math.round(item.transform[5] / 4) * 4;
          const x = item.transform[4];
          const fontSize = Math.abs(Math.round(item.transform[0] || item.transform[3] || 12));

          let line = lines.find((l) => Math.abs(l.y - y) <= 4);
          if (!line) {
            line = { y, fontSize, items: [] };
            lines.push(line);
          }
          line.items.push({ str: item.str, x, fontSize });
        }

        // Sort lines top-to-bottom
        lines.sort((a, b) => b.y - a.y);

        const allFontSizes = lines.map((l) => l.fontSize).filter((s) => s > 0);
        const avgFontSize =
          allFontSizes.length > 0
            ? allFontSizes.reduce((a, b) => a + b, 0) / allFontSizes.length
            : 12;

        const paragraphs: string[] = [];
        let currentParagraphText = '';

        for (const line of lines) {
          line.items.sort((a, b) => a.x - b.x);
          const lineText = line.items.map((it) => it.str).join(' ').trim();
          if (!lineText) continue;

          const maxLineFontSize = Math.max(...line.items.map((it) => it.fontSize));
          const isHeading =
            maxLineFontSize > avgFontSize * 1.25 ||
            (lineText.length < 70 && maxLineFontSize >= avgFontSize * 1.15 && !lineText.endsWith('.'));

          if (isHeading) {
            if (currentParagraphText) {
              paragraphs.push(`<p>${escapeHtml(currentParagraphText)}</p>`);
              currentParagraphText = '';
            }
            const level = maxLineFontSize > avgFontSize * 1.6 ? 1 : 2;
            paragraphs.push(`<h${level}>${escapeHtml(lineText)}</h${level}>`);
          } else if (lineText.startsWith('•') || lineText.startsWith('- ') || lineText.startsWith('* ')) {
            if (currentParagraphText) {
              paragraphs.push(`<p>${escapeHtml(currentParagraphText)}</p>`);
              currentParagraphText = '';
            }
            paragraphs.push(`<ul><li>${escapeHtml(lineText.replace(/^[•\-\*]\s*/, ''))}</li></ul>`);
          } else {
            // Check for simple table columns in layout mode
            if (mode === 'layout' && line.items.length >= 3) {
              const gapX = line.items[1].x - (line.items[0].x + 40);
              if (gapX > 50) {
                if (currentParagraphText) {
                  paragraphs.push(`<p>${escapeHtml(currentParagraphText)}</p>`);
                  currentParagraphText = '';
                }
                const cells = line.items.map((it) => `<td style="border:1px solid #cbd5e1;padding:6px 10px;">${escapeHtml(it.str)}</td>`).join('');
                paragraphs.push(`<table style="width:100%;border-collapse:collapse;margin:8px 0;"><tr>${cells}</tr></table>`);
                continue;
              }
            }

            if (currentParagraphText) {
              currentParagraphText += ' ' + lineText;
            } else {
              currentParagraphText = lineText;
            }
          }
        }

        if (currentParagraphText) {
          paragraphs.push(`<p>${escapeHtml(currentParagraphText)}</p>`);
        }

        pageHtml = paragraphs.join('\n');
        extractTextMs += Math.round(performance.now() - tExtractStart);
      } else {
        // --- SCANNED PAGE PATH: OCR with Reused Worker Session ---
        ocrPagesCount++;
        const tOcrStart = performance.now();

        options.onProgress?.({
          currentPage: pageNum,
          totalPages,
          mode: 'ocr',
          stage: 'ocr',
          message: `Trang ${pageNum}/${totalPages} là ảnh quét - Đang chạy nhận dạng OCR...`,
          percent: Math.round(((pageNum - 0.5) / totalPages) * 90),
          hasOcrPages: true,
        });

        // Initialize OCR session ONCE if not already started
        if (!ocrSession) {
          ocrSession = await createOcrSession(options.ocrLanguage || 'vie+eng', (status) => {
            options.onProgress?.({
              currentPage: pageNum,
              totalPages,
              mode: 'ocr',
              stage: 'ocr',
              message: `Khởi tạo OCR: ${status}`,
              percent: Math.round(((pageNum - 0.8) / totalPages) * 90),
              hasOcrPages: true,
            });
          });
        }

        if (options.signal?.aborted) {
          throw new Error('Tác vụ chuyển đổi đã được hủy.');
        }

        // Render at optimal 1.3x scale for fast OCR without excessive memory usage
        const canvas = await renderPageToCanvas(pdfDoc, pageNum, 1.3);

        const ocrText = await ocrSession.recognize(canvas, (p) => {
          options.onProgress?.({
            currentPage: pageNum,
            totalPages,
            mode: 'ocr',
            stage: 'ocr',
            message: `Trang ${pageNum}/${totalPages} (OCR): ${p.status}`,
            percent: Math.round(((pageNum - 1 + p.progress) / totalPages) * 90),
            hasOcrPages: true,
          });
        });

        // Free canvas buffer immediately
        canvas.width = 0;
        canvas.height = 0;

        // Break OCR text into paragraphs
        const ocrLines = ocrText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
        const ocrParagraphs = ocrLines.map((line) => {
          if (line.length < 50 && (line.toUpperCase() === line || line.endsWith(':'))) {
            return `<h2>${escapeHtml(line)}</h2>`;
          }
          return `<p>${escapeHtml(line)}</p>`;
        });

        pageHtml = ocrParagraphs.join('\n') || '<p><em>(Trang quét không có nội dung chữ rõ ràng)</em></p>';
        ocrMs += Math.round(performance.now() - tOcrStart);
      }

      pageHtmlChunks.push(pageHtml);

      // Add page break separator if not last page
      if (pageNum < totalPages) {
        pageHtmlChunks.push(
          `<div class="page-break" style="margin: 24px 0; border-top: 2px dashed #94a3b8; text-align: center; color: #64748b; font-size: 12px; padding-top: 4px; user-select: none;">— Ngắt trang ${pageNum + 1} —</div>`
        );
      }
    }
  } finally {
    // Terminate OCR worker session and release memory
    if (ocrSession) {
      await ocrSession.terminate();
      ocrSession = null;
    }
  }

  // Step 3: Build document structure
  const tBuildStart = performance.now();
  options.onProgress?.({
    currentPage: totalPages,
    totalPages,
    mode: 'formatting',
    stage: 'building',
    message: 'Đang hoàn tất cấu trúc văn bản Word...',
    percent: 98,
    hasOcrPages: ocrPagesCount > 0,
  });

  const fullHtml = pageHtmlChunks.join('\n');
  buildDocMs = Math.round(performance.now() - tBuildStart);
  const totalMs = Math.round(performance.now() - tStart);

  options.onProgress?.({
    currentPage: totalPages,
    totalPages,
    mode: 'formatting',
    stage: 'building',
    message: `Hoàn tất chuyển đổi trong ${(totalMs / 1000).toFixed(1)}s!`,
    percent: 100,
    hasOcrPages: ocrPagesCount > 0,
  });

  return {
    html: fullHtml,
    totalPages,
    ocrPagesCount,
    nativePagesCount,
    timing: {
      loadPdfMs,
      extractTextMs,
      ocrMs,
      buildDocMs,
      totalMs,
      ocrPagesRun: ocrPagesCount,
      nativePagesRun: nativePagesCount,
    },
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Merge multiple PDF files into one.
 */
export async function mergePdfFiles(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const arrayBuffer = await file.arrayBuffer();
    const pdfToMerge = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));

    onProgress?.(Math.round(((i + 1) / files.length) * 100));
  }

  return await mergedPdf.save();
}

/**
 * Split a PDF file by parsed page ranges (e.g. "1-3, 5, 8-10").
 */
export async function splitPdfFile(
  file: File,
  rangeStr: string,
  onProgress?: (msg: string) => void
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const totalPages = sourcePdf.getPageCount();

  const targetIndices = parsePageRanges(rangeStr, totalPages);
  if (targetIndices.length === 0) {
    throw new Error('Không có trang nào hợp lệ trong khoảng trang đã chọn.');
  }

  onProgress?.(`Đang trích xuất ${targetIndices.length} trang...`);

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(sourcePdf, targetIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

/**
 * Helper to parse range string like "1-3, 5, 8-10" into 0-indexed page indices.
 */
export function parsePageRanges(rangeStr: string, maxPages: number): number[] {
  const indicesSet = new Set<number>();
  const parts = rangeStr.split(/[,;\s]+/).map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(maxPages, Math.max(start, end));
        for (let p = from; p <= to; p++) {
          indicesSet.add(p - 1);
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
        indicesSet.add(pageNum - 1);
      }
    }
  }

  return Array.from(indicesSet).sort((a, b) => a - b);
}

/**
 * Organize PDF: reorder, rotate individual pages, delete pages.
 */
export async function organizePdfPages(
  file: File,
  pagesConfig: Array<{ originalIndex: number; rotationDelta: number; isDeleted: boolean }>
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  // Filter out deleted
  const activePages = pagesConfig.filter((p) => !p.isDeleted);
  if (activePages.length === 0) {
    throw new Error('Bạn không thể xóa toàn bộ các trang.');
  }

  const indicesToCopy = activePages.map((p) => p.originalIndex);
  const copiedPages = await newPdf.copyPages(sourcePdf, indicesToCopy);

  activePages.forEach((config, idx) => {
    const page = copiedPages[idx];
    const currentRotation = page.getRotation().angle;
    const newAngle = (currentRotation + config.rotationDelta) % 360;
    page.setRotation(degrees(newAngle));
    newPdf.addPage(page);
  });

  return await newPdf.save();
}

export interface WatermarkOptions {
  text: string;
  opacity: number; // 0.05 to 1.0
  fontSize: number;
  colorHex: string;
  angle: number; // e.g. 45 or 0
  allPages: boolean;
  selectedPages?: number[];
}

/**
 * Renders a high-resolution PNG of watermark text in the browser.
 * 100% synchronous via canvas.toDataURL and base64 decode,
 * completely supporting full Vietnamese Unicode (with all accents/diacritics) without WinAnsi errors or promise hangs.
 */
export function renderWatermarkCanvasToPng(
  text: string,
  fontSize: number,
  colorHex: string
): Uint8Array {
  if (typeof document === 'undefined') return new Uint8Array();

  const canvas = document.createElement('canvas');
  const scale = 2; // 2x for retina quality in PDF
  const pxSize = Math.max(16, fontSize * scale);
  const fontStr = `bold ${pxSize}px "Plus Jakarta Sans", "Roboto", "Segoe UI", -apple-system, sans-serif`;

  const ctx = canvas.getContext('2d');
  if (!ctx) return new Uint8Array();

  ctx.font = fontStr;
  const metrics = ctx.measureText(text || 'WATERMARK');
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(pxSize * 1.35);

  canvas.width = Math.max(20, textWidth + 40);
  canvas.height = Math.max(20, textHeight + 20);

  const ctx2 = canvas.getContext('2d');
  if (!ctx2) return new Uint8Array();

  ctx2.clearRect(0, 0, canvas.width, canvas.height);
  ctx2.font = fontStr;
  ctx2.textAlign = 'center';
  ctx2.textBaseline = 'middle';
  ctx2.fillStyle = colorHex || '#94a3b8';
  ctx2.fillText(text || 'WATERMARK', canvas.width / 2, canvas.height / 2);

  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1];
  if (!base64) return new Uint8Array();

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Add a clean text watermark to PDF pages with 100% Vietnamese Unicode support.
 */
export async function addWatermarkToPdf(
  file: File,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  // ignoreEncryption handles PDFs with standard metadata security
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  if (pages.length === 0) {
    throw new Error('Tài liệu PDF không có trang nào để đóng dấu.');
  }

  // Render high-res PNG of watermark (guarantees perfect Vietnamese Unicode support)
  const watermarkPngBytes = renderWatermarkCanvasToPng(
    options.text.trim() || 'WATERMARK',
    options.fontSize || 36,
    options.colorHex || '#94a3b8'
  );

  if (watermarkPngBytes.length === 0) {
    throw new Error('Không thể tạo hình ảnh con dấu bản quyền trên canvas.');
  }

  const watermarkImg = await pdfDoc.embedPng(watermarkPngBytes);

  // Scaled dimensions on PDF (scaled down by 2 because canvas was 2x retina)
  const drawWidth = watermarkImg.width / 2;
  const drawHeight = watermarkImg.height / 2;

  pages.forEach((page, index) => {
    const pageNum = index + 1;
    if (!options.allPages && options.selectedPages && !options.selectedPages.includes(pageNum)) {
      return;
    }

    const { width, height } = page.getSize();
    const pageRot = (page.getRotation().angle || 0) % 360;

    // Compensate for page orientation so watermark is oriented consistently
    const effectiveAngle = (options.angle + pageRot) % 360;
    const rad = (effectiveAngle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Center offset calculations so center of rotated image aligns with page center
    const offsetX = (drawWidth / 2) * cos - (drawHeight / 2) * sin;
    const offsetY = (drawWidth / 2) * sin + (drawHeight / 2) * cos;

    const x = width / 2 - offsetX;
    const y = height / 2 - offsetY;

    page.drawImage(watermarkImg, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
      opacity: Math.max(0.04, Math.min(1, options.opacity ?? 0.25)),
      rotate: degrees(effectiveAngle),
    });
  });

  return await pdfDoc.save();
}

export interface PageNumberOptions {
  position: 'bottom-center' | 'bottom-right' | 'top-right' | 'top-center';
  format: 'n' | 'n-of-total' | 'page-n' | 'page-n-of-total';
  startFrom: number;
  fontSize: number;
  margin: number;
}

/**
 * Add page numbers to a PDF file.
 */
export async function addPageNumbersToPdf(
  file: File,
  options: PageNumberOptions
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const total = pages.length;

  pages.forEach((page, index) => {
    const pageNum = index + options.startFrom;
    let label = `${pageNum}`;

    if (options.format === 'n-of-total') {
      label = `${pageNum} / ${total}`;
    } else if (options.format === 'page-n') {
      label = `Trang ${pageNum}`;
    } else if (options.format === 'page-n-of-total') {
      label = `Trang ${pageNum} / ${total}`;
    }

    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, options.fontSize);
    let x = width / 2 - textWidth / 2;
    let y = options.margin;

    if (options.position === 'bottom-right') {
      x = width - textWidth - options.margin;
      y = options.margin;
    } else if (options.position === 'top-right') {
      x = width - textWidth - options.margin;
      y = height - options.margin - options.fontSize;
    } else if (options.position === 'top-center') {
      x = width / 2 - textWidth / 2;
      y = height - options.margin - options.fontSize;
    }

    try {
      page.drawText(label, {
        x,
        y,
        size: options.fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    } catch {
      const safeLabel = label.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      page.drawText(safeLabel, {
        x,
        y,
        size: options.fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }
  });

  return await pdfDoc.save();
}

export interface ImageToPdfOptions {
  pageSize: 'A4' | 'Letter' | 'FitImage';
  orientation: 'portrait' | 'landscape' | 'auto';
  margin: number;
}

/**
 * Converts multiple image files (JPG, PNG) into a single PDF document.
 */
export async function imagesToPdf(
  imageFiles: File[],
  options: ImageToPdfOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // A4 dimensions in points (72 points = 1 inch)
  const A4_PORTRAIT: [number, number] = [595.28, 841.89];
  const A4_LANDSCAPE: [number, number] = [841.89, 595.28];

  for (const imgFile of imageFiles) {
    const arrayBuffer = await imgFile.arrayBuffer();
    const isPng = imgFile.type === 'image/png' || imgFile.name.toLowerCase().endsWith('.png');
    
    let embeddedImg;
    if (isPng) {
      embeddedImg = await pdfDoc.embedPng(arrayBuffer);
    } else {
      embeddedImg = await pdfDoc.embedJpg(arrayBuffer);
    }

    const imgWidth = embeddedImg.width;
    const imgHeight = embeddedImg.height;

    let pageWidth: number;
    let pageHeight: number;

    if (options.pageSize === 'FitImage') {
      pageWidth = imgWidth + options.margin * 2;
      pageHeight = imgHeight + options.margin * 2;
    } else {
      const isImgLandscape = imgWidth > imgHeight;
      if (options.orientation === 'auto') {
        [pageWidth, pageHeight] = isImgLandscape ? A4_LANDSCAPE : A4_PORTRAIT;
      } else if (options.orientation === 'landscape') {
        [pageWidth, pageHeight] = A4_LANDSCAPE;
      } else {
        [pageWidth, pageHeight] = A4_PORTRAIT;
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Calculate scaling to fit within page bounds minus margin
    const availableWidth = pageWidth - options.margin * 2;
    const availableHeight = pageHeight - options.margin * 2;
    const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);

    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    const x = options.margin + (availableWidth - drawWidth) / 2;
    const y = options.margin + (availableHeight - drawHeight) / 2;

    page.drawImage(embeddedImg, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  return await pdfDoc.save();
}

/**
 * Extract raw text from a PDF file.
 */
export async function extractRawTextFromPdf(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: '/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: '/standard_fonts/',
  }).promise;
  const numPages = pdfDoc.numPages;
  const textChunks: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it: unknown) => (it as { str?: string }).str || '')
      .join(' ')
      .trim();

    textChunks.push(`--- Trang ${i} ---\n${pageText}\n`);
    onProgress?.(Math.round((i / numPages) * 100));
  }

  return textChunks.join('\n');
}
