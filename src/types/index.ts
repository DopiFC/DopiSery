export type ToolId =
  | 'home'
  | 'pdf-to-word'
  | 'protect-pdf'
  | 'merge-pdf'
  | 'split-pdf'
  | 'compress-pdf'
  | 'organize-pdf'
  | 'watermark-pdf'
  | 'page-number-pdf'
  | 'images-to-pdf'
  | 'extract-text'
  | 'qr-code'
  | 'text-tools'
  | 'merge-excel'
  | 'privacy';

export interface ToolItem {
  id: ToolId;
  name: string;
  tagline: string;
  category: 'convert' | 'security' | 'edit' | 'optimize' | 'office';
  isPopular?: boolean;
  isNew?: boolean;
  badge?: string;
  iconName: string;
  description: string;
}

export interface ExtractedParagraph {
  text: string;
  isHeading?: boolean;
  headingLevel?: 1 | 2 | 3;
  isBold?: boolean;
  isItalic?: boolean;
  align?: 'left' | 'center' | 'right';
  isList?: boolean;
  pageNumber: number;
}

export interface PageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
  hasText: boolean;
  textLength: number;
  thumbnailUrl?: string;
}

export interface SecurityStatus {
  filesProcessedSession: number;
  serverUploads: 0;
  telemetrySent: 0;
  localStorageSavedFiles: 0;
}
