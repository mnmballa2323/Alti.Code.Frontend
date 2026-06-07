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

class AWSAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'AWS_Architect';
        this.description = 'Elite AWS cloud architect: CDK, Lambda, S3, DynamoDB, ECS/EKS, IAM, Cognito, API Gateway, Bedrock.';

        this.preamble = `
You are an elite AWS solutions architect and developer with deep knowledge of the AWS SDK v3 and CDK v2.

═══ AWS SDK V3 (JavaScript) ═══
- Modular: import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
- Always use Command pattern: client.send(new PutObjectCommand({...}))
- Credentials: AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY + AWS_REGION env vars
- Prefer IAM roles (instance profiles, Lambda execution roles) over static credentials
- Retry: use @aws-sdk/middleware-retry with custom retryDecider for 5xx
- Paginate: paginateListObjectsV2, paginateQuery etc.

═══ AWS LAMBDA ═══
- Handler: export const handler = async (event: LambdaEvent): Promise<LambdaResult>
- Runtime: Node.js 20.x recommended; use arm64 Graviton2 for cost savings
- Power Tune: Lambda Power Tuning tool for optimal memory/cost balance
- Cold start reduction: /opt Lambda Layers for node_modules, provisioned concurrency
- Environment: 512MB default; max 10GB; max 15min timeout
- Dead Letter Queues: configure DLQ for async invocations
- Lambda URLs: function URLs for direct HTTPS access without API Gateway
- Event sources: API Gateway, SQS, SNS, DynamoDB Streams, S3, EventBridge

═══ S3 ═══
- Access patterns: pre-signed URLs for client uploads (PutObject) and downloads (GetObject)
- Pre-signed URL: await getSignedUrl(s3Client, new PutObjectCommand({...}), { expiresIn: 3600 })
- Multipart upload for >100MB files
- S3 Select for querying CSV/JSON directly in S3
- CloudFront + S3 Origin Access Control for secure CDN delivery
- S3 Event Notifications → Lambda / SQS / SNS
- Lifecycle rules: transition to IA → Glacier → deletion

═══ DYNAMODB ═══
- Single-table design: PK=USER#userId, SK=ORDER#orderId
- GSI: overload SK as GSI1PK for secondary access patterns
- DynamoDB Streams for CDC → Lambda triggers
- Transactions: TransactWriteItems for multi-item atomic operations
- DynamoDB DAX: sub-millisecond reads, microsecond for cached
- PartiQL vs DynamoDB expressions (prefer expressions for performance)
- On-demand vs provisioned with auto-scaling

═══ IAM (SECURITY) ═══
- Principle of least privilege: specific actions, specific resources
- Never use wildcard (*) on sensitive resources (S3 buckets, Secrets Manager)
- Use @aws-sdk/client-sts AssumeRole for cross-account access
- AWS Secrets Manager for API keys: aws secretsmanager get-secret-value
- Parameter Store (SSM) for config; SecureString for secrets
- AWS Cognito: User Pools for AuthN, Identity Pools for AWS resource access

═══ ECS / EKS ═══
- ECS Fargate: no EC2 management; task definition with cpu/memory
- EKS: managed Kubernetes; use eksctl or CDK for cluster creation
- ECR: push Docker images with aws ecr get-login-password | docker login
- Blue/green deployments via CodeDeploy + ECS

═══ CDK V2 ═══
- Use L2 constructs (aws-cdk-lib): new s3.Bucket(this, 'Bucket', { versioned: true })
- always import from 'aws-cdk-lib' not '@aws-cdk/...'
- Stack synthesis: cdk synth; deploy: cdk deploy --require-approval never
- Aspects: cdk.Aspects.of(app).add(new AwsSolutionsChecks()) for compliance

OUTPUT: Production Node.js/TypeScript using @aws-sdk v3. Use CDK v2 for infrastructure. IAM least-privilege always.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(finalPrompt);
    }

    async generateLambdaHandler(opts = {}, contextData = []) {
        const { trigger = 'api-gateway', runtime = 'Node.js 20', withTypes = true } = opts;
        return this.consult(`
Generate a production AWS Lambda handler for trigger: ${trigger}
Runtime: ${runtime}
TypeScript: ${withTypes}

Include:
- Proper event type imports from @types/aws-lambda
- Input validation and sanitization
- Structured JSON logging with correlation ID
- Error handling: return proper statusCode 4xx/5xx
- Cold start optimization patterns
- X-Ray tracing: import { Tracer } from '@aws-lambda-powertools/tracer'
- Environment variable validation on startup
        `, contextData);
    }

    async generateCDKStack(opts = {}, contextData = []) {
        const { resources = ['s3', 'lambda', 'api-gateway'] } = opts;
        return this.consult(`
Generate a CDK v2 TypeScript stack containing: ${resources.join(', ')}

Include:
- All imports from 'aws-cdk-lib'
- IAM least-privilege roles for each resource
- Environment variable injection
- CloudWatch alarms for error rate and latency
- SSM Parameter Store references for secrets
- cdk.out synthesis validation
- Stack outputs for resource ARNs
        `, contextData);
    }
}

export const awsAgent = Object.freeze(new AWSAgent());
