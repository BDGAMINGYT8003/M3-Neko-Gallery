
// Entry point that starts the development server
import { spawn } from 'child_process';

const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
});

process.on('SIGTERM', () => {
  server.kill();
});

process.on('SIGINT', () => {
  server.kill();
});
