/**
 * "The Vision-to-UI Agent" — Screenshot → Component Code — v6.0.0
 *
 * Converts screenshots, wireframes, or Figma-exported images into production
 * React (Next.js), SwiftUI, or Jetpack Compose code.
 *
 * Pipeline:
 *   1. Accept image (base64, URL, or file path)
 *   2. Gemini Vision multimodal analysis → structured requirements JSON
 *   3. Component generation from requirements → production code
 *   4. Accessibility audit of generated code
 *   5. Optional: Figma Dev Mode API extraction for exact measurements
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

export class VisionToUIAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Vision_To_UI_Agent';
        this.description = 'v6.0.0: Convert screenshots/wireframes → structured requirements → production React/SwiftUI/Compose code via Gemini Vision multimodal analysis.';

        this.preamble = `
You are an elite UI/UX engineer and code architect specializing in converting visual designs into production-ready component code.

CAPABILITIES:
- Analyze screenshots, wireframes, hand-drawn mockups via multimodal vision
- Extract precise layout, color, typography, spacing, interaction patterns
- Generate production React (Next.js + TypeScript + Tailwind or CSS Modules)
- Generate SwiftUI for iOS/macOS
- Generate Jetpack Compose for Android
- Perform WCAG 2.1 AA accessibility audit on generated code
- Integrate with Figma Dev Mode API for exact design tokens

VISION ANALYSIS — what to extract from screenshots:
  Layout:
  - Grid structure (columns, rows, spacing)
  - Component hierarchy (container → card → text + icon)
  - Responsive breakpoints (mobile/tablet/desktop differences visible)
  - Alignment (left/center/right, flexbox or grid pattern)
  
  Visual Design:
  - Color palette (primary, secondary, background, surface, text colors)
  - Border radius values (sharp/rounded/pill)
  - Shadow depth (flat/subtle/elevated)
  - Typography scale (heading sizes, body, caption)
  - Dark/light mode indicator
  
  Components Identified:
  - Navigation (sidebar/top nav/tab bar/breadcrumb)
  - Hero sections, cards, tables, forms, modals, drawers
  - Buttons (primary/secondary/ghost/icon), badges, tags
  - State indicators (loading, empty, error states — if visible)
  
  Interactions (inferred):
  - Hover states (buttons, cards, table rows)
  - Form validation patterns
  - Infinite scroll vs pagination
  - Toast notifications, tooltips

REACT COMPONENT GENERATION STANDARDS:
  - TypeScript with strict types (no 'any')
  - Named exports only ("use client" for interactive components)
  - CSS: Vanilla CSS modules (ComponentName.module.css) or inline styles
  - Props interface documented with JSDoc
  - ARIA attributes: role, aria-label, aria-describedby
  - Keyboard navigation: tabIndex, onKeyDown handlers
  - Error boundary compatible
  - Example structure:
  
  interface CardProps {
    /** Display title text */
    title: string;
    /** Optional subtitle */
    subtitle?: string;
    /** Click handler */
    onClick?: () => void;
  }
  
  export function Card({ title, subtitle, onClick }: CardProps) {
    return (
      <article className={styles.card} onClick={onClick} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onClick?.()}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </article>
    );
  }

SWIFTUI GENERATION STANDARDS:
  - iOS 16+ minimum
  - Use @StateObject / @ObservableObject for state
  - Prefer .frame() with geometry reader over hardcoded sizes
  - Dark/light mode via .colorScheme environment
  - Dynamic Type support: .font(.headline), not .font(.system(size: 17))
  - Accessibility: .accessibilityLabel(), .accessibilityHint()

JETPACK COMPOSE STANDARDS:
  - Material 3 components (MaterialTheme.colorScheme)
  - Remember {}: mutableStateOf for local state
  - LaunchedEffect for side effects
  - Modifier chaining: .fillMaxWidth().padding(16.dp)
  - Semantics block for accessibility

FIGMA DEV MODE API:
  # Get design file data
  GET https://api.figma.com/v1/files/{file_key}
  Headers: X-Figma-Token: $FIGMA_ACCESS_TOKEN
  
  # Get specific node with measurements
  GET https://api.figma.com/v1/files/{file_key}/nodes?ids={node_id}
  Returns: { absoluteBoundingBox, fills (colors), effects (shadows), cornerRadius,
             strokes, opacity, type: FRAME|COMPONENT|VECTOR|TEXT }
  
  # Get CSS for a node
  GET https://api.figma.com/v1/files/{file_key}/nodes?ids={id}&plugin_data=shared
  
  # Export node as SVG / PNG
  GET https://api.figma.com/v1/images/{file_key}?ids={node_id}&format=svg&scale=2

ACCESSIBILITY CHECKLIST (WCAG 2.1 AA):
  - Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
  - All images have alt text or aria-hidden="true" if decorative
  - Focus indicators visible (outline: 2px solid #0066CC)
  - Form inputs have associated <label>
  - Error messages are programmatically associated (aria-describedby)
  - No keyboard traps
  - Touch targets ≥ 44×44px (mobile)

OUTPUT: Complete, production-ready component code. Include imports, types, exports. No placeholder comments — every section must be implemented.`.trim();
    }

    /**
     * Main pipeline: image → requirements → code
     *
     * @param {object} opts
     * @param {string} [opts.imageBase64]  - Base64 encoded image (with or without data URI prefix)
     * @param {string} [opts.imageUrl]     - Public URL to screenshot/wireframe
     * @param {string} [opts.imagePath]    - Absolute local file path to image
     * @param {string} [opts.targetFramework] - 'react' | 'swiftui' | 'compose' (default: 'react')
     * @param {string} [opts.componentName]   - Override component name
     * @param {string} [opts.extraContext]    - Additional design/branding context
     * @returns {Promise<{requirements, code, accessibility, componentName}>}
     */
    async generateFromImage(opts = {}) {
        const {
            imageBase64,
            imageUrl,
            imagePath,
            targetFramework = 'react',
            componentName = 'GeneratedComponent',
            extraContext = '',
        } = opts;

        if (!imageBase64 && !imageUrl && !imagePath) {
            throw new Error('VisionToUIAgent: Provide imageBase64, imageUrl, or imagePath.');
        }

        logger.info(`👁️ VisionToUI: Analyzing image for ${targetFramework} output → ${componentName}`);

        // Resolve image to base64 if path given
        let resolvedBase64 = imageBase64;
        if (!resolvedBase64 && imagePath) {
            const buffer = await fs.readFile(imagePath);
            resolvedBase64 = buffer.toString('base64');
        }

        // Phase 1: Vision analysis → structured requirements
        const requirements = await this._analyzeImage(resolvedBase64, imageUrl, extraContext);
        logger.info(`📐 VisionToUI: Requirements extracted — ${requirements.components?.length ?? 0} components identified`);

        // Phase 2: Generate component code
        const code = await this._generateCode(requirements, targetFramework, componentName);
        logger.info(`💻 VisionToUI: Code generated — ${code.length} chars`);

        // Phase 3: Accessibility audit
        const accessibility = await this._auditAccessibility(code, targetFramework);
        logger.info(`♿ VisionToUI: Accessibility audit — ${accessibility.wcagLevel} (${accessibility.score}/100)`);

        return { componentName, targetFramework, requirements, code, accessibility };
    }

    /**
     * Use Gemini Vision to analyze the screenshot and produce structured requirements.
     */
    async _analyzeImage(imageBase64, imageUrl, extraContext) {
        const visionPrompt = `
${this.preamble}

TASK: Analyze this UI screenshot/wireframe and extract detailed structured requirements.
${extraContext ? `Additional context: ${extraContext}` : ''}

Return ONLY this JSON (no markdown):
{
  "screenTitle": "...",
  "layoutPattern": "sidebar-main | top-nav | card-grid | single-column | split-panel",
  "colorPalette": { "primary": "#...", "background": "#...", "surface": "#...", "text": "#..." },
  "typography": { "headingFont": "...", "bodySize": "...", "scale": "..." },
  "components": [
    { "type": "navbar|sidebar|card|table|form|button|modal|hero|footer", "description": "...", "props": [...], "hasInteraction": true }
  ],
  "spacing": { "baseUnit": "4px|8px|12px", "containerPadding": "...", "gapBetweenItems": "..." },
  "borderRadius": "none|small|medium|large|pill",
  "darkMode": true,
  "responsiveBreakpoints": ["mobile", "tablet", "desktop"],
  "accessibility": { "observedIssues": [...] },
  "implementationNotes": "..."
}`.trim();

        if (imageBase64 || imageUrl) {
            // Use Gemini multimodal vision
            return await GeminiAiService.generateWithImage({
                prompt: visionPrompt,
                imageBase64,
                imageUrl,
                mimeType: 'image/png',
            }).then(raw => {
                try {
                    const cleaned = raw.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim();
                    return JSON.parse(cleaned);
                } catch {
                    return { screenTitle: 'Unknown', components: [], implementationNotes: raw };
                }
            }).catch(async () => {
                // Fallback: text-only analysis
                return this._analyzeByDescription(visionPrompt);
            });
        }

        return this._analyzeByDescription(visionPrompt);
    }

    async _analyzeByDescription(prompt) {
        const raw = await GeminiAiService.generateContent(prompt + '\n\nNote: No image provided. Generate a reasonable default structure.');
        try {
            const cleaned = raw.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim();
            return JSON.parse(cleaned);
        } catch {
            return { screenTitle: 'Component', components: [], implementationNotes: 'Analysis failed — generate generic component.' };
        }
    }

    /**
     * Generate component code from structured requirements.
     */
    async _generateCode(requirements, targetFramework, componentName) {
        const frameworkInstructions = {
            react: 'TypeScript + React 18 + Next.js App Router ("use client" if needed). Use CSS Modules. Strict types. Named export.',
            swiftui: 'Swift 5.9 + SwiftUI. iOS 16+. Dynamic Type. Dark mode support. @StateObject for state.',
            compose: 'Kotlin + Jetpack Compose + Material 3. LaunchedEffect for effects. Accessibility semantics.',
        };

        const codePrompt = `
${this.preamble}

Generate production ${frameworkInstructions[targetFramework] || frameworkInstructions.react} code for component: "${componentName}"

Design requirements extracted from screenshot:
${JSON.stringify(requirements, null, 2)}

Rules:
- Complete, runnable code — NO placeholder comments like "// TODO" or "// implement this"
- Include ALL imports
- Type-safe (TypeScript) or strongly-typed (Swift/Kotlin)
- Include responsive CSS/layout
- ARIA/accessibility attributes included
- Return ONLY the final code, no markdown fences`.trim();

        return GeminiAiService.generateContent(codePrompt);
    }

    /**
     * Audit generated code for WCAG 2.1 AA accessibility issues.
     */
    async _auditAccessibility(code, targetFramework) {
        const auditPrompt = `
Perform a WCAG 2.1 AA accessibility audit on this ${targetFramework} component code.

Code:
${code.substring(0, 3000)}

Return JSON (no markdown):
{
  "wcagLevel": "AA|A|fail",
  "score": 0-100,
  "passedChecks": [...],
  "failedChecks": [{ "criterion": "1.4.3 Contrast", "issue": "...", "fix": "..." }],
  "recommendations": [...]
}`.trim();

        try {
            const raw = await GeminiAiService.generateContent(auditPrompt);
            const cleaned = raw.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim();
            return JSON.parse(cleaned);
        } catch {
            return { wcagLevel: 'unknown', score: 70, passedChecks: [], failedChecks: [], recommendations: [] };
        }
    }

    async _invoke(prompt, contextBlock) {
        const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== VISION-TO-UI REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(finalPrompt);
    }
}

export const visionToUIAgent = new VisionToUIAgent();
