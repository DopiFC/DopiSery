import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const docsDir = path.resolve('docs');

// 1. Copy dist/index.html -> dist/404.html
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  fs.copyFileSync(
    path.join(distDir, 'index.html'),
    path.join(distDir, '404.html')
  );
  console.log('✓ Created dist/404.html for GitHub Pages routing');
}

// 2. Ensure .nojekyll in root, dist, and docs
fs.writeFileSync('.nojekyll', '# Disable Jekyll\n', 'utf8');
fs.writeFileSync(path.join(distDir, '.nojekyll'), '# Disable Jekyll\n', 'utf8');

// 3. Sync dist to docs folder so users can choose "Deploy from branch -> /docs"
if (fs.existsSync(distDir)) {
  fs.rmSync(docsDir, { recursive: true, force: true });
  fs.cpSync(distDir, docsDir, { recursive: true });
  fs.writeFileSync(path.join(docsDir, '.nojekyll'), '# Disable Jekyll\n', 'utf8');
  console.log('✓ Synced dist/ to docs/ for direct branch /docs deployment');
}
