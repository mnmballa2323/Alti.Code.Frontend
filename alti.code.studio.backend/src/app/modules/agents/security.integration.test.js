import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYaml } from './yaml_agent_loader.js';
import { agenticRouter } from './agentic_router.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');
const SECURITY_DIR = path.join(DEFINITIONS_DIR, 'security');

describe('Modular Cybersecurity, DevSecOps & Defensive Auditing Declarative Agents & Swarm Router Integration', () => {
    describe('Recursive Declarative YAML Parsing & Ingestion', () => {
        it('should successfully parse and load Static Analysis & CVE Auditing Specialist', async () => {
            const agentPath = path.join(SECURITY_DIR, 'security.cve_auditor.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.security.cve_auditor');
            expect(def.name).toBe('Static Analysis & CVE Auditing Specialist');
            expect(def.capabilities).toContain('dependency_vulnerability_scanning');
            expect(def.capabilities).toContain('sast_dast_scanner_calibration');
        });

        it('should successfully parse and load Automated Penetration Tester & Red Teamer', async () => {
            const agentPath = path.join(SECURITY_DIR, 'security.penetration.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.security.penetration');
            expect(def.name).toBe('Automated Penetration Tester & Red Teamer');
            expect(def.capabilities).toContain('sql_injection_penetration');
            expect(def.capabilities).toContain('xss_csrf_bypass_testing');
        });

        it('should successfully parse and load Cryptographic Key & Key Vault Secrets Sentinel', async () => {
            const agentPath = path.join(SECURITY_DIR, 'security.kms_officer.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.security.kms_officer');
            expect(def.name).toBe('Cryptographic Key & Key Vault Secrets Sentinel');
            expect(def.capabilities).toContain('kms_cryptographic_key_rotation');
            expect(def.capabilities).toContain('envelope_encryption_wrapping');
        });

        it('should successfully parse and load Zero-Trust Network Perimeter Auditor', async () => {
            const agentPath = path.join(SECURITY_DIR, 'security.zero_trust.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.security.zero_trust');
            expect(def.name).toBe('Zero-Trust Network Perimeter Auditor');
            expect(def.capabilities).toContain('vpc_service_connect_perimeters');
            expect(def.capabilities).toContain('mutual_tls_mtls_enforcement');
        });

        it('should successfully parse and load IAM & Identity Privilege Sentinel', async () => {
            const agentPath = path.join(SECURITY_DIR, 'security.iam_governor.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.security.iam_governor');
            expect(def.name).toBe('IAM & Identity Privilege Sentinel');
            expect(def.capabilities).toContain('cross_account_role_assumption');
            expect(def.capabilities).toContain('least_privilege_iam_alignment');
        });

        it('should successfully parse and load Threat Modeling & Attack Graph Specialist', async () => {
            const agentPath = path.join(SECURITY_DIR, 'security.threat_modeling.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.security.threat_modeling');
            expect(def.name).toBe('Threat Modeling & Attack Graph Specialist');
            expect(def.capabilities).toContain('stride_threat_model_classification');
            expect(def.capabilities).toContain('cvss_vulnerability_metric_scoring');
        });

        it('should successfully parse and load SOC2, PCI-DSS & HIPAA Compliance Auditor', async () => {
            const agentPath = path.join(SECURITY_DIR, 'security.compliance.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.security.compliance');
            expect(def.name).toBe('SOC2, PCI-DSS & HIPAA Compliance Auditor');
            expect(def.capabilities).toContain('soc2_trust_services_audit');
            expect(def.capabilities).toContain('compliance_as_code_rego_rules');
        });

        it('should successfully parse and load WAF & DDoS Mitigation Coordinator', async () => {
            const agentPath = path.join(SECURITY_DIR, 'security.waf_sentinel.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.security.waf_sentinel');
            expect(def.name).toBe('WAF & DDoS Mitigation Coordinator');
            expect(def.capabilities).toContain('waf_custom_rule_exclusions');
            expect(def.capabilities).toContain('dynamic_rate_limiting_thresholds');
        });

        it('should successfully parse and load Binary Authorization & Supply Chain Guardian', async () => {
            const agentPath = path.join(SECURITY_DIR, 'security.binary_auth.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.security.binary_auth');
            expect(def.name).toBe('Binary Authorization & Supply Chain Guardian');
            expect(def.capabilities).toContain('container_cryptographic_signing');
            expect(def.capabilities).toContain('binary_authorization_gateways');
        });

        it('should successfully parse and load SIEM & Secure Audit Trail Specialist', async () => {
            const agentPath = path.join(SECURITY_DIR, 'security.audit_logger.agent.yaml');
            const def = parseYaml(await fs.readFile(agentPath, 'utf8'));

            expect(def.id).toBe('agent.security.audit_logger');
            expect(def.name).toBe('SIEM & Secure Audit Trail Specialist');
            expect(def.capabilities).toContain('immutable_log_sinks');
            expect(def.capabilities).toContain('siem_chronicle_ingestion');
        });
    });

    describe('Precision Swarm Routing for All 10 Security Engineering Agents', () => {
        it('should route CVE Audits keywords to the CVE auditor agent', async () => {
            const output = 'Perform dynamic dependency_vulnerability_scanning and enforce lockfile_security_audit checks';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Cybersecurity Swarm: CVE & Static Code Analysis');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Static Analysis & CVE Auditing Specialist');
        });

        it('should route Pentesting keywords to the penetration tester agent', async () => {
            const output = 'Perform automated sql_injection_penetration simulations and verify xss_csrf_bypass_testing guards';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Cybersecurity Swarm: Penetration & Red Teaming');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Automated Penetration Tester & Red Teamer');
        });

        it('should route Cryptography keywords to the KMS officer agent', async () => {
            const output = 'Audit kms_cryptographic_key_rotation schedules and setup api_token_leak_scanning triggers';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Cybersecurity Swarm: Cryptographic Keys & Secrets');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Cryptographic Key & Key Vault Secrets Sentinel');
        });

        it('should route Zero-Trust keywords to the Zero-Trust network auditor agent', async () => {
            const output = 'Structure vpc_service_connect_perimeters perimeters and check service_mesh_authorization_policies';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Cybersecurity Swarm: Zero-Trust Network Mesh');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Zero-Trust Network Perimeter Auditor');
        });

        it('should route IAM keywords to the IAM privileges sentinel agent', async () => {
            const output = 'Audit cross_account_role_assumption privileges and enforce least_privilege_iam_alignment structures';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Cybersecurity Swarm: IAM & Identity Privileges');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('IAM & Identity Privilege Sentinel');
        });

        it('should route Threat Modeling keywords to the threat model specialist agent', async () => {
            const output = 'Define stride_threat_model_classification lists and draw attack_graph_path_generation maps';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Cybersecurity Swarm: Threat Modeling & Attack Graphs');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Threat Modeling & Attack Graph Specialist');
        });

        it('should route Compliance keywords to the compliance auditor agent', async () => {
            const output = 'Compile compliance_as_code_rego_rules policies and complete a soc2_trust_services_audit audit';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Cybersecurity Swarm: Compliance & Auditing');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('SOC2, PCI-DSS & HIPAA Compliance Auditor');
        });

        it('should route WAF keywords to the WAF coordinator agent', async () => {
            const output = 'Write waf_custom_rule_exclusions exclusions and optimize dynamic_rate_limiting_thresholds parameters';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Cybersecurity Swarm: WAF & DDoS Protection');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('WAF & DDoS Mitigation Coordinator');
        });

        it('should route Supply Chain keywords to the binary authorization guardian agent', async () => {
            const output = 'Confirm container_cryptographic_signing signatures and verify binary_authorization_gateways policies';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Cybersecurity Swarm: Software Supply Chain Trust');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('Binary Authorization & Supply Chain Guardian');
        });

        it('should route SIEM keywords to the SIEM audit logger specialist agent', async () => {
            const output = 'Build secure_audit_trail_schemas structures and verify siem_chronicle_ingestion parsers';
            const { strategy, sequence } = await agenticRouter.routeDownstreamSwarm(output);

            expect(strategy).toBe('Cybersecurity Swarm: SIEM & Immutable Audit Logs');
            const agentIds = sequence.map(s => s.agentId);
            expect(agentIds).toContain('SIEM & Secure Audit Trail Specialist');
        });
    });
});
