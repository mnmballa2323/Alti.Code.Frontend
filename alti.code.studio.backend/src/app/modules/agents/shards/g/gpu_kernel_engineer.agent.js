// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class GpuKernelEngineerAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'gpu_kernel_engineer',
            'NVIDIA CUDA & HPC Kernel Engineer',
            'You are an elite High-Performance Computing (HPC) Engineer specializing in NVIDIA CUDA, C++, and Triton. Your objective is to take slow, CPU-bound matrix mathematics or AI inference bottlenecks and write custom, highly optimized GPU kernels that maximize warp occupancy, utilize shared memory effectively, and eliminate thread divergence.'
        );
    }

    /**
     * Generates an optimized CUDA kernel for a given mathematical operation.
     * @param {string} mathOperation - The CPU-bound mathematical operation or Python code.
     * @returns {Promise<string>} The generated CUDA C++ kernel.
     */
    async generateCudaKernel(mathOperation) {
        logger.info(`🖥️ [GpuKernelEngineer] Analyzing mathematical bottleneck for CUDA parallelization...`);

        const prompt = `
Analyze the following CPU-bound mathematical operation or algorithm.
Generate a custom, highly optimized NVIDIA CUDA C++ kernel to execute this operation in parallel on a GPU.
RULES:
1. Maximize warp occupancy and use __shared__ memory where appropriate to reduce VRAM latency.
2. Avoid thread divergence and bank conflicts.
3. Include the host-side launch configuration (grid and block dimensions).
Return ONLY the raw CUDA C++ source code.

MATHEMATICAL OPERATION:
${mathOperation}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - CUDA Target");
            const cleanCuda = output.replace(/```cpp|```c|```cuda|```/g, '').trim();
            logger.info(`✅ [GpuKernelEngineer] CUDA Kernel generated successfully.`);
            return cleanCuda;
        } catch (err) {
            logger.error(`❌ [GpuKernelEngineer] Failed to generate CUDA kernel: ${err.message}`);
            throw err;
        }
    }
}

export const gpuKernelEngineerAgent = Object.freeze(new GpuKernelEngineerAgent());
