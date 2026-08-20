import fs from 'node:fs';
import zlib from 'node:zlib';

// Re-parse the original bundle so we have uuid -> bytes for fonts + runtime,
// then inline everything into template.html to produce a clean self-contained file.
const bundleFile = process.argv[2];
const outFile = process.argv[3];
const html = fs.readFileSync(bundleFile, 'utf8');

function grab(type) {
  const re = new RegExp('<script type="' + type.replace(/[/]/g, '\\/') + '">([\\s\\S]*?)</script>', 'm');
  const m = html.match(re);
  return m ? m[1] : null;
}

const manifest = JSON.parse(grab('__bundler/manifest'));
let template = JSON.parse(grab('__bundler/template'));

function bytesFor(uuid) {
  const entry = manifest[uuid];
  let bytes = Buffer.from(entry.data, 'base64');
  if (entry.compressed) { try { bytes = zlib.gunzipSync(bytes); } catch (e) {} }
  return { bytes, mime: entry.mime };
}

// Inline every uuid reference (runtime script, fonts, images) as a data URI.
// Using a data: URI for the runtime <script src> avoids any </script>
// escaping problems that arise from inlining minified JS directly.
for (const uuid of Object.keys(manifest)) {
  if (!template.includes(uuid)) continue;
  const { bytes, mime } = bytesFor(uuid);
  const dataUri = 'data:' + mime + ';base64,' + bytes.toString('base64');
  template = template.split(uuid).join(dataUri);
}

fs.writeFileSync(outFile, template);
console.log('Wrote', outFile, '(' + template.length + ' bytes)');
console.log('Remaining bare uuids:', (template.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g) || []).length);
