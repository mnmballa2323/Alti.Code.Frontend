import { Project, ScriptTarget, SyntaxKind } from 'ts-morph';
import { logger } from '../../../shared/logger.js';

class QualityGateService {
  constructor() {
    this.project = new Project({
      compilerOptions: {
        target: ScriptTarget.ESNext,
        allowJs: true,
      },
    });
  }

  /**
   * Calculates the cyclomatic complexity of a given block of code using ts-morph AST structures.
   * @param {string} codeContent - Raw JS/TS code content
   * @returns {number} The complexity score (1 + number of branching decision points)
   */
  calculateComplexity(codeContent) {
    if (!codeContent) return 0;

    try {
      // Load code into a temporary source file
      const sourceFile = this.project.createSourceFile(
        'temp_gate_eval.js',
        codeContent,
        { overwrite: true },
      );
      let decisionPoints = 0;

      sourceFile.forEachDescendant(node => {
        const kind = node.getKind();

        // Check decision/branching kinds
        if (
          kind === SyntaxKind.IfStatement ||
          kind === SyntaxKind.ForStatement ||
          kind === SyntaxKind.ForInStatement ||
          kind === SyntaxKind.ForOfStatement ||
          kind === SyntaxKind.WhileStatement ||
          kind === SyntaxKind.DoStatement ||
          kind === SyntaxKind.CatchClause ||
          kind === SyntaxKind.ConditionalExpression
        ) {
          decisionPoints++;
        }

        // Check logical operations (&&, ||) inside binary expressions
        if (kind === SyntaxKind.BinaryExpression) {
          const operatorText = node.getOperatorToken().getText();
          if (operatorText === '&&' || operatorText === '||') {
            decisionPoints++;
          }
        }
      });

      // Clean up temporary source file
      this.project.removeSourceFile(sourceFile);

      return 1 + decisionPoints;
    } catch (e) {
      logger.error(
        'QualityGate: Failed to analyze code complexity. Falling back to default baseline.',
        e,
      );
      return 1;
    }
  }

  /**
   * Asserts if code complexity complies with target quality standards.
   * @param {string} codeContent - Raw JS/TS code content
   * @param {number} maxAllowedComplexity - Maximum allowed cyclomatic complexity score
   * @returns {Object} Quality gate result ({ passed: boolean, complexity: number })
   */
  validateQuality(codeContent, maxAllowedComplexity = 15) {
    const complexity = this.calculateComplexity(codeContent);
    const passed = complexity <= maxAllowedComplexity;

    logger.info(
      `🛡️ QualityGate: Code complexity is ${complexity} (Max allowed: ${maxAllowedComplexity}). Gate outcome: ${passed ? 'PASSED' : 'FAILED'}`,
    );

    return {
      passed,
      complexity,
    };
  }
}

export const qualityGateService = new QualityGateService();
