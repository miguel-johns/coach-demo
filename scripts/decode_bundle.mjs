import fs from 'node:fs';
import zlib from 'node:zlib';

const file = process.argv[2];
const outDir = process.argv[3] || '/tmp/decoded';
const html = fs.readFileSync(file, 'utf8');

function grab(type) {
  const re = new RegExp('<script type="' + type.replace(/[/]/g, '\\/') + '">([\\s\\S]*?)</script>', 'm');
  const m = html.match(re);
  return m ? m[1] : null;
}

const manifestRaw = grab('__bundler/manifest');
const templateRaw = grab('__bundler/template');
const manifest = JSON.parse(manifestRaw);
const template = JSON.parse(templateRaw);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outDir + '/template.html', template);

let count = 0;
for (const [uuid, entry] of Object.entries(manifest)) {
  let bytes = Buffer.from(entry.data, 'base64');
  if (entry.compressed) {
    try { bytes = zlib.gunzipSync(bytes); } catch (e) { /* leave */ }
  }
  // Save text-like assets
  const mime = entry.mime || '';
  const isText = /text|javascript|json|jsx|babel|ecmascript|xml|svg/.test(mime);
  const ext = mime.includes('javascript') ? 'js'
    : mime.includes('babel') ? 'jsx'
    : mime.includes('json') ? 'json'
    : mime.includes('css') ? 'css'
    : mime.includes('svg') ? 'svg'
    : mime.split('/')[1] || 'bin';
  fs.writeFileSync(`${outDir}/asset_${count}_${uuid.slice(0,8)}.${ext}`, isText ? bytes.toString('utf8') : bytes);
  console.log(`${count}\t${mime}\t${bytes.length}b\t${uuid.slice(0,8)}`);
  count++;
}
console.log('template.html bytes:', template.length);
