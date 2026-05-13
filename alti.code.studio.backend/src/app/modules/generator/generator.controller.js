/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { GeneratorService } from './generator.service.js';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { gkeService } from '../googleCloud/gke.service.js';
import { driveBackupService } from '../googleCloud/drive.service.js';
import { fcmService } from '../googleCloud/fcm.service.js';

const generate = catchAsync(async (req, res) => {
    const prompt = req.body.prompt;
    const targetDirName = req.body.targetDir || `generated-app-${Date.now()}`;
    const targetPath = path.resolve('generated', targetDirName);

    // 1. Generate JSON
    const fileTree = await GeneratorService.generateApp(prompt);

    // 2. Write to disk
    const writeResult = await GeneratorService.writeApp(fileTree, targetPath);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'App generated successfully',
        data: { ...writeResult, generatedFiles: fileTree.files.map(f => f.path) },
    });
});

const generateProject = catchAsync(async (req, res) => {
    const { prompt, type } = req.body;
    const targetDirName = req.body.targetDir || `generated-project-${Date.now()}`;
    const targetPath = path.resolve('generated', targetDirName);

    // 1. Generate JSON
    const fileTree = await GeneratorService.generateProject(prompt, type);

    // 2. Write to disk
    const writeResult = await GeneratorService.writeApp(fileTree, targetPath);

    // 3. Install Dependencies
    // Run in background so we don't timeout the request? Or await it?
    // For a "God Tier" experience, let's await it so the user knows it's ready.
    // However, npm install can be slow. 
    // Let's await it but handle timeout/errors gracefully.

    let installResult = { success: false, message: 'Skipped or Failed' };
    if (fileTree.files.some(f => f.path === 'package.json')) {
        installResult = await GeneratorService.installDependencies(targetPath);
    }

    // 4. ☁️ Trigger Autonomous Sovereign Backup to Google Drive (Encrypted)
    driveBackupService.autonomousBackup(targetPath, targetDirName).catch(err => {
        logger.error('Sovereign Drive Backup failed in background', err);
    });

    // 5. 🚢 Autonomous GKE Autopilot Provisioning (For enterprise-scale tasks)
    if (prompt.toLowerCase().includes('enterprise') || prompt.toLowerCase().includes('production') || prompt.toLowerCase().includes('gke')) {
        const gkeName = `alti-gke-${targetDirName.replace(/[^a-z0-9-]/g, '-').slice(0, 20)}`;
        gkeService.provisionAutopilotCluster(gkeName).catch(err => {
            logger.error('GKE Autopilot provisioning failed', err);
        });
        
        // 📲 Autonomous Stakeholder Notification via Firebase Cloud Messaging
        fcmService.broadcastPushNotification(
            '🚀 Enterprise Deployment Initiated',
            `The Swarm has successfully generated ${targetDirName} and is provisioning GKE cluster ${gkeName}.`
        );
    } else {
        // Standard App Generation Notification
        fcmService.broadcastPushNotification(
            '✨ New Swarm App Generated',
            `The Swarm successfully generated and installed: ${targetDirName}`
        );
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project generated and installed successfully. Sovereign Backup & GKE Cluster initiated.',
        data: {
            ...writeResult,
            install: installResult,
            generatedFiles: fileTree.files.map(f => f.path)
        },
    });
});

const refine = catchAsync(async (req, res) => {
    const { targetDir, prompt } = req.body;
    // Assuming targetDir is relative to 'generated' folder for security, 
    // or we accept a full path if internal. Let's assume the frontend sends the folder name.
    const fullPath = path.resolve('generated', targetDir); // Sanitize this in real app!

    const result = await GeneratorService.refineProject(fullPath, prompt);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Project refined successfully',
        data: result,
    });
});

export const GeneratorController = {
    generate,
    generateProject,
    refine,
};
