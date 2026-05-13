import compilerPackage from 'google-closure-compiler';
import { logger } from '../../../shared/logger.js';
import { sentinelService } from '../security/sentinel.service.js';

const { compiler: ClosureCompiler } = compilerPackage;

/**
 * Google Closure Compiler (Apache 2.0) Autonomous Optimization Service.
 * Leverages Google's legendary Closure Compiler to statically analyze, parse, 
 * aggressively optimize, and minify JavaScript code synthesized by the Gemini Swarm.
 */
class GoogleClosureService {
    /**
     * Executes the Google Closure Compiler on dynamically generated code.
     * @param {string} sourceCode - The raw JavaScript code synthesized by the AI.
     * @returns {Promise<string>} The highly optimized, minified JavaScript.
     */
    async optimizeCode(sourceCode) {
        logger.info(`⚙️ [Closure] Initiating Google Closure Compiler optimization sequence...`);

        return new Promise((resolve, reject) => {
            // Google Closure Compiler configuration for safe, advanced optimization
            const compiler = new ClosureCompiler({
                compilation_level: 'SIMPLE_OPTIMIZATIONS',
                env: 'BROWSER',
                language_in: 'ECMASCRIPT_NEXT',
                language_out: 'ECMASCRIPT_2022',
                warning_level: 'QUIET',
                formatting: 'PRETTY_PRINT'
            });

            const compilerProcess = compiler.run((exitCode, stdOut, stdErr) => {
                if (exitCode === 0) {
                    const savings = sourceCode.length - stdOut.length;
                    logger.info(`✅ [Closure] Optimization successful. Saved ${savings} bytes.`);
                    resolve(stdOut);
                } else {
                    logger.warn(`⚠️ [Closure] Compilation failed. Attempting graceful degradation.`);
                    // Report to Sentinel to track AI code generation hallucinations
                    sentinelService.reportEvent('CLOSURE_COMPILATION_ERROR', 'MEDIUM', {
                        stderr: stdErr.substring(0, 500)
                    });
                    
                    // Fallback to the original un-compiled code if it fails syntax validation
                    resolve(sourceCode);
                }
            });

            // Write the raw synthesized code to the Closure Compiler's stdin stream
            compilerProcess.stdin.write(sourceCode);
            compilerProcess.stdin.end();
        });
    }
}

export const closureService = new GoogleClosureService();
