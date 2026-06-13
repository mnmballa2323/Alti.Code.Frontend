import { describe, it, expect, vi, beforeEach } from 'vitest';
import { industryIntegrationService } from './industry_integration.service.js';
import { auditLogService } from '../security/auditLog.service.js';
import { kmsService } from '../googleCloud/kms.service.js';

describe('Industry Integration & Interoperability Service Tests', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('1. FinTech Double-Entry Ledger Broker', () => {
        it('should balance a valid transaction block', async () => {
            const transaction = {
                entries: [
                    { account: 'Asset:Cash', debit: 1500.00, credit: 0, currency: 'USD' },
                    { account: 'Equity:Capital', debit: 0, credit: 1500.00, currency: 'USD' }
                ]
            };

            const mockLog = vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryIntegrationService.validateDoubleEntryLedger('user-1', 'tenant-1', transaction);

            expect(result.compliant).toBe(true);
            expect(result.transactionHash).toBeDefined();
            expect(result.validatedCurrencies[0].currency).toBe('USD');
            expect(result.validatedCurrencies[0].totalAmount).toBe(1500.00);
            expect(mockLog).toHaveBeenCalled();
        });

        it('should balance multiple currencies independently', async () => {
            const transaction = {
                entries: [
                    { account: 'Asset:Cash:USD', debit: 100, credit: 0, currency: 'USD' },
                    { account: 'Revenue:USD', debit: 0, credit: 100, currency: 'USD' },
                    { account: 'Asset:Cash:EUR', debit: 0, credit: 50, currency: 'EUR' },
                    { account: 'Expense:EUR', debit: 50, credit: 0, currency: 'EUR' }
                ]
            };

            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryIntegrationService.validateDoubleEntryLedger('user-1', 'tenant-1', transaction);

            expect(result.compliant).toBe(true);
            expect(result.validatedCurrencies).toHaveLength(2);
        });

        it('should throw an error on unbalanced entries', async () => {
            const transaction = {
                entries: [
                    { account: 'Asset:Cash', debit: 1000.00, credit: 0, currency: 'USD' },
                    { account: 'Equity:Capital', debit: 0, credit: 999.99, currency: 'USD' }
                ]
            };

            await expect(
                industryIntegrationService.validateDoubleEntryLedger('user-1', 'tenant-1', transaction)
            ).rejects.toThrow('Ledger imbalance: Total debits (1000) do not equal total credits (999.99) for currency USD.');
        });
    });

    describe('2. Healthcare HL7-to-FHIR R4 Message Transformer', () => {
        it('should transform an ADT^A08 HL7 message to FHIR Patient', async () => {
            const hl7 = `MSH|^~\\&|EMR|HOSPITAL|OUTPATIENT|CLINIC|20260613||ADT^A08|MSG00001|P|2.4
PID|||PAT12345||SMITH^JOHN||19781123|M
PV1||O|OP-CLINIC|||||||||||||||`;

            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryIntegrationService.transformHl7ToFhir('user-1', 'tenant-1', hl7);

            expect(result.compliant).toBe(true);
            expect(result.fhirResource.resourceType).toBe('Patient');
            expect(result.fhirResource.id).toBe('PAT12345');
            expect(result.fhirResource.name[0].family).toBe('SMITH');
            expect(result.fhirResource.name[0].given[0].trim()).toBe('JOHN');
            expect(result.fhirResource.gender).toBe('male');
            expect(result.fhirResource.birthDate).toBe('1978-11-23');
        });

        it('should transform an ORU^R01 HL7 message to FHIR Observation', async () => {
            const hl7 = `MSH|^~\\&|LIS|LAB|CLINIC|HOSPITAL|20260613||ORU^R01|MSG00002|P|2.4
PID|||PAT999||SMITH^JANE||19850512|F
OBX|1|NM|883-9^LOINC^Hemoglobin||14.2|g/dl||N|||F`;

            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryIntegrationService.transformHl7ToFhir('user-1', 'tenant-1', hl7);

            expect(result.compliant).toBe(true);
            expect(result.fhirResource.resourceType).toBe('Observation');
            expect(result.fhirResource.status).toBe('final');
            expect(result.fhirResource.code.coding[0].code).toBe('883-9');
            expect(result.fhirResource.code.coding[0].display).toBe('LOINC');
            expect(result.fhirResource.valueQuantity.value).toBe(14.2);
            expect(result.fhirResource.valueQuantity.unit).toBe('g/dl');
            expect(result.fhirResource.subject.reference).toBe('Patient/PAT999');
        });
    });

    describe('3. Pharma FDA Batch Record Archiver', () => {
        it('should package and cryptographically sign a valid FDA batch run record', async () => {
            const batchData = {
                batchId: 'BATCH-4091',
                productCode: 'PROD-Aspirin-500',
                stepLogs: [
                    { step: 1, action: 'Mix Active Ingredient', status: 'COMPLETED' },
                    { step: 2, action: 'Compression Tableting', status: 'COMPLETED' }
                ],
                operatorSignature: 'operator-cryptographic-sig-base64'
            };

            vi.spyOn(kmsService, 'verifySignature').mockResolvedValue(true);
            vi.spyOn(kmsService, 'signPayload').mockResolvedValue('cmek-kms-archive-signature-string');
            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({
                id: 'log-111',
                timestamp: '2026-06-13T22:00:00Z'
            });

            const result = await industryIntegrationService.archivePharmaBatch('user-1', 'tenant-1', batchData);

            expect(result.compliant).toBe(true);
            expect(result.archiveId).toBeDefined();
            expect(result.cmekSignature).toBe('cmek-kms-archive-signature-string');
            expect(result.hash).toBeDefined();
        });

        it('should reject batch archive if operator signature is invalid', async () => {
            const batchData = {
                batchId: 'BATCH-4091',
                productCode: 'PROD-Aspirin-500',
                stepLogs: [],
                operatorSignature: 'bad-operator-sig'
            };

            vi.spyOn(kmsService, 'verifySignature').mockResolvedValue(false);

            await expect(
                industryIntegrationService.archivePharmaBatch('user-1', 'tenant-1', batchData)
            ).rejects.toThrow('FDA Part 11 violation: Invalid operator signature for batch record verification.');
        });
    });

    describe('4. Hedge Fund Risk Pricing Broker', () => {
        const portfolio = {
            cash: 300000,
            holdings: [
                { symbol: 'AAPL', sector: 'Technology', quantity: 500, price: 100 }, // $50k (10%)
                { symbol: 'MSFT', sector: 'Technology', quantity: 500, price: 100 }, // $50k (10%)
                { symbol: 'NVDA', sector: 'Technology', quantity: 500, price: 100 }, // $50k (10%)
                { symbol: 'JPM', sector: 'Financials', quantity: 500, price: 100 }    // $50k (10%)
            ] // Total assets = $200k, Cash = $300k, Total portfolio value = $500k
        };

        it('should approve trade within portfolio limit constraints', async () => {
            // Proposed: BUY 100 shares of JPM for $10k.
            // Post trade JPM value = $60k (12% of portfolio value $500k)
            const proposedTrade = {
                symbol: 'JPM',
                action: 'BUY',
                quantity: 100,
                price: 100,
                sector: 'Financials'
            };

            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryIntegrationService.checkHedgeFundRisk('user-1', 'tenant-1', portfolio, proposedTrade);

            expect(result.approved).toBe(true);
            expect(result.totalValue).toBe(500000);
            expect(result.cashValue).toBe(290000);
            expect(result.singleAssetViolations).toHaveLength(0);
            expect(result.sectorViolations).toHaveLength(0);
        });

        it('should reject trade if single asset concentration exceeds 15%', async () => {
            // Proposed BUY 300 shares of AAPL for $30k.
            // Post trade AAPL value = $80k (16% of total portfolio value $500k)
            const proposedTrade = {
                symbol: 'AAPL',
                action: 'BUY',
                quantity: 300,
                price: 100,
                sector: 'Technology'
            };

            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryIntegrationService.checkHedgeFundRisk('user-1', 'tenant-1', portfolio, proposedTrade);

            expect(result.approved).toBe(false);
            expect(result.singleAssetViolations.length).toBeGreaterThan(0);
            expect(result.singleAssetViolations[0].symbol).toBe('AAPL');
        });

        it('should reject trade if sector concentration exceeds 35%', async () => {
            // Propose buying CSCO (Technology) for $30k.
            // Post trade Tech value = AAPL ($50k) + MSFT ($50k) + NVDA ($50k) + CSCO ($30k) = $180k (36% of $500k)
            // Individual weights: AAPL (10%), MSFT (10%), NVDA (10%), CSCO (6%) - None exceed 15% single asset limit.
            const proposedTrade = {
                symbol: 'CSCO',
                action: 'BUY',
                quantity: 300,
                price: 100,
                sector: 'Technology'
            };

            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryIntegrationService.checkHedgeFundRisk('user-1', 'tenant-1', portfolio, proposedTrade);

            expect(result.approved).toBe(false);
            expect(result.singleAssetViolations).toHaveLength(0); // Verifies ONLY sector violation
            expect(result.sectorViolations.length).toBeGreaterThan(0);
            expect(result.sectorViolations[0].sector).toBe('Technology');
        });
    });

    describe('5. Insurance Guidewire Claim Router', () => {
        it('should parse Guidewire XML claims and route high-value claims to HIGH_VALUE_REVIEW', async () => {
            const xml = `<ClaimCenterPayload>
                <ClaimNumber>CLM-709124</ClaimNumber>
                <PolicyNumber>POL-9012489</PolicyNumber>
                <InsuredName>Arthur Dent</InsuredName>
                <LossType>Property_Damage</LossType>
                <ClaimAmount>75000.00</ClaimAmount>
            </ClaimCenterPayload>`;

            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryIntegrationService.routeGuidewireClaim('user-1', 'tenant-1', xml);

            expect(result.compliant).toBe(true);
            expect(result.claimDetails.claimNumber).toBe('CLM-709124');
            expect(result.claimDetails.claimAmount).toBe(75000.00);
            expect(result.routedQueue).toBe('HIGH_VALUE_REVIEW');
        });

        it('should route bodily injury claims to BODILY_INJURY_SPECIALIST', async () => {
            const xml = `<ClaimCenterPayload>
                <ClaimNumber>CLM-709125</ClaimNumber>
                <PolicyNumber>POL-9012489</PolicyNumber>
                <InsuredName>Ford Prefect</InsuredName>
                <LossType>BODILY_INJURY</LossType>
                <ClaimAmount>12000.00</ClaimAmount>
            </ClaimCenterPayload>`;

            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryIntegrationService.routeGuidewireClaim('user-1', 'tenant-1', xml);

            expect(result.routedQueue).toBe('BODILY_INJURY_SPECIALIST');
        });
    });

    describe('6. Automotive Telemetry / CAN-bus Frame Decoder', () => {
        it('should decode vehicle speed from CCVS CAN frame 0x18FEF100', async () => {
            // Speed bytes are Byte 2 and 3. Speed: 50 km/h is 12800 raw (12800 / 256.0 = 50)
            // 12800 in hex is 0x3200 -> byte[1] = 0x00, byte[2] = 0x32
            const frame = {
                frameId: '0x18FEF100',
                payloadHex: '0100320000000000'
            };

            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryIntegrationService.decodeAutomotiveTelemetry('user-1', 'tenant-1', frame);

            expect(result.compliant).toBe(true);
            expect(result.decodedTelemetry.wheelBasedSpeedKmh).toBe(50.00);
            expect(result.decodedTelemetry.parameterGroup).toBe('CCVS');
        });

        it('should decode motor RPM from EEC1 CAN frame 0x0CF00400', async () => {
            // Engine speed bytes: Byte 3 & 4. 2000 RPM is 16000 raw (16000 * 0.125 = 2000)
            // 16000 in hex is 0x3E80 -> byte[3] = 0x80, byte[4] = 0x3E
            const frame = {
                frameId: '0x0CF00400',
                payloadHex: '000000803E000000'
            };

            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryIntegrationService.decodeAutomotiveTelemetry('user-1', 'tenant-1', frame);

            expect(result.compliant).toBe(true);
            expect(result.decodedTelemetry.engineRpm).toBe(2000.0);
            expect(result.decodedTelemetry.parameterGroup).toBe('EEC1');
        });

        it('should decode SoC and Temp from EV Battery frame 0x18FEE600', async () => {
            // Byte 1: SoC. 80% SoC is 200 raw (200 * 0.4 = 80) -> 0xC8
            // Byte 2: Battery Temp. 25 C is 65 raw (65 - 40 = 25) -> 0x41
            const frame = {
                frameId: '0x18FEE600',
                payloadHex: 'C841000000000000'
            };

            vi.spyOn(auditLogService, 'logAction').mockResolvedValue({ id: 'log-id' });

            const result = await industryIntegrationService.decodeAutomotiveTelemetry('user-1', 'tenant-1', frame);

            expect(result.compliant).toBe(true);
            expect(result.decodedTelemetry.stateOfChargePercent).toBe(80.0);
            expect(result.decodedTelemetry.batteryTemperatureC).toBe(25);
            expect(result.decodedTelemetry.parameterGroup).toBe('EV_BATTERY_STATUS');
        });
    });
});
