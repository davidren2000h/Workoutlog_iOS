const sharp = require('sharp');
const path = require('path');

function makeSvg(w, h, title, subtitle) {
  return Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
    '<rect width="' + w + '" height="' + h + '" fill="#1a1a2e"/>' +
    '<circle cx="' + (w / 2) + '" cy="' + Math.round(h * 0.3) + '" r="70" fill="none" stroke="#00d4aa" stroke-width="14"/>' +
    '<rect x="' + (w / 2 - 28) + '" y="' + Math.round(h * 0.3 - 46) + '" width="56" height="92" rx="10" fill="#00d4aa"/>' +
    '<rect x="' + (w / 2 - 52) + '" y="' + Math.round(h * 0.3 - 16) + '" width="104" height="32" rx="8" fill="#00d4aa"/>' +
    '<text x="' + (w / 2) + '" y="' + Math.round(h * 0.55) + '" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="48" fill="white">' + title + '</text>' +
    '<text x="' + (w / 2) + '" y="' + Math.round(h * 0.65) + '" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="28" fill="#aaa">' + subtitle + '</text>' +
    '</svg>'
  );
}

const outDir = path.join(__dirname, '..', 'public');

Promise.all([
  sharp(makeSvg(1290, 2796, 'Pure Workout Log', 'No Ads | No IAP'))
    .png().toFile(path.join(outDir, 'screenshot-narrow.png')),
  sharp(makeSvg(2048, 1536, 'Pure Workout Log', 'No Ads | No IAP'))
    .png().toFile(path.join(outDir, 'screenshot-wide.png')),
]).then(() => {
  console.log('Screenshots generated: public/screenshot-narrow.png, public/screenshot-wide.png');
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
