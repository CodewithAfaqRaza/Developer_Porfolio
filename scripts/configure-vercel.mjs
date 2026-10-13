import { writeFileSync } from 'node:fs';
import { SITE_HEADERS } from '../server/site-security.ts';
const config = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  framework: 'vite', buildCommand: 'npm run build', outputDirectory: 'dist',
  functions: { 'api/index.ts': { maxDuration: 30 } },
  rewrites: [
    { source: '/api/:path*', destination: '/api?route=:path*' },
    { source: '/admin', destination: '/index.html' },
    { source: '/admin/', destination: '/index.html' },
  ],
  headers: [{ source: '/((?!api(?:/|$)).*)', headers: Object.entries(SITE_HEADERS).map(([key, value]) => ({ key, value })) }],
  crons: [{ path: '/api/maintenance', schedule: '15 3 * * *' }],
};
writeFileSync('vercel.json', JSON.stringify(config, null, 2) + '\n');
console.log('Updated Vercel routing, security headers and daily retention schedule.');
