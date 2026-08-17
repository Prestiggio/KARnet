module.exports = {
  apps: [
    {
      name: 'karnet-developers',
      script: '.next/standalone/server.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
}
