# OSS Agents Directory

This directory contains auto-synthesized specialist agents, one per open-source GitHub repository.

## How Agents Are Created

1. **Daily cron** (02:00 UTC) scans GitHub Trending
2. **OssAgentFactory** synthesizes an agent for each new trending repo
3. Agent is hot-loaded into CapabilityRouter immediately
4. Record is written to `data/oss_agents.json`
5. On restart, all agents are rehydrated from the registry

## File naming convention

`{owner}__{reponame}.agent.js` — e.g. `facebook__react.agent.js`

## Do not edit manually

These files are auto-generated. Use the REST API to force-create or delete agents:
- `POST /api/v1/oss-agents/create` — create for specific repo
- `DELETE /api/v1/oss-agents/:owner/:name` — remove
