/**
 * Copyright (c) 2024 Inso Code
 *
 * github.trending.service.js — GitHub Trending Scanner
 *
 * Scrapes GitHub Trending daily to discover new high-star repos.
 * No API key required for basic scraping. Optional GITHUB_TOKEN
 * for higher rate limits on Search API fallback.
 *
 * Sources (in priority order):
 *   1. gh-trending-api (public npm package wrapper)
 *   2. GitHub Search REST API (sorted by stars, pushed yesterday)
 *   3. Hardcoded popular repos list (last-resort fallback)
 */

import { logger } from '../../../shared/logger.js';
import https from 'https';
import http from 'http';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/** @typedef {{ slug: string, fullName: string, owner: string, name: string, description: string, url: string, language: string, stars: number, starsToday: number, topics: string[], readme: string }} TrendingRepo */

export class GitHubTrendingService {
  constructor() {
    this.name = 'GitHubTrendingService';
    /** @type {Map<string, { data: TrendingRepo[], fetchedAt: number }>} */
    this._cache = new Map();
  }

  /**
   * Fetch today's trending repos.
   * @param {string} [language] - Filter by language (e.g. 'javascript')
   * @param {'daily'|'weekly'|'monthly'} [since='daily']
   * @returns {Promise<TrendingRepo[]>}
   */
  async scanTrending(language = '', since = 'daily') {
    const cacheKey = `${language}:${since}`;
    const cached = this._cache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      logger.info(
        `📊 GitHubTrending: Returning cached results (${cached.data.length} repos)`,
      );
      return cached.data;
    }

    logger.info(
      `📊 GitHubTrending: Scanning trending repos (language=${language || 'all'}, since=${since})…`,
    );

    let repos = [];

    // Source 1: Try the trending JSON API
    try {
      repos = await this._fetchFromTrendingApi(language, since);
      logger.info(
        `📊 GitHubTrending: Got ${repos.length} repos from trending API`,
      );
    } catch (err) {
      logger.warn(
        `📊 GitHubTrending: Trending API failed — ${err.message}. Trying GitHub Search…`,
      );
    }

    // Source 2: GitHub Search API fallback
    if (repos.length === 0) {
      try {
        repos = await this._fetchFromGitHubSearch(language);
        logger.info(
          `📊 GitHubTrending: Got ${repos.length} repos from GitHub Search API`,
        );
      } catch (err) {
        logger.warn(
          `📊 GitHubTrending: GitHub Search failed — ${err.message}. Using popular fallback.`,
        );
      }
    }

    // Source 3: Popular repos list as last resort
    if (repos.length === 0) {
      repos = this._getPopularFallback(language);
      logger.info(
        `📊 GitHubTrending: Using ${repos.length} popular fallback repos`,
      );
    }

    this._cache.set(cacheKey, { data: repos, fetchedAt: Date.now() });
    return repos;
  }

  /**
   * Return only repos not already in the known slugs set.
   * @param {string[]} knownSlugs - e.g. ['facebook/react', 'vuejs/vue']
   * @param {string} [language]
   * @returns {Promise<TrendingRepo[]>}
   */
  async getNewRepos(knownSlugs, language = '') {
    const known = new Set(knownSlugs);
    const all = await this.scanTrending(language);
    return all.filter(r => !known.has(r.slug));
  }

  /**
   * Fetch README content for a repo.
   * @param {string} fullName - e.g. 'facebook/react'
   * @returns {Promise<string>} README content (truncated to 4000 chars)
   */
  async fetchReadme(fullName) {
    const branches = ['main', 'master'];
    for (const branch of branches) {
      try {
        const url = `https://raw.githubusercontent.com/${fullName}/${branch}/README.md`;
        const content = await this._httpGet(url);
        // Strip HTML and excessive whitespace, cap at 4000 chars
        const cleaned = content
          .replace(/<[^>]+>/g, '')
          .replace(/\!\[.*?\]\(.*?\)/g, '') // remove images
          .replace(/\n{3,}/g, '\n\n')
          .trim()
          .substring(0, 4000);
        return cleaned;
      } catch {
        /* try next branch */
      }
    }
    return ''; // no README found
  }

  // ── Private: Fetch from public trending API ──────────────────────────────

  async _fetchFromTrendingApi(language, since) {
    const langParam = language
      ? `?language=${encodeURIComponent(language)}&since=${since}`
      : `?since=${since}`;
    const url = `https://gh-trending-api.herokuapp.com/repositories${langParam}`;
    const raw = await this._httpGet(url);
    const items = JSON.parse(raw);

    return items.slice(0, 50).map(item => ({
      slug:
        item.url?.replace('https://github.com/', '') ||
        `${item.author}/${item.name}`,
      fullName: `${item.author}/${item.name}`,
      owner: item.author,
      name: item.name,
      description: item.description || '',
      url: item.url || `https://github.com/${item.author}/${item.name}`,
      language: item.language || 'Unknown',
      stars: item.stars || 0,
      starsToday: item.currentPeriodStars || 0,
      topics: item.builtBy?.map(b => b.username) || [],
      readme: '',
    }));
  }

  // ── Private: GitHub Search API fallback ──────────────────────────────────

  async _fetchFromGitHubSearch(language) {
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];
    const langFilter = language
      ? `+language:${encodeURIComponent(language)}`
      : '';
    const query = encodeURIComponent(`pushed:>${yesterday}${langFilter}`);
    const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=50`;

    const headers = {
      'User-Agent': 'Inso Code/7.7.0',
      Accept: 'application/vnd.github.v3+json',
    };
    if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`;

    const raw = await this._httpGet(url, headers);
    const data = JSON.parse(raw);

    return (data.items || []).map(item => ({
      slug: item.full_name,
      fullName: item.full_name,
      owner: item.owner.login,
      name: item.name,
      description: item.description || '',
      url: item.html_url,
      language: item.language || 'Unknown',
      stars: item.stargazers_count || 0,
      starsToday: 0,
      topics: item.topics || [],
      readme: '',
    }));
  }

  // ── Private: Popular curated fallback ────────────────────────────────────

  _getPopularFallback(language) {
    const all = [
      {
        slug: 'facebook/react',
        name: 'react',
        owner: 'facebook',
        description: 'The library for web and native user interfaces',
        language: 'JavaScript',
        stars: 227000,
        url: 'https://github.com/facebook/react',
        topics: ['react', 'javascript', 'ui'],
      },
      {
        slug: 'vuejs/vue',
        name: 'vue',
        owner: 'vuejs',
        description: 'Progressive JavaScript Framework',
        language: 'JavaScript',
        stars: 209000,
        url: 'https://github.com/vuejs/vue',
        topics: ['vue', 'javascript', 'framework'],
      },
      {
        slug: 'angular/angular',
        name: 'angular',
        owner: 'angular',
        description: 'Deliver web apps with confidence',
        language: 'TypeScript',
        stars: 96000,
        url: 'https://github.com/angular/angular',
        topics: ['angular', 'typescript'],
      },
      {
        slug: 'sveltejs/svelte',
        name: 'svelte',
        owner: 'sveltejs',
        description: 'Cybernetically enhanced web apps',
        language: 'JavaScript',
        stars: 81000,
        url: 'https://github.com/sveltejs/svelte',
        topics: ['svelte', 'javascript'],
      },
      {
        slug: 'fastapi/fastapi',
        name: 'fastapi',
        owner: 'fastapi',
        description: 'FastAPI framework, high performance',
        language: 'Python',
        stars: 82000,
        url: 'https://github.com/fastapi/fastapi',
        topics: ['fastapi', 'python', 'api'],
      },
      {
        slug: 'django/django',
        name: 'django',
        owner: 'django',
        description: 'The Web framework for perfectionists',
        language: 'Python',
        stars: 81000,
        url: 'https://github.com/django/django',
        topics: ['django', 'python'],
      },
      {
        slug: 'nestjs/nest',
        name: 'nest',
        owner: 'nestjs',
        description: 'A progressive Node.js framework',
        language: 'TypeScript',
        stars: 68000,
        url: 'https://github.com/nestjs/nest',
        topics: ['nestjs', 'nodejs', 'typescript'],
      },
      {
        slug: 'denoland/deno',
        name: 'deno',
        owner: 'denoland',
        description: 'A modern runtime for JavaScript and TypeScript',
        language: 'Rust',
        stars: 96000,
        url: 'https://github.com/denoland/deno',
        topics: ['deno', 'typescript'],
      },
      {
        slug: 'tensorflow/tensorflow',
        name: 'tensorflow',
        owner: 'tensorflow',
        description: 'An Open Source Machine Learning Framework',
        language: 'Python',
        stars: 187000,
        url: 'https://github.com/tensorflow/tensorflow',
        topics: ['tensorflow', 'ml', 'ai'],
      },
      {
        slug: 'pytorch/pytorch',
        name: 'pytorch',
        owner: 'pytorch',
        description: 'Tensors and Dynamic neural networks in Python',
        language: 'Python',
        stars: 85000,
        url: 'https://github.com/pytorch/pytorch',
        topics: ['pytorch', 'deep-learning'],
      },
      {
        slug: 'huggingface/transformers',
        name: 'transformers',
        owner: 'huggingface',
        description: 'State-of-the-art ML for Pytorch, TensorFlow, and JAX',
        language: 'Python',
        stars: 138000,
        url: 'https://github.com/huggingface/transformers',
        topics: ['huggingface', 'transformers', 'nlp'],
      },
      {
        slug: 'langchain-ai/langchain',
        name: 'langchain',
        owner: 'langchain-ai',
        description: 'Building applications with LLMs through composability',
        language: 'Python',
        stars: 100000,
        url: 'https://github.com/langchain-ai/langchain',
        topics: ['langchain', 'llm', 'ai'],
      },
      {
        slug: 'google/jax',
        name: 'jax',
        owner: 'google',
        description: 'Composable transformations of Python+NumPy programs: differentiate, compile, parallelize',
        language: 'Python',
        stars: 32000,
        url: 'https://github.com/google/jax',
        topics: ['google', 'jax', 'machine-learning'],
      },
      {
        slug: 'ggerganov/llama.cpp',
        name: 'llama.cpp',
        owner: 'ggerganov',
        description: 'LLM inference in C/C++',
        language: 'C++',
        stars: 72000,
        url: 'https://github.com/ggerganov/llama.cpp',
        topics: ['llama', 'llm', 'cpp'],
      },
      {
        slug: 'vercel/next.js',
        name: 'next.js',
        owner: 'vercel',
        description: 'The React Framework',
        language: 'JavaScript',
        stars: 128000,
        url: 'https://github.com/vercel/next.js',
        topics: ['nextjs', 'react', 'framework'],
      },
      {
        slug: 'vitejs/vite',
        name: 'vite',
        owner: 'vitejs',
        description: 'Next generation frontend tooling',
        language: 'TypeScript',
        stars: 69000,
        url: 'https://github.com/vitejs/vite',
        topics: ['vite', 'build-tool'],
      },
      {
        slug: 'microsoft/vscode',
        name: 'vscode',
        owner: 'microsoft',
        description: 'Visual Studio Code',
        language: 'TypeScript',
        stars: 165000,
        url: 'https://github.com/microsoft/vscode',
        topics: ['vscode', 'editor'],
      },
      {
        slug: 'kubernetes/kubernetes',
        name: 'kubernetes',
        owner: 'kubernetes',
        description: 'Production-Grade Container Scheduling',
        language: 'Go',
        stars: 111000,
        url: 'https://github.com/kubernetes/kubernetes',
        topics: ['kubernetes', 'k8s'],
      },
      {
        slug: 'hashicorp/terraform',
        name: 'terraform',
        owner: 'hashicorp',
        description: 'Terraform enables you to safely and predictably create',
        language: 'Go',
        stars: 43000,
        url: 'https://github.com/hashicorp/terraform',
        topics: ['terraform', 'iac'],
      },
      {
        slug: 'supabase/supabase',
        name: 'supabase',
        owner: 'supabase',
        description: 'The open source Firebase alternative',
        language: 'TypeScript',
        stars: 77000,
        url: 'https://github.com/supabase/supabase',
        topics: ['supabase', 'database', 'postgres'],
      },
    ].map(r => ({ ...r, fullName: r.slug, starsToday: 0, readme: '' }));

    if (!language) return all;
    return all.filter(r => r.language.toLowerCase() === language.toLowerCase());
  }

  // ── Utility ───────────────────────────────────────────────────────────────

  _httpGet(url, headers = {}) {
    return new Promise((resolve, reject) => {
      const lib = url.startsWith('https') ? https : http;
      const req = lib.get(
        url,
        {
          headers: { 'User-Agent': 'Inso Code/7.7.0', ...headers },
          timeout: 10000,
        },
        res => {
          if (
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            return this._httpGet(res.headers.location, headers)
              .then(resolve)
              .catch(reject);
          }
          if (res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          }
          const chunks = [];
          res.on('data', c => chunks.push(c));
          res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        },
      );
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Timeout: ${url}`));
      });
    });
  }

  /** Clear cache (useful for testing) */
  clearCache() {
    this._cache.clear();
  }
}

export const gitHubTrendingService = new GitHubTrendingService();
