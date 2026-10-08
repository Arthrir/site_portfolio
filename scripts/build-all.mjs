import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const v3Dir = path.join(rootDir, 'V3-Test');
const publicV3Dir = path.join(rootDir, 'public', 'v3');

console.log('🚀 [1/3] Installing dependencies and building V3 (React/Vite) app...');
try {
  execSync('npm install', { cwd: v3Dir, stdio: 'inherit' });
  execSync('npm run build', {
    cwd: v3Dir,
    stdio: 'inherit',
    env: { ...process.env, FIGMA_PUBLIC_URL: '/v3' }
  });
} catch (err) {
  console.error('❌ Failed to build V3:', err);
  process.exit(1);
}

console.log('📦 [2/3] Syncing V3 dist into public/v3...');
try {
  if (fs.existsSync(publicV3Dir)) {
    fs.rmSync(publicV3Dir, { recursive: true, force: true });
  }
  fs.cpSync(path.join(v3Dir, 'dist'), publicV3Dir, { recursive: true });
  // Also sync media to root public/media if present in V3 dist
  const distMedia = path.join(v3Dir, 'dist', 'media');
  const rootMedia = path.join(rootDir, 'public', 'media');
  if (fs.existsSync(distMedia)) {
    fs.cpSync(distMedia, rootMedia, { recursive: true });
  }
} catch (err) {
  console.error('❌ Failed to copy V3 dist to public/v3:', err);
  process.exit(1);
}

console.log('🌟 [3/3] Building Astro V2 site...');
try {
  execSync('npx astro build', { cwd: rootDir, stdio: 'inherit' });
} catch (err) {
  console.error('❌ Failed to build Astro site:', err);
  process.exit(1);
}

console.log('✅ Deployment build complete! V2 accessible on / and V3 accessible on /v3');

