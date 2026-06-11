import { Octokit } from 'octokit';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

const octokit = new Octokit({
  auth:
    config.github_token ||
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
});

/**
 * Perform a global search on GitHub for open source code/repositories.
 * Strictly enforces MIT and Apache 2.0 licensing.
 */
const searchOpenSource = async (query, type = 'code', limit = 10) => {
  // Enforce open-source permissiveness
  const licenseFilter = 'license:mit license:apache-2.0';
  const searchQuery = `${query} ${licenseFilter}`;

  logger.info(
    `🔍 [GitHub Open Source] Searching global ${type} with query: ${searchQuery}`,
  );

  try {
    let results = [];
    if (type === 'repositories' || type === 'repo') {
      const response = await octokit.rest.search.repos({
        q: searchQuery,
        per_page: limit,
        sort: 'stars',
        order: 'desc',
      });
      results = response.data.items.map(repo => ({
        id: repo.id,
        name: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        license: repo.license?.name,
      }));
    } else {
      // Default to code search
      const response = await octokit.rest.search.code({
        q: searchQuery,
        per_page: limit,
      });
      results = response.data.items.map(item => ({
        name: item.name,
        path: item.path,
        repo: item.repository.full_name,
        url: item.html_url,
        raw_url: item.html_url.replace('/blob/', '/raw/'),
      }));
    }

    logger.info(`✅ [GitHub Open Source] Found ${results.length} results.`);
    return results;
  } catch (error) {
    logger.error('GitHub Open Source Search Failed:', error);
    throw error;
  }
};

/**
 * Get raw file content from an open source repository
 */
const getRawContent = async (owner, repo, path) => {
  try {
    const { data: content } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if (content.type === 'file' && content.content) {
      return Buffer.from(content.content, 'base64').toString('utf8');
    }
    return null;
  } catch (error) {
    logger.error(
      `Failed to fetch raw content for ${owner}/${repo}/${path}`,
      error,
    );
    throw error;
  }
};

export const GithubOpenSourceService = {
  searchOpenSource,
  getRawContent,
};
