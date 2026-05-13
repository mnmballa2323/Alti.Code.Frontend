import { describe, it, expect, vi, beforeEach } from 'vitest';
import { devopsAgent } from './devops.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import fs from 'fs/promises';
import path from 'path';

vi.mock('../gemini/gemini.service.js');
vi.mock('fs/promises');

describe('Autonomous Infrastructure-as-Code (Phase 22 - The DevOps Architect)', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a main.tf file, mock a terraform apply, and inject credentials into .env', async () => {

    // Mock the AI generating Terraform code
    GeminiAiService.generateContent.mockResolvedValueOnce(`
provider "google" {
  region = "us-central1"
}

resource "google_storage_bucket" "image_bucket" {
  name = "alti-image-uploads-12345"
}

output "GCP_STORAGE_BUCKET_NAME" {
  value = google_storage_bucket.image_bucket.name
}
        `);

    // Mock reading an existing .env file
    fs.readFile.mockResolvedValueOnce('EXISTING_VAR=true\n');

    const request = "I need an S3 bucket to store image uploads.";
    const mockTfDir = '/mock/infra/s3';
    const mockEnvPath = '/mock/.env';

    const result = await devopsAgent.provisionInfrastructure(request, mockTfDir, mockEnvPath);

    // ASSERTIONS

    // 1. Check AI was called
    expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

    // 2. Check Terraform Directory was created
    expect(fs.mkdir).toHaveBeenCalledWith(mockTfDir, { recursive: true });

    // 3. Check main.tf was written
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(mockTfDir, 'main.tf'),
      expect.stringContaining('resource "google_storage_bucket"'),
      'utf8'
    );

    // 4. Check the extracted outputs exist
    expect(result.success).toBe(true);
    expect(result.outputs).toHaveProperty('GCP_STORAGE_BUCKET_NAME');
    expect(result.outputs.GCP_REGION).toBe('us-central1');

    // 5. Check the .env was updated
    expect(fs.writeFile).toHaveBeenCalledWith(
      mockEnvPath,
      expect.stringContaining('EXISTING_VAR=true'),
      'utf8'
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      mockEnvPath,
      expect.stringContaining('GCP_STORAGE_BUCKET_NAME='),
      'utf8'
    );
  });

});
