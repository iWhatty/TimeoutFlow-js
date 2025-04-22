// build.js
import { build } from 'esbuild';

build({
  entryPoints: ['src/index.js'],       // Your main entry point
  outfile: 'dist/timeout-flow.min.js', // Output destination
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2020'],
  sourcemap: true,
  platform: 'browser',
  banner: {
    js: `// TimeoutFlow - Fluent timer control library`
  }
}).then(() => {
  console.log('✅ Build complete');
}).catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
