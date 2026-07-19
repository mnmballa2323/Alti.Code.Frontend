module.exports = {
  apps: [
    {
      name: "agent-factory",
      script: "npm",
      args: "run agent-factory",
      cwd: ".",
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
      cwd: ".",
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
      cwd: ".",
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
      cwd: "../submodules/fazm/acp-bridge",
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
      script: "./browser-use-api/.venv/bin/uvicorn",
      args: "app:app --host 0.0.0.0 --port 3018",
      cwd: "./browser-use-api",
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
