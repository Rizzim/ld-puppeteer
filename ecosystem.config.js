module.exports = {
  apps: [{
    name: 'ld-puppeteer',
    script: './server.js',
    cwd: '/home/n12c975/nodejs-projects/ld-puppeteer',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};