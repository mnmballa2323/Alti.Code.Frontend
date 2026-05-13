// Polyfill self for UMD bundles like tink-crypto in Node.js
if (typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis;
}
