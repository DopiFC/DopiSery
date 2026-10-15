/**
 * Resolves static asset URLs correctly across local development,
 * custom domains, and GitHub Pages subdirectories (e.g. /<repo-name>/).
 */
export function getAssetUrl(relativePath: string): string {
  const clean = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  if (typeof window !== 'undefined') {
    // document.baseURI points to the current document's base URL (e.g. https://user.github.io/repo/)
    const baseUri = document.baseURI || window.location.href;
    // Extract base directory ending with '/'
    const dirBase = baseUri.substring(0, baseUri.lastIndexOf('/') + 1);
    return new URL(clean, dirBase).href;
  }
  return `./${clean}`;
}
