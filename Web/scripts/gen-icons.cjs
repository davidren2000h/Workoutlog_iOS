const sharp = require('sharp');
const path = require('path');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#1a1a2e"/>
  <circle cx="256" cy="190" r="90" fill="none" stroke="#00d4aa" stroke-width="18"/>
  <rect x="220" y="130" width="72" height="120" rx="12" fill="#00d4aa"/>
  <rect x="190" y="170" width="132" height="40" rx="10" fill="#00d4aa"/>
  <text x="256" y="370" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="68" fill="white">Workout</text>
  <text x="256" y="440" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="68" fill="#00d4aa">Log</text>
</svg>`;

const buf = Buffer.from(svg);
const outDir = path.join(__dirname, '..', 'public');

Promise.all([
  sharp(buf).resize(192, 192).png().toFile(path.join(outDir, 'pwa-192.png')),
  sharp(buf).resize(512, 512).png().toFile(path.join(outDir, 'pwa-512.png')),
]).then(() => {
  console.log('Icons generated: public/pwa-192.png, public/pwa-512.png');
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
