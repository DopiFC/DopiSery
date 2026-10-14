import * as XLSX from 'xlsx';
import { getBaseFileName } from '../utils/fileUtils';

export interface ExcelSheetDetail {
  sheetName: string;
  rowCount: number;
  colCount: number;
  previewData: (string | number)[][];
}

export interface ParsedExcelFile {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  sheets: ExcelSheetDetail[];
  targetSheetName: string; // User-editable sheet name
  workbook: XLSX.WorkBook;
}

export type ExcelMergeMode =
  | 'file-as-sheet' // Each file becomes its own sheet (default request)
  | 'all-sheets'     // Keep all original sheets from all workbooks
  | 'append-rows';   // Concatenate rows into a single master sheet

export interface ExcelMergeOptions {
  mode: ExcelMergeMode;
  outputFileName: string;
  includeSourceColumn?: boolean; // For append-rows mode
  skipHeaderRows?: boolean;      // For append-rows mode
}

export interface ExcelMergeResult {
  data: Uint8Array;
  fileName: string;
  sheetCount: number;
  sheetNames: string[];
  totalRows: number;
  fileSize: number;
}

/**
 * Sanitizes a candidate sheet name according to strict Excel specifications:
 * - Maximum 31 characters
 * - Cannot contain \ / ? * : [ ]
 * - Cannot start or end with single quote '
 * - Cannot be empty
 */
export function sanitizeExcelSheetName(rawName: string, fallback = 'Sheet'): string {
  let cleaned = (rawName || '')
    .replace(/[\\/?*:[\]]/g, '_')
    .replace(/^'+|'+$/g, '')
    .trim();

  if (!cleaned) {
    cleaned = fallback;
  }

  if (cleaned.length > 31) {
    cleaned = cleaned.substring(0, 31).trim();
  }

  return cleaned;
}

/**
 * Generates an Excel-safe, unique sheet name avoiding duplicates (case-insensitive in Excel).
 */
export function generateUniqueSheetName(requestedName: string, existingNames: Set<string>): string {
  const base = sanitizeExcelSheetName(requestedName);
  const baseLower = base.toLowerCase();

  if (!existingNames.has(baseLower)) {
    existingNames.add(baseLower);
    return base;
  }

  let counter = 2;
  while (true) {
    const suffix = ` (${counter})`;
    const maxBaseLen = Math.max(1, 31 - suffix.length);
    const trimmedBase = base.substring(0, maxBaseLen).trim();
    const candidate = `${trimmedBase}${suffix}`;
    const candidateLower = candidate.toLowerCase();

    if (!existingNames.has(candidateLower)) {
      existingNames.add(candidateLower);
      return candidate;
    }
    counter++;
  }
}

/**
 * Parses an uploaded Excel or CSV file in memory using SheetJS.
 * Extracts sheet metadata, row/col counts, and 5-row preview.
 */
export async function parseExcelFile(file: File): Promise<ParsedExcelFile> {
  const buffer = await file.arrayBuffer();
  
  // Read workbook with dates and formatting flags
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
    cellStyles: true,
    cellNF: true,
  });

  const sheets: ExcelSheetDetail[] = [];

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    let rowCount = 0;
    let colCount = 0;
    const previewData: (string | number)[][] = [];

    if (ws && ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);
      rowCount = range.e.r - range.s.r + 1;
      colCount = range.e.c - range.s.c + 1;

      // Extract up to 5 preview rows and 6 columns
      const rawData = XLSX.utils.sheet_to_json<(string | number)[]>(ws, {
        header: 1,
        defval: '',
        blankrows: false,
      });

      for (let r = 0; r < Math.min(5, rawData.length); r++) {
        const row = rawData[r] || [];
        const previewRow: (string | number)[] = [];
        for (let c = 0; c < Math.min(6, Math.max(colCount, row.length)); c++) {
          const val = row[c];
          previewRow.push(val !== undefined && val !== null ? String(val) : '');
        }
        previewData.push(previewRow);
      }
    }

    sheets.push({
      sheetName,
      rowCount,
      colCount,
      previewData,
    });
  }

  const baseName = getBaseFileName(file.name);
  const targetSheetName = sanitizeExcelSheetName(baseName, 'Sheet');

  return {
    id: `excel_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    file,
    fileName: file.name,
    fileSize: file.size,
    sheets,
    targetSheetName,
    workbook,
  };
}

/**
 * Merges multiple parsed Excel files into a single unified Excel (.xlsx) file.
 * Returns binary Uint8Array suitable for immediate client-side download.
 */
export async function mergeExcelFiles(
  parsedFiles: ParsedExcelFile[],
  options: ExcelMergeOptions,
  onProgress?: (percent: number, message: string) => void
): Promise<ExcelMergeResult> {
  if (!parsedFiles || parsedFiles.length === 0) {
    throw new Error('Chưa có tệp Excel nào được chọn để gộp.');
  }

  onProgress?.(10, 'Đang chuẩn bị bảng tính đích...');

  const targetWb = XLSX.utils.book_new();
  const existingNames = new Set<string>();
  const createdSheetNames: string[] = [];
  let totalRows = 0;

  if (options.mode === 'append-rows') {
    // Mode: Nối tiếp các dòng dữ liệu vào 1 Sheet duy nhất
    onProgress?.(25, 'Đang phân tích các cột và nối dữ liệu các dòng...');
    const combinedRows: (string | number)[][] = [];
    let headerRow: (string | number)[] | null = null;

    for (let fIdx = 0; fIdx < parsedFiles.length; fIdx++) {
      const item = parsedFiles[fIdx];
      const wsName = item.workbook.SheetNames[0];
      if (!wsName) continue;
      const ws = item.workbook.Sheets[wsName];
      if (!ws) continue;

      const fileRows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, {
        header: 1,
        defval: '',
        blankrows: false,
      });

      if (fileRows.length === 0) continue;

      // First file sets the header
      if (fIdx === 0) {
        headerRow = [...fileRows[0]];
        if (options.includeSourceColumn) {
          headerRow.unshift('Tệp Nguồn (File)');
        }
        combinedRows.push(headerRow);
      }

      // Add data rows
      const startRowIdx = options.skipHeaderRows !== false ? 1 : 0;
      for (let r = startRowIdx; r < fileRows.length; r++) {
        const row = [...fileRows[r]];
        if (options.includeSourceColumn) {
          row.unshift(item.fileName);
        }
        combinedRows.push(row);
      }

      onProgress?.(
        Math.round(25 + ((fIdx + 1) / parsedFiles.length) * 50),
        `Đã đọc xong dữ liệu từ "${item.fileName}"...`
      );
    }

    const masterSheetName = generateUniqueSheetName('Tong_Hop_Du_Lieu', existingNames);
    const masterWs = XLSX.utils.aoa_to_sheet(combinedRows);
    XLSX.utils.book_append_sheet(targetWb, masterWs, masterSheetName);
    createdSheetNames.push(masterSheetName);
    totalRows = combinedRows.length;
  } else if (options.mode === 'all-sheets') {
    // Mode: Giữ tất cả các sheet từ mọi file
    let processed = 0;
    const totalSheetsEstimate = parsedFiles.reduce((acc, f) => acc + f.sheets.length, 0);

    for (const item of parsedFiles) {
      for (const sheetInfo of item.sheets) {
        const sourceWs = item.workbook.Sheets[sheetInfo.sheetName];
        if (!sourceWs) continue;

        // Clone sheet to avoid shared mutations
        const clonedWs = structuredClone(sourceWs);
        const uniqueName = generateUniqueSheetName(sheetInfo.sheetName, existingNames);

        XLSX.utils.book_append_sheet(targetWb, clonedWs, uniqueName);
        createdSheetNames.push(uniqueName);
        totalRows += sheetInfo.rowCount;

        processed++;
        onProgress?.(
          Math.round(20 + (processed / Math.max(1, totalSheetsEstimate)) * 60),
          `Đang nạp Sheet "${uniqueName}" (${processed}/${totalSheetsEstimate})...`
        );
      }
    }
  } else {
    // Mode 'file-as-sheet': Default and explicitly requested mode:
    // Mỗi file thành một Sheet riêng mang tên file (hoặc tên tùy chỉnh)
    for (let i = 0; i < parsedFiles.length; i++) {
      const item = parsedFiles[i];
      const baseSheetName = item.targetSheetName || getBaseFileName(item.fileName);

      if (item.sheets.length <= 1) {
        // File has 1 sheet: use the file-level name
        const firstSheetName = item.workbook.SheetNames[0];
        const sourceWs = firstSheetName ? item.workbook.Sheets[firstSheetName] : null;

        if (sourceWs) {
          const clonedWs = structuredClone(sourceWs);
          const uniqueName = generateUniqueSheetName(baseSheetName, existingNames);
          XLSX.utils.book_append_sheet(targetWb, clonedWs, uniqueName);
          createdSheetNames.push(uniqueName);
          totalRows += item.sheets[0]?.rowCount || 0;
        }
      } else {
        // File has multiple sheets: preserve all sheets prefixed by the file name
        for (const sheetInfo of item.sheets) {
          const sourceWs = item.workbook.Sheets[sheetInfo.sheetName];
          if (!sourceWs) continue;

          const candidateName = `${baseSheetName}_${sheetInfo.sheetName}`;
          const uniqueName = generateUniqueSheetName(candidateName, existingNames);
          const clonedWs = structuredClone(sourceWs);

          XLSX.utils.book_append_sheet(targetWb, clonedWs, uniqueName);
          createdSheetNames.push(uniqueName);
          totalRows += sheetInfo.rowCount;
        }
      }

      onProgress?.(
        Math.round(20 + ((i + 1) / parsedFiles.length) * 60),
        `Đang gộp file ${i + 1}/${parsedFiles.length}: "${item.fileName}"...`
      );
    }
  }

  onProgress?.(85, 'Đang đóng gói và mã hóa định dạng XLSX...');

  // Build binary XLSX file
  const excelArray = XLSX.write(targetWb, {
    bookType: 'xlsx',
    type: 'array',
    compression: true,
  });

  const outputBytes = new Uint8Array(excelArray);

  onProgress?.(100, 'Gộp file Excel thành công!');

  let finalName = options.outputFileName.trim();
  if (!finalName.toLowerCase().endsWith('.xlsx')) {
    finalName += '.xlsx';
  }

  return {
    data: outputBytes,
    fileName: finalName,
    sheetCount: createdSheetNames.length,
    sheetNames: createdSheetNames,
    totalRows,
    fileSize: outputBytes.byteLength,
  };
}
