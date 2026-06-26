import { describe, it, expect, beforeEach } from 'vitest';
import { astGraphService } from './ast_graph.service.js';
import path from 'path';
import fs from 'fs';

describe('AstGraphService Tests', () => {
  const tempDir = path.resolve('./src/app/modules/ast/temp_test');

  beforeEach(() => {
    // Reset the service state
    astGraphService.isGraphBuilt = false;
    astGraphService.callersMap.clear();
    astGraphService.definitionsMap.clear();
    astGraphService.inheritanceMap.clear();

    // Create temporary directory and test files
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up temporary files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should build AST graph, resolve definitions, callers, and class inheritance', () => {
    const classFileContent = `
            export class Animal {
                makeSound() {
                    console.log("some sound");
                }
            }

            export class Dog extends Animal {
                makeSound() {
                    console.log("bark");
                }
            }
        `;

    const helperFileContent = `
            import { Dog } from './classFile.js';

            export function runHelper() {
                const dog = new Dog();
                dog.makeSound();
            }
        `;

    const mainFileContent = `
            import { runHelper } from './helperFile.js';

            function main() {
                runHelper();
            }
        `;

    fs.writeFileSync(path.join(tempDir, 'classFile.js'), classFileContent);
    fs.writeFileSync(path.join(tempDir, 'helperFile.js'), helperFileContent);
    fs.writeFileSync(path.join(tempDir, 'mainFile.js'), mainFileContent);

    // Build the graph
    astGraphService.buildGraph(tempDir);

    expect(astGraphService.isGraphBuilt).toBe(true);

    // 1. Test Definition Resolving
    const animalDef = astGraphService.getDefinition('Animal');
    expect(animalDef).not.toBeNull();
    expect(animalDef.kind).toBe('Class');
    expect(animalDef.file).toContain('classFile.js');

    const helperDef = astGraphService.getDefinition('runHelper');
    expect(helperDef).not.toBeNull();
    expect(helperDef.kind).toBe('Function');

    // 2. Test Callers Mapping
    const runHelperCallers = astGraphService.findCallers('runHelper');
    expect(runHelperCallers.length).toBe(1);
    expect(runHelperCallers[0].file).toContain('mainFile.js');
    expect(runHelperCallers[0].text).toBe('runHelper()');

    const makeSoundCallers = astGraphService.findCallers('makeSound');
    expect(makeSoundCallers.length).toBe(1);
    expect(makeSoundCallers[0].file).toContain('helperFile.js');
    expect(makeSoundCallers[0].text).toBe('dog.makeSound()');

    // 3. Test Inheritance Tracing
    const animalInheritance = astGraphService.getInheritance('Animal');
    expect(animalInheritance).not.toBeNull();
    expect(animalInheritance.extendsClass).toBeNull();
    expect(animalInheritance.subclasses).toContain('Dog');

    const dogInheritance = astGraphService.getInheritance('Dog');
    expect(dogInheritance).not.toBeNull();
    expect(dogInheritance.extendsClass).toBe('Animal');
  });
});
