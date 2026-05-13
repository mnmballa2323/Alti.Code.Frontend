#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs/promises';

async function main() {
    // Banner
    console.log(chalk.cyan('Alti Code Studio CLI'));
    console.log(chalk.gray('Universal Access Layer v1.0.0'));
    console.log('');

    const program = new Command();

    program
        .version('1.0.0')
        .description('Alti Code Studio CLI');

    program
        .command('status')
        .description('Check the health of the Alti Backend')
        .action(async () => {
            console.log(chalk.yellow('Checking system status...'));

            try {
                // Timeout promise
                const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout loading services')), 5000));

                // Lazy load services
                const servicesPromise = (async () => {
                    const { redisClient } = await import('../src/shared/redis.client.js');
                    const { postgresClient } = await import('../src/app/shared/postgres.client.js');
                    return { redisClient, postgresClient };
                })();

                const { redisClient, postgresClient } = await Promise.race([servicesPromise, timeout]);

                // Check Redis
                const redisStatus = redisClient.isEnabled ? chalk.green('ONLINE') : chalk.red('OFFLINE (Mock)');
                console.log(`- Redis: ${redisStatus}`);

                // Check Postgres
                try {
                    await Promise.race([postgresClient.init(), timeout]);
                    const pgStatus = postgresClient.isConnected ? chalk.green('ONLINE') : chalk.red('OFFLINE');
                    console.log(`- Postgres (Memory): ${pgStatus}`);
                } catch (e) {
                    console.log(`- Postgres: ${chalk.red('ERROR')} (${e.message})`);
                }

                await postgresClient.close();
                await redisClient.quit();

            } catch (error) {
                console.log(chalk.red('Failed to load services:'), error.message);
            }

            // Check Workspace
            try {
                await fs.access(process.cwd());
                console.log(`- Workspace: ${chalk.green('ACCESSIBLE')} (${process.cwd()})`);
            } catch {
                console.log(`- Workspace: ${chalk.red('INACCESSIBLE')}`);
            }
        });

    program
        .command('fix <file>')
        .description('Auto-fix a file using the Surgeon Agent')
        .action(async (file) => {
            console.log(chalk.blue(`🚑 Summoning Surgeon for: ${file}`));
            const startTime = Date.now();

            try {
                // Lazy load Surgeon
                const { Surgeon } = await import('../src/app/modules/surgeon/surgeon.service.js');
                const { completionService } = await import('../src/app/modules/ai/completion.service.js');

                const result = await Surgeon.operate(file, "User triggered fix via CLI (General Checkup)");

                const duration = ((Date.now() - startTime) / 1000).toFixed(2);

                if (result.status === 'fixed') {
                    console.log(chalk.green(`✅ Operation Successful (${duration}s)`));
                    console.log(chalk.gray('Summary:'), result.notes);
                } else {
                    console.log(chalk.red(`❌ Operation Failed (${duration}s)`));
                    console.log(chalk.red('Error:'), result.error);
                }
            } catch (error) {
                console.log(chalk.red('CRITICAL ERROR:'), error.message);
            }
        });

    program
        .command('suggest <query>')
        .description('Ask AI for a shell command based on natural language')
        .action(async (query) => {
            console.log(`🧠 Thinking...`);
            try {
                const { completionService } = await import('../src/app/modules/ai/completion.service.js');
                const prompt = `Suggest a Windows PowerShell command to: ${query}`;
                const result = await completionService.complete(prompt, "");
                console.log(`\n> ${result.trim()}\n`);
            } catch (error) {
                console.error('Failed to get suggestion:', error.message);
            }
            process.exit(0);
        });

    program
        .command('explain <command>')
        .description('Ask AI to explain a shell command')
        .action(async (command) => {
            console.log(`🧠 Analyzing...`);
            try {
                const { completionService } = await import('../src/app/modules/ai/completion.service.js');
                const prompt = `Explain this command briefly: ${command}`;
                const result = await completionService.complete(prompt, "");
                console.log(`\n${result.trim()}\n`);
            } catch (error) {
                console.error('Failed to explain:', error.message);
            }
            process.exit(0);
        });

    program
        .command('do <goal>')
        .description('Execute a complex goal using Swarm Intelligence')
        .action(async (goal) => {
            console.log(chalk.cyan(`🐝 Swarm Activated: "${goal}"`));

            try {
                const { orchestratorAgent } = await import('../src/app/modules/agents/orchestrator.agent.js');
                const result = await orchestratorAgent.execute(goal);

                if (result.status === 'success') {
                    console.log(chalk.green('\n✅ Mission Accomplished!'));
                    result.completed_steps.forEach(step => {
                        console.log(chalk.gray(`- [Step ${step.id}] Success`));
                    });
                } else {
                    console.log(chalk.red('\n❌ Mission Failed'));
                    console.log(chalk.red(`Error: ${result.error}`));
                }

            } catch (error) {
                console.error(chalk.red('Swarm Error:'), error.message);
            }
            process.exit(0);
        });

    await program.parseAsync(process.argv);
}

main().catch(err => {
    console.error(chalk.red('FATAL CLI ERROR:'), err);
    process.exit(1);
});
