import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml, createAgentFromDefinition } from './yaml_agent_loader.js';
import { agenticRouter } from './agentic_router.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');
const SECTORS_DIR = path.join(DEFINITIONS_DIR, 'sectors');

describe('Modular Economic Sectors Declarative Agents & Swarm Router Integration', () => {
  describe('Recursive Declarative YAML Parsing & Ingestion', () => {
    it('should successfully parse and load both Finance & Fintech agents', async () => {
      const bankingPath = path.join(
        SECTORS_DIR,
        'finance',
        'fin.banking.agent.yaml',
      );
      const insurancePath = path.join(
        SECTORS_DIR,
        'finance',
        'fin.insurance.agent.yaml',
      );

      const bankingDef = parseYaml(await fs.readFile(bankingPath, 'utf8'));
      const insuranceDef = parseYaml(await fs.readFile(insurancePath, 'utf8'));

      expect(bankingDef.id).toBe('agent.sector.finance.commercial_banking');
      expect(bankingDef.name).toBe(
        'Global Investment & Commercial Banking Swarm Specialist',
      );
      expect(bankingDef.capabilities).toContain('iso_20022');

      expect(insuranceDef.id).toBe(
        'agent.sector.finance.actuarial_underwriting',
      );
      expect(insuranceDef.name).toBe(
        'Premium Actuarial Underwriting & Insurance Risk Modeler',
      );
      expect(insuranceDef.capabilities).toContain('solvency_ii');
    });

    it('should successfully parse and load both Healthcare & Life Sciences agents', async () => {
      const diagnosticsPath = path.join(
        SECTORS_DIR,
        'healthcare',
        'hc.diagnostics.agent.yaml',
      );
      const pharmaPath = path.join(
        SECTORS_DIR,
        'healthcare',
        'hc.pharma.agent.yaml',
      );

      const diagnosticsDef = parseYaml(
        await fs.readFile(diagnosticsPath, 'utf8'),
      );
      const pharmaDef = parseYaml(await fs.readFile(pharmaPath, 'utf8'));

      expect(diagnosticsDef.id).toBe(
        'agent.sector.healthcare.clinical_diagnostics',
      );
      expect(diagnosticsDef.name).toBe(
        'Clinical Diagnostics & Medical Imaging AI Coordinator',
      );
      expect(diagnosticsDef.capabilities).toContain('dicom_imaging');

      expect(pharmaDef.id).toBe(
        'agent.sector.healthcare.bioinformatics_pharma',
      );
      expect(pharmaDef.name).toBe(
        'Bioinformatics Genomic Assembly & Biopharma Specialist',
      );
      expect(pharmaDef.capabilities).toContain('crispr_offtarget');
    });

    it('should successfully parse and load both Energy & Utilities agents', async () => {
      const gridPath = path.join(
        SECTORS_DIR,
        'energy',
        'energy.grid.agent.yaml',
      );
      const nuclearPath = path.join(
        SECTORS_DIR,
        'energy',
        'energy.nuclear.agent.yaml',
      );

      const gridDef = parseYaml(await fs.readFile(gridPath, 'utf8'));
      const nuclearDef = parseYaml(await fs.readFile(nuclearPath, 'utf8'));

      expect(gridDef.id).toBe('agent.sector.energy.renewable_grid');
      expect(gridDef.name).toBe(
        'Smart Renewable Grid Optimization & Load Balancing Auditor',
      );
      expect(gridDef.capabilities).toContain('grid_load_balancing');

      expect(nuclearDef.id).toBe('agent.sector.energy.nuclear_scada');
      expect(nuclearDef.name).toBe(
        'Nuclear Reactor Instrumentation & SCADA Safety Inspector',
      );
      expect(nuclearDef.capabilities).toContain('scada_security');
    });

    it('should successfully parse and load both Manufacturing & Industrial agents', async () => {
      const roboticsPath = path.join(
        SECTORS_DIR,
        'industrial',
        'ind.robotics.agent.yaml',
      );
      const mesPath = path.join(
        SECTORS_DIR,
        'industrial',
        'ind.mes.agent.yaml',
      );

      const roboticsDef = parseYaml(await fs.readFile(roboticsPath, 'utf8'));
      const mesDef = parseYaml(await fs.readFile(mesPath, 'utf8'));

      expect(roboticsDef.id).toBe(
        'agent.sector.industrial.automotive_robotics',
      );
      expect(roboticsDef.name).toBe(
        'Automotive Assembly Line Robotics & PLC Coordinator',
      );
      expect(roboticsDef.capabilities).toContain('robotic_kinematics');

      expect(mesDef.id).toBe('agent.sector.industrial.supply_chain_mes');
      expect(mesDef.name).toBe(
        'Manufacturing Execution System (MES) & Supply Chain Planner',
      );
      expect(mesDef.capabilities).toContain('shop_floor_mes');
    });

    it('should successfully parse and load both Retail & E-commerce agents', async () => {
      const pricingPath = path.join(
        SECTORS_DIR,
        'retail',
        'ret.pricing.agent.yaml',
      );
      const crmPath = path.join(SECTORS_DIR, 'retail', 'ret.crm.agent.yaml');

      const pricingDef = parseYaml(await fs.readFile(pricingPath, 'utf8'));
      const crmDef = parseYaml(await fs.readFile(crmPath, 'utf8'));

      expect(pricingDef.id).toBe('agent.sector.retail.dynamic_pricing');
      expect(pricingDef.name).toBe(
        'Omnichannel Dynamic Pricing & Elasticity Arbitrage Specialist',
      );
      expect(pricingDef.capabilities).toContain('price_elasticity');

      expect(crmDef.id).toBe('agent.sector.retail.customer_retention');
      expect(crmDef.name).toBe(
        'Hyper-Personalized Retail CRM & Retention Conductor',
      );
      expect(crmDef.capabilities).toContain('customer_clv_score');
    });

    it('should successfully parse and load both Transportation & Logistics agents', async () => {
      const freightPath = path.join(
        SECTORS_DIR,
        'transport',
        'trans.freight.agent.yaml',
      );
      const fleetPath = path.join(
        SECTORS_DIR,
        'transport',
        'trans.fleet.agent.yaml',
      );

      const freightDef = parseYaml(await fs.readFile(freightPath, 'utf8'));
      const fleetDef = parseYaml(await fs.readFile(fleetPath, 'utf8'));

      expect(freightDef.id).toBe('agent.sector.transport.global_freight');
      expect(freightDef.name).toBe(
        'Intermodal Global Freight & Maritime Routing Conductor',
      );
      expect(freightDef.capabilities).toContain('ocean_freight_routing');

      expect(fleetDef.id).toBe('agent.sector.transport.autonomous_fleet');
      expect(fleetDef.name).toBe(
        'Autonomous Drone & Delivery Fleet Coordinator',
      );
      expect(fleetDef.capabilities).toContain('vrptw_fleet_opt');
    });

    it('should successfully parse and load both Agriculture & AgTech agents', async () => {
      const agronomyPath = path.join(
        SECTORS_DIR,
        'agriculture',
        'ag.agronomy.agent.yaml',
      );
      const marketPath = path.join(
        SECTORS_DIR,
        'agriculture',
        'ag.market.agent.yaml',
      );

      const agronomyDef = parseYaml(await fs.readFile(agronomyPath, 'utf8'));
      const marketDef = parseYaml(await fs.readFile(marketPath, 'utf8'));

      expect(agronomyDef.id).toBe('agent.sector.agriculture.precision_farming');
      expect(agronomyDef.name).toBe(
        'Precision Soil Agronomy & Variable Rate Irrigation Specialist',
      );
      expect(agronomyDef.capabilities).toContain('smart_irrigation_et');

      expect(marketDef.id).toBe('agent.sector.agriculture.crop_forecasting');
      expect(marketDef.name).toBe(
        'Macro Crop Yield Forecasting & Market Hedging Specialist',
      );
      expect(marketDef.capabilities).toContain('cbot_commodity_hedging');
    });

    it('should successfully parse and load both Technology & Media agents', async () => {
      const slicePath = path.join(
        SECTORS_DIR,
        'tech_media',
        'tech.slice.agent.yaml',
      );
      const metaversePath = path.join(
        SECTORS_DIR,
        'tech_media',
        'tech.metaverse.agent.yaml',
      );

      const sliceDef = parseYaml(await fs.readFile(slicePath, 'utf8'));
      const metaverseDef = parseYaml(await fs.readFile(metaversePath, 'utf8'));

      expect(sliceDef.id).toBe('agent.sector.tech_media.telecom_network');
      expect(sliceDef.name).toBe(
        'Next-Gen 5G/6G Network Slice & Edge Compute Architect',
      );
      expect(sliceDef.capabilities).toContain('5g_6g_network_slicing');

      expect(metaverseDef.id).toBe('agent.sector.tech_media.spatial_metaverse');
      expect(metaverseDef.name).toBe(
        'Spatial Computing & High-Fidelity Metaverse Specialist',
      );
      expect(metaverseDef.capabilities).toContain('webgl_threejs_rendering');
    });

    it('should successfully parse and load both Education & EdTech agents', async () => {
      const curriculumPath = path.join(
        SECTORS_DIR,
        'education',
        'edu.curriculum.agent.yaml',
      );
      const proctorPath = path.join(
        SECTORS_DIR,
        'education',
        'edu.proctor.agent.yaml',
      );

      const curriculumDef = parseYaml(
        await fs.readFile(curriculumPath, 'utf8'),
      );
      const proctorDef = parseYaml(await fs.readFile(proctorPath, 'utf8'));

      expect(curriculumDef.id).toBe(
        'agent.sector.education.personalized_curriculum',
      );
      expect(curriculumDef.name).toBe(
        'Adaptive Curriculum Pathing & EdTech Analytics Architect',
      );
      expect(curriculumDef.capabilities).toContain('adaptive_learning_graph');

      expect(proctorDef.id).toBe('agent.sector.education.proctor_integrity');
      expect(proctorDef.name).toBe(
        'Remote Proctoring & Academic Integrity Security Guard',
      );
      expect(proctorDef.capabilities).toContain('gaze_anomaly_detection');
    });

    it('should successfully parse and load both Government & Public Sector agents', async () => {
      const urbanPath = path.join(
        SECTORS_DIR,
        'government',
        'gov.urban.agent.yaml',
      );
      const disasterPath = path.join(
        SECTORS_DIR,
        'government',
        'gov.disaster.agent.yaml',
      );

      const urbanDef = parseYaml(await fs.readFile(urbanPath, 'utf8'));
      const disasterDef = parseYaml(await fs.readFile(disasterPath, 'utf8'));

      expect(urbanDef.id).toBe('agent.sector.government.smart_urban');
      expect(urbanDef.name).toBe(
        'Smart Urban Municipal Infrastructure & Traffic Engineer',
      );
      expect(urbanDef.capabilities).toContain('traffic_signal_opt');

      expect(disasterDef.id).toBe('agent.sector.government.disaster_fema');
      expect(disasterDef.name).toBe(
        'Disaster Preparedness & FEMA Emergency Relief Specialist',
      );
      expect(disasterDef.capabilities).toContain('emergency_logistics');
    });
  });

  describe('Precision Swarm Routing for All 10 Economic Sectors', () => {
    it('should route Financial Services keywords to the correct banking and insurance agents', async () => {
      const output =
        'Implement transactional payment rails compliant with ISO_20022 and compile actuarial calculations';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Economic Sector Swarm: Financial Services');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Global Investment & Commercial Banking Swarm Specialist',
      );
      expect(agentIds).toContain(
        'Premium Actuarial Underwriting & Insurance Risk Modeler',
      );
    });

    it('should route Healthcare & Life Sciences keywords to diagnostics and pharma specialists', async () => {
      const output =
        'Perform clinical_diagnostics using medical DICOM image segmentation and design bioinformatic pipeline';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Economic Sector Swarm: Healthcare & Life Sciences',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Clinical Diagnostics & Medical Imaging AI Coordinator',
      );
      expect(agentIds).toContain(
        'Bioinformatics Genomic Assembly & Biopharma Specialist',
      );
    });

    it('should route Energy & Utilities keywords to microgrid and SCADA regulators', async () => {
      const output =
        'Optimize microgrid_powerflow battery levels and monitor pressurized thermal_hydraulics containment';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Economic Sector Swarm: Energy & Utilities');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Smart Renewable Grid Optimization & Load Balancing Auditor',
      );
      expect(agentIds).toContain(
        'Nuclear Reactor Instrumentation & SCADA Safety Inspector',
      );
    });

    it('should route Manufacturing & Industrial keywords to robotics and MES planners', async () => {
      const output =
        'Program robotic_kinematics for 6-DOF welding arm and identify shop_floor_mes bottlenecks';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Economic Sector Swarm: Manufacturing & Industrial',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Automotive Assembly Line Robotics & PLC Coordinator',
      );
      expect(agentIds).toContain(
        'Manufacturing Execution System (MES) & Supply Chain Planner',
      );
    });

    it('should route Retail & E-commerce keywords to pricing and CRM retainers', async () => {
      const output =
        'Determine dynamic price_elasticity factors and score customer_clv_score metrics';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Economic Sector Swarm: Retail & E-commerce');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Omnichannel Dynamic Pricing & Elasticity Arbitrage Specialist',
      );
      expect(agentIds).toContain(
        'Hyper-Personalized Retail CRM & Retention Conductor',
      );
    });

    it('should route Transportation & Logistics keywords to marine routing and autonomous fleet trackers', async () => {
      const output =
        'Draft ocean_freight_routing ocean freight schedules and solve fleet vrptw_fleet_opt delivery runs';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Economic Sector Swarm: Transportation & Logistics',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Intermodal Global Freight & Maritime Routing Conductor',
      );
      expect(agentIds).toContain(
        'Autonomous Drone & Delivery Fleet Coordinator',
      );
    });

    it('should route Agriculture & AgTech keywords to soil variable-rate and crop forecasting specialists', async () => {
      const output =
        'Audit ndvi_satellite_imaging variables and perform crop_yield_prediction hedging assessments';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Economic Sector Swarm: Agriculture & AgTech');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Precision Soil Agronomy & Variable Rate Irrigation Specialist',
      );
      expect(agentIds).toContain(
        'Macro Crop Yield Forecasting & Market Hedging Specialist',
      );
    });

    it('should route Technology & Media keywords to 5G core slicing and spatial Three.js modelers', async () => {
      const output =
        'Configure 5g_6g_network_slicing specifications and optimize high-fidelity webgl_threejs_rendering';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Economic Sector Swarm: Technology & Media');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Next-Gen 5G/6G Network Slice & Edge Compute Architect',
      );
      expect(agentIds).toContain(
        'Spatial Computing & High-Fidelity Metaverse Specialist',
      );
    });

    it('should route Education & EdTech keywords to adaptive graph pathing and exam integrity proctors', async () => {
      const output =
        'Generate adaptive_learning_graph spaced reps and audit exam gaze_anomaly_detection logs';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe('Economic Sector Swarm: Education & EdTech');
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Adaptive Curriculum Pathing & EdTech Analytics Architect',
      );
      expect(agentIds).toContain(
        'Remote Proctoring & Academic Integrity Security Guard',
      );
    });

    it('should route Government & Public Sector keywords to municipal traffic planners and FEMA rescue logistics', async () => {
      const output =
        'Calibrate signal phases via traffic_signal_opt and analyze disaster_hazard_map damage zones';
      const { strategy, sequence } =
        await agenticRouter.routeDownstreamSwarm(output);

      expect(strategy).toBe(
        'Economic Sector Swarm: Government & Public Sector',
      );
      const agentIds = sequence.map(s => s.agentId);
      expect(agentIds).toContain(
        'Smart Urban Municipal Infrastructure & Traffic Engineer',
      );
      expect(agentIds).toContain(
        'Disaster Preparedness & FEMA Emergency Relief Specialist',
      );
    });
  });
});
