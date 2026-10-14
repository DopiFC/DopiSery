/**
 * Optimized Client-Side OCR Service using Tesseract.js.
 * Runs in an isolated Web Worker, reuses worker instance across multiple pages,
 * and releases memory cleanly when finished.
 */
import { createWorker, Worker } from 'tesseract.js';

export interface OcrProgress {
  status: string;
  progress: number;
}

export type OcrLanguage = 'vie' | 'eng' | 'vie+eng';

export interface OcrSession {
  recognize: (canvas: HTMLCanvasElement, onProgress?: (p: OcrProgress) => void) => Promise<string>;
  terminate: () => Promise<void>;
}

/**
 * Creates a reusable OCR session for an entire document conversion batch.
 * The Tesseract WebAssembly worker and language dictionary are loaded only ONCE,
 * drastically reducing multi-page overhead.
 */
export async function createOcrSession(
  language: OcrLanguage = 'vie+eng',
  onInitProgress?: (status: string) => void
): Promise<OcrSession> {
  let worker: Worker | null = null;
  let isTerminated = false;

  const initWorker = async (): Promise<Worker> => {
    if (worker) return worker;
    onInitProgress?.('Đang tải mô hình nhận dạng chữ WebAssembly...');
    
    worker = await createWorker(language, 1, {
      logger: (m) => {
        if (m.status) {
          onInitProgress?.(`Chuẩn bị từ điển ${m.status}...`);
        }
      },
    });
    return worker;
  };

  return {
    recognize: async (canvas: HTMLCanvasElement, onProgress?: (p: OcrProgress) => void) => {
      if (isTerminated) throw new Error('OCR Session has been terminated.');
      const activeWorker = await initWorker();

      // Hook progress logger for this specific recognition task
      activeWorker.setParameters({});
      
      const ret = await activeWorker.recognize(canvas);
      return ret.data.text.trim();
    },

    terminate: async () => {
      if (isTerminated) return;
      isTerminated = true;
      if (worker) {
        try {
          await worker.terminate();
        } catch (e) {
          console.warn('Error terminating OCR worker', e);
        }
        worker = null;
      }
    },
  };
}

/**
 * Single-shot recognize helper for one-off tasks (e.g. single page).
 * Automatically cleans up worker after execution.
 */
export async function recognizeTextFromCanvas(
  canvas: HTMLCanvasElement,
  language: OcrLanguage = 'vie+eng',
  onProgress?: (progress: OcrProgress) => void
): Promise<string> {
  const session = await createOcrSession(language, (msg) => {
    onProgress?.({ status: msg, progress: 0.1 });
  });

  try {
    return await session.recognize(canvas, onProgress);
  } finally {
    await session.terminate();
  }
}
