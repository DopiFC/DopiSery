/**
 * File and download utilities for DopiSery.
 * Ensures all temporary object URLs are properly revoked to prevent memory leaks.
 */

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Trigger client-side file download and revoke URL after 30 seconds.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Revoke after a short delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 20000);
}

/**
 * Downloads a Uint8Array as a file
 */
export function downloadUint8Array(data: Uint8Array, filename: string, mimeType = 'application/pdf'): void {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Strip extension from filename
 */
export function getBaseFileName(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}
