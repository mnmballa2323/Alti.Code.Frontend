import { logger } from '../../../shared/logger.js';

class CostGateService {
  constructor() {
    this.runningCost = 0;
    this.budgetCeiling = 10.0; // Daily default budget $10.00
    // Price per character approximation (approx 4 characters per token)
    this.inputRatePerChar = 0.00000375; // $15 / 1M tokens -> $0.000015 / token -> $0.00000375 / char
    this.outputRatePerChar = 0.00001875; // $75 / 1M tokens -> $0.000075 / token -> $0.00001875 / char
  }

  /**
   * Set a custom budget ceiling for the sprint/session.
   * @param {number} ceiling - Cost ceiling in USD
   */
  setBudgetCeiling(ceiling) {
    this.budgetCeiling = ceiling;
    logger.info(
      `💰 CostGate: Custom budget ceiling updated to: $${ceiling.toFixed(2)}`,
    );
  }

  /**
   * Checks if executing the prompt would violate the budget ceiling.
   * Throws an error if budget would be exceeded.
   * @param {string} promptText - The prompt being evaluated
   */
  checkBudget(promptText) {
    const estimatedCost = (promptText || '').length * this.inputRatePerChar;
    const potentialTotal = this.runningCost + estimatedCost;

    if (potentialTotal >= this.budgetCeiling) {
      const errorMsg = `CostGate: Operation BLOCKED. Budget ceiling of $${this.budgetCeiling.toFixed(2)} reached. Current cost: $${this.runningCost.toFixed(4)}, Estimated addition: $${estimatedCost.toFixed(4)}`;
      logger.error(`💰 ${errorMsg}`);
      throw new Error(errorMsg);
    }

    logger.debug(
      `CostGate: Budget check passed. Estimated potential cost: $${potentialTotal.toFixed(4)}`,
    );
  }

  /**
   * Records the actual transaction cost of an LLM query and updates the running total.
   * @param {string} promptText - Sent prompt text
   * @param {string} responseText - Received response text
   * @returns {number} The cost of this query in USD
   */
  recordSessionCost(promptText, responseText) {
    const inputCost = (promptText || '').length * this.inputRatePerChar;
    const outputCost = (responseText || '').length * this.outputRatePerChar;
    const queryCost = inputCost + outputCost;

    this.runningCost += queryCost;
    logger.info(
      `💰 CostGate: Recorded query cost: $${queryCost.toFixed(4)}. Total Session Cost: $${this.runningCost.toFixed(4)}`,
    );

    return queryCost;
  }

  /**
   * Resets the running total.
   */
  resetBudget() {
    this.runningCost = 0;
    logger.info('💰 CostGate: Cost counters reset.');
  }
}

export const costGateService = new CostGateService();
