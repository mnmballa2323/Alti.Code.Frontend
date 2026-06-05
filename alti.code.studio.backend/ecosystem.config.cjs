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
    }
  ]
};
