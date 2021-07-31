/* eslint-disable no-undef */
module.exports = {
  apps: [
    {
      name: 'bot-discord',
      script: 'dist/index.js',
      instances: 'max',
      max_memory_restart: '250M'
    }
  ]
};
