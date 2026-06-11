import { describe, it, expect } from 'vitest';
import { tsdocParserService } from './tsdocParser.service.js';

describe('TSDocParserService', () => {
  it('should exist and expose parseComment method', () => {
    expect(tsdocParserService).toBeDefined();
    expect(typeof tsdocParserService.parseComment).toBe('function');
  });

  it('should parse TSDoc standard comments and return structured components', () => {
    const sampleComment = `/**
 * Calculates the total sum.
 * @param a - The first number
 * @param b - The second number
 * @returns The total cost
 */`;

    const parsed = tsdocParserService.parseComment(sampleComment);

    expect(parsed).toBeDefined();
    expect(parsed.summary).toBe('Calculates the total sum.');
    expect(parsed.params.length).toBe(2);
    expect(parsed.params[0].name).toBe('a');
    expect(parsed.params[0].description).toBe('The first number');
    expect(parsed.params[1].name).toBe('b');
    expect(parsed.params[1].description).toBe('The second number');
    expect(parsed.returns).toBe('The total cost');
  });
});
