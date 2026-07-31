const app = require('./app');
const http = require('http');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  Shop Backend Server running on http://localhost:${PORT}`);
  console.log(`  Database initialized & API endpoints active.`);
  console.log(`==================================================`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server gracefully...');
  server.close(() => {
    process.exit(0);
  });
});
