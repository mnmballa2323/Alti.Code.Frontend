/**
 * ESM Resolver Loader for node:sqlite polyfill.
 * Redirects ESM imports of node:sqlite to our local polyfill.
 */
const polyfillUrl = new URL('./sqlite-polyfill.js', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
    if (specifier === 'node:sqlite') {
        return {
            shortCircuit: true,
            url: polyfillUrl
        };
    }
    return nextResolve(specifier, context);
}
