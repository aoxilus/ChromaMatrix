/**
 * ChromaMatrix - Run All Unit & Integration Tests
 */

await import('./ecc.test.js');
await import('./palette.test.js');
await import('./crypto.test.js');
await import('./compression.test.js');
await import('./roundtrip.test.js');
await import('./png-palette.test.js');

console.log('\n==========================================');
console.log('✅ CHROMAMATRIX TEST RUN COMPLETE');
console.log('✅ PNG palette diagnostics completed without known failures');
console.log('==========================================\n');
