import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Google Bazel Monorepo Generator Service.
 * Standard build tools (npm, webpack) are mathematically too slow for an AI generating
 * thousands of files per second. This service grants the Swarm the autonomy to transition
 * target codebases onto Google's legendary Bazel build system for microsecond incremental
 * compilations and mathematically guaranteed reproducibility.
 */
class GoogleBazelService {
    constructor() {
        logger.info('🏗️ [Bazel] Google Bazel Monorepo Generator initialized.');
    }

    /**
     * Dynamically generates a root WORKSPACE and BUILD.bazel for a node project.
     * @param {string} projectRoot - Absolute path to the repository
     */
    async initializeBazelWorkspace(projectRoot) {
        logger.info(`🏗️ [Bazel] Swarm is transitioning codebase at ${projectRoot} to Google Bazel...`);
        
        try {
            const workspaceContent = `workspace(name = "alti_swarm_monorepo")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Load rules_nodejs
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "c29e612cb7dbd111dc821eeaa6443c68339c1d19817fdf8075bc7b99320e49bb",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.8.0/rules_nodejs-core-5.8.0.tar.gz"],
)

load("@build_bazel_rules_nodejs//:repositories.bzl", "build_bazel_rules_nodejs_dependencies")
build_bazel_rules_nodejs_dependencies()

load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories", "yarn_install")
node_repositories(package_json = ["//:package.json"])
yarn_install(
    name = "npm",
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock",
)`;

            const buildBazelContent = `load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")

nodejs_binary(
    name = "server",
    entry_point = ":server.js",
    data = glob(["src/**", "config/**", "package.json"]),
)`;

            await fs.writeFile(path.join(projectRoot, 'WORKSPACE'), workspaceContent);
            await fs.writeFile(path.join(projectRoot, 'BUILD.bazel'), buildBazelContent);
            
            logger.info(`✅ [Bazel] Bazel WORKSPACE and BUILD.bazel successfully generated.`);
            return true;
        } catch (error) {
            logger.error(`❌ [Bazel] Failed to initialize Bazel workspace:`, error.message);
            return false;
        }
    }
}

export const bazelService = new GoogleBazelService();
