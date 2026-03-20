module.exports = {
  apps: [
    {
      name: 'eda-backend',
      script: './dist/index.js',
      instances: 'max', // Scale to max CPU cores
      exec_mode: 'cluster', // Enables PM2 cluster mode for load balancing
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      }
    }
  ]
};
