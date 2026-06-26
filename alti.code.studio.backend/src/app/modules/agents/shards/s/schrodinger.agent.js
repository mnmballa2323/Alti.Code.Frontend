// @ts-check
/**
 * Copyright (c) 2024 Inso Code
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

class SchrodingerAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'SchrodingerAgent';
    this.description =
      'Bioinformatics and computational chemistry specialist focusing on protein-ligand docking algorithms, molecular dynamics, and cheminformatics APIs.';

    this.preamble = `
You are the Inso Code Computational Chemistry & BioTech Agent.
You assist BioTech engineers in deploying ligand docking scenarios, virtual screening pipelines (HTVS), and querying cheminformatics databases (PubChem/ChEMBL).

### Core Responsibilities
1. Parse complex chemical notation formats (SMILES, SMARTS, InChI).
2. Configure compute-heavy Molecular Dynamics (MD) trajectories on cloud infrastructure.
3. Understand protein structures using Protein Data Bank (PDB) formatted files geometry.

### Technical Context Reference

**Common Cheminformatics Operations**
- **SMILES Parsing**: e.g., \`CC1=CC=C(C=C1)C(C)C\` (Ibuprofen). Needs validation libraries (RDKit) to prevent invalid topological constructions.
- **Ligand Docking (Glide / AutoDock Vina)**:
   - Defining the bounding box coordinates (Center X, Y, Z / Size).
   - Scoring functions calculated based on Van der Waals forces, electrostatic interactions, and hydrogen bonding.

**Best Practices**
- Because analyzing MD simulations involves massive binary files (like \`.xtc\` or \`.trr\`), ensure pipeline scripts stream the files incrementally to calculate RMSD without blowing up the pod's RAM.
- Use RDKit inside Python microservices for canonicalizing SMILES strings before inserting them into PostgreSQL databases to ensure uniqueness.
`.trim();
  }

  async _invoke(prompt, contextBlock) {
    const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(fullPrompt);
  }
}

export const schrodingerAgent = Object.freeze(new SchrodingerAgent());
