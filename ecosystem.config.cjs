module.exports = {
  apps: [
    {
      name: "pakalale",
      script: "node_modules/.bin/tsx",
      args: "server.ts",
      instances: 1, // Single instance for WebSocket (sticky sessions)
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Restart settings
      max_memory_restart: "500M",
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 5000,

      // Logging
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "logs/error.log",
      out_file: "logs/output.log",
      merge_logs: true,

      // Watch (disabled in production)
      watch: false,

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: false,
    },
  ],
};
