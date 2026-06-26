/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Painter" - UI/UX & Design Agent
 * Responsible for generating premium React components, verifying design compliance,
 * and creating visual documentation (Storybook).
 */
import fs from 'fs/promises';
import path from 'path';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

class PainterAgent {
  constructor() {
    this.projectRoot = process.cwd();
    // Assuming frontend is in a sibling directory or sub-folder
    // Adjusting path to point to the frontend repo if possible, or keeping it abstract.
    // For this workspace, it seems `alti.code.studio.frontend` is a sibling.
    this.frontendRoot = path.resolve(
      this.projectRoot,
      '../alti.code.studio.frontend',
    );
  }

  /**
   * Paint (Generate) a React Component
   * @param {string} description - Description of the component
   * @param {string} styleGuide - Optional style notes
   */
  async paintComponent(
    description,
    styleGuide = 'Use TailwindCSS, Glassmorphism, Modern/Premium aesthetic.',
  ) {
    logger.info(`🎨 Painter: Painting component matching "${description}"...`);

    const prompt = `
        You are "The Painter", a World-Class UI/UX Designer and Frontend Engineer.
        
        TASK:
        Create a React Functional Component (TypeScript preferred if project uses it, otherwise JSX) based on this description:
        "${description}"
        
        STYLE GUIDE:
        ${styleGuide}

        REQUIREMENTS:
        1. Use 'framer-motion' for animations if appropriate.
        2. Use 'lucide-react' for icons.
        3. Ensure responsive design (mobile-first).
        4. Return ONLY the code for the component file.
        5. Name the component based on the description (PascalCase).
        `;

    try {
      const response = await aiProvider.generate(prompt);
      const componentCode = response
        .replace(/^```(tsx|jsx|javascript|typescript|js|ts)?|```$/g, '')
        .trim();

      // Extract Component Name to save file
      const nameMatch = componentCode.match(
        /export (const|default function) ([A-Z][a-zA-Z0-9]+)/,
      );
      const componentName = nameMatch ? nameMatch[2] : 'GeneratedComponent';
      const filename = `${componentName}.tsx`; // Defaulting to TSX as user has .tsx files

      // Definition of where to save - normally would be dynamic
      const savePath = path.join(
        this.frontendRoot,
        'components',
        'generated',
        filename,
      );

      // Ensure directory exists
      await fs.mkdir(path.dirname(savePath), { recursive: true });
      await fs.writeFile(savePath, componentCode);

      logger.info(`✅ Painter: Created component at ${savePath}`);
      return { componentName, filePath: savePath, code: componentCode };
    } catch (error) {
      logger.error('Painter: Failed to paint component', error);
      throw error;
    }
  }

  /**
   * Generate a Storybook story for a component
   * @param {string} componentPath
   */
  async generateStory(componentPath) {
    // Implementation for Storybook generation
    // Reading component content -> generating .stories.tsx
    return { message: 'Story generation not fully implemented yet.' };
  }
}

export const painterAgent = new PainterAgent();
