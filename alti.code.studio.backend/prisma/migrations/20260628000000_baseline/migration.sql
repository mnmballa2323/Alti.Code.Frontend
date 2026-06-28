-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'buyer', 'admin', 'unauthorized', 'owner');

-- CreateEnum
CREATE TYPE "TenantRole" AS ENUM ('owner', 'admin', 'developer', 'viewer');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('paid', 'expired');

-- CreateEnum
CREATE TYPE "SubscriptionDuration" AS ENUM ('month', 'year');

-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('schedule', 'webhook');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('active', 'paused', 'failed');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('running', 'success', 'failed');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "ssoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "samlIdpUrl" TEXT,
    "samlCert" TEXT,
    "oidcIssuer" TEXT,
    "oidcClientId" TEXT,
    "dedicatedDatabaseUrl" TEXT,
    "legalHold" BOOLEAN NOT NULL DEFAULT false,
    "retentionPeriodDays" INTEGER,
    "customerKmsKeyArn" TEXT,
    "dataRegion" TEXT NOT NULL DEFAULT 'us-east-1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID,
    "tenantRole" "TenantRole" NOT NULL DEFAULT 'viewer',
    "provider" TEXT NOT NULL DEFAULT 'local',
    "googleId" TEXT,
    "githubId" TEXT,
    "avatar" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "clearanceLevel" INTEGER NOT NULL DEFAULT 1,
    "allowedIps" TEXT[],
    "role" "Role" NOT NULL DEFAULT 'unauthorized',
    "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionPrice" DOUBLE PRECISION,
    "subscriptionPlan" TEXT,
    "subscriptionDur" "SubscriptionDuration",
    "subscriptionExp" TIMESTAMP(3),
    "subscriptionStat" "SubscriptionStatus",
    "invoiceUrl" TEXT,
    "promptsUsed" INTEGER NOT NULL DEFAULT 0,
    "imagesUsed" INTEGER NOT NULL DEFAULT 0,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmationToken" TEXT,
    "confirmationTokenExpires" TIMESTAMP(3),
    "resetPasswordOTP" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "deleteAccountOTP" TEXT,
    "deleteAccountExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "transactionId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "planName" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "invoiceUrl" TEXT,
    "promptsUsed" INTEGER NOT NULL DEFAULT 0,
    "imagesUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forum" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "authorId" UUID NOT NULL,
    "authorEmail" TEXT,
    "description" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Forum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplacePlugin" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agentId" VARCHAR(255) NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "description" TEXT,
    "pluginPath" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "installedBy" TEXT NOT NULL DEFAULT 'system',
    "yamlPath" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplacePlugin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" VARCHAR(255) NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "environment" TEXT NOT NULL DEFAULT 'production',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "hash" TEXT NOT NULL,
    "previousHash" TEXT NOT NULL,
    "kmsSignature" TEXT,
    "kmsKeyId" TEXT,
    "aiProvenance" JSONB,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchitectureNode" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "repoId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "layer" TEXT NOT NULL DEFAULT 'unknown',
    "metadata" JSONB,
    "aiEnrichment" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchitectureNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchitectureEdge" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "repoId" TEXT NOT NULL,
    "sourceId" UUID NOT NULL,
    "targetId" UUID NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchitectureEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BacklogItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "status" TEXT NOT NULL DEFAULT 'Backlog',
    "userStories" JSONB NOT NULL DEFAULT '[]',
    "aiAnalysis" JSONB,
    "specPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BacklogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantBilling" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "monthlyBudgetUsd" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "currentSpendUsd" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "hardLimitAction" TEXT NOT NULL DEFAULT 'pause',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantBilling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LLMMetrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "agentName" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gemini-3.1-pro',
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "estimatedCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "executionTimeMs" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LLMMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentMemory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "agentId" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(768),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "sessionId" TEXT,
    "responses" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "triggerType" "TriggerType" NOT NULL,
    "frequency" TEXT,
    "webhookEvent" TEXT,
    "prompt" TEXT NOT NULL,
    "tools" TEXT[],
    "status" "WorkflowStatus" NOT NULL DEFAULT 'active',
    "schedulerJobName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflowId" UUID NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'running',
    "logs" JSONB NOT NULL DEFAULT '[]',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vault" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "openaiApiKey" TEXT,
    "anthropicApiKey" TEXT,
    "geminiApiKey" TEXT,
    "azureEndpoint" TEXT,
    "azureApiKey" TEXT,
    "gcpProjectId" TEXT,
    "gcpClientEmail" TEXT,
    "gcpPrivateKey" TEXT,
    "awsAccessKeyId" TEXT,
    "awsSecretAccessKey" TEXT,
    "awsRegion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiemWebhook" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "authToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiemWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OkfConcept" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conceptId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resource" TEXT,
    "tags" TEXT[],
    "body" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "embedding" vector(768),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OkfConcept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeFolder" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "userId" UUID,
    "tenantId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeFile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "folderId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'info',
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerlessFunction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServerlessFunction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_name_key" ON "Tenant"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_domain_key" ON "Tenant"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplacePlugin_agentId_key" ON "MarketplacePlugin"("agentId");

-- CreateIndex
CREATE INDEX "MarketplacePlugin_category_enabled_idx" ON "MarketplacePlugin"("category", "enabled");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_actor_idx" ON "AuditLog"("actor");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_hash_idx" ON "AuditLog"("hash");

-- CreateIndex
CREATE INDEX "AuditLog_productId_idx" ON "AuditLog"("productId");

-- CreateIndex
CREATE INDEX "ArchitectureNode_repoId_idx" ON "ArchitectureNode"("repoId");

-- CreateIndex
CREATE INDEX "ArchitectureEdge_repoId_idx" ON "ArchitectureEdge"("repoId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantBilling_tenantId_key" ON "TenantBilling"("tenantId");

-- CreateIndex
CREATE INDEX "LLMMetrics_tenantId_timestamp_idx" ON "LLMMetrics"("tenantId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "LLMMetrics_agentName_idx" ON "LLMMetrics"("agentName");

-- CreateIndex
CREATE INDEX "Workflow_userId_idx" ON "Workflow"("userId");

-- CreateIndex
CREATE INDEX "WorkflowRun_workflowId_createdAt_idx" ON "WorkflowRun"("workflowId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Vault_userId_key" ON "Vault"("userId");

-- CreateIndex
CREATE INDEX "SiemWebhook_tenantId_idx" ON "SiemWebhook"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "OkfConcept_conceptId_key" ON "OkfConcept"("conceptId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forum" ADD CONSTRAINT "Forum_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchitectureEdge" ADD CONSTRAINT "ArchitectureEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ArchitectureNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchitectureEdge" ADD CONSTRAINT "ArchitectureEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "ArchitectureNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantBilling" ADD CONSTRAINT "TenantBilling_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LLMMetrics" ADD CONSTRAINT "LLMMetrics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentMemory" ADD CONSTRAINT "AgentMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatHistory" ADD CONSTRAINT "ChatHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vault" ADD CONSTRAINT "Vault_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiemWebhook" ADD CONSTRAINT "SiemWebhook_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeFile" ADD CONSTRAINT "KnowledgeFile_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "KnowledgeFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServerlessFunction" ADD CONSTRAINT "ServerlessFunction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

