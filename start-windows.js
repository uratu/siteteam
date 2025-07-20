// Windows startup script for production
process.env.NODE_ENV = 'production';
import('./dist/index.js');