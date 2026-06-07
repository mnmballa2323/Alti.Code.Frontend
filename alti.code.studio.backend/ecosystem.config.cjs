module.exports = {
  apps: [
    {
      name: "agent-factory",
      script: "npm",
      args: "run agent-factory",
      cwd: "/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "agentmemory",
      script: "npx",
      args: "-y @agentmemory/agentmemory",
      cwd: "/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "backend-server",
      script: "npm",
      args: "run start:dev",
      cwd: "/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend",
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      env: {
        NODE_ENV: "development"
      }
    },
    {
      name: "fazm-acp-bridge",
      script: "npm",
      args: "start",
      cwd: "/Users/michaelmeram/workspace/alti.code.studio/submodules/fazm/acp-bridge",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PORT: 7800
      }
    },
    {
      name: "browser-use-api",
      script: "/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend/browser-use-api/.venv/bin/uvicorn",
      args: "app:app --host 0.0.0.0 --port 3018",
      cwd: "/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend/browser-use-api",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || ""
      }
    }
  ]
};
