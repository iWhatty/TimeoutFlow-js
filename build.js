
// build.js
import { build } from 'esbuild';
import { copyFile } from 'fs/promises';

const isDebug = false;
const shouldMinify = !isDebug;
const shouldSourceMap = isDebug;


const OUTFILE = 'dist/timeout-flow.min.js';
const DEST = 'testing/timeout-flow.min.js';

build({
  entryPoints: ['src/index.js'],           // Unified entry point
  outfile: OUTFILE,     // Single bundled output
  bundle: true,
  minify: shouldMinify,
  format: 'esm',
  target: ['es2020'],
  sourcemap: shouldSourceMap,
  platform: 'browser',
  banner: {
    js: `// TimeoutFlow - Fluent timer + RAF control library`
  }
}).then(async () => {
  console.log(`✅ Build complete → ${OUTFILE}`);
  await copyFile(OUTFILE, DEST);
  console.log(`📦 Copied to → ${DEST}`);
}).catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});