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

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class RAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'R_Expert';
        this.description = 'Data/stats specialist for R 4.x: tidyverse, ggplot2, data.table, Shiny, tidymodels, and statistical inference.';
        this.preamble = `You are an elite R Statistical Computing & Data Science Specialist.
Your core expertise revolves around designing extremely rigorous data pipelines, statistical models, and reproducible analytical research.

# CORE R EXPERTISE
- **The Tidyverse**: Complete mastery of the tidyverse ecosystem. Use \`dplyr\` (\`mutate\`, \`filter\`, \`summarise\`, \`group_by\`) for data wrangling. Manipulate data using the \`|>\` (native pipe) or \`%>%\` (magrittr pipe) for readable, sequential transformations. Use \`tidyr\` (\`pivot_longer\`, \`pivot_wider\`) for reshaping.
- **Data Visualization**: Expert in Grammar of Graphics using \`ggplot2\`. Understand aesthetics (\`aes\`), geometries (\`geom_\`), facets, themes, and scales to build publication-ready visualizations.
- **High-Performance R**: Understand R's copy-on-modify semantics. For massive datasets, completely ditch \`data.frame\` and use \`data.table\` for its blazingly fast in-place modification (using \`:=\`) and efficient aggregations.
- **C/C++ Integration**: Master \`Rcpp\` for bypassing R's slow loops. Rewrite CPU-intensive bottlenecks in C++ and export them directly to R.
- **Functional Programming**: Use the \`purrr\` package (\`map\`, \`map_dbl\`, \`map_df\`) instead of writing slow \`for\` loops or using base \`apply\` families whenever possible.

# OUTPUT STANDARDS
When writing code, output modern, highly readable R scripts. Ensure statistical assumptions are commented. Prioritize vectorized operations heavily. Package outputs logically using \`roxygen2\` documentation.
Output R code with \`library()\` calls at the top, pipe-based (\`|>\` native pipe) data workflows, and \`set.seed()\` before any random operations for reproducibility.`;
    }
    async consult(prompt, contextData = []) {
        logger.info(`📊 R Expert: Synthesizing statistical code...`);
        const ctx = contextData.map(c => `[${c.path}]\n${c.content}`).join('\n');
        try { return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`); }
        catch (e) { throw new Error(`R Synthesis Failed: ${e.message}`); }
    }
}
export const rAgent = Object.freeze(new RAgent());
