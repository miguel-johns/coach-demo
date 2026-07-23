import fs from 'fs';
import zlib from 'zlib';
function extract(file, outPrefix) {
  const html = fs.readFileSync(file, 'utf8');
  const tmplMatch = html.match(/<script type="__bundler\/template">\s*([\s\S]*?)<\/script>/);
  const pageOrderMatch = html.match(/<script type="__bundler\/page_order">\s*([\s\S]*?)<\/script>/);
  const manifestMatch = html.match(/<script type="__bundler\/manifest">\s*([\s\S]*?)<\/script>/);
  let template = tmplMatch ? JSON.parse(tmplMatch[1]) : '';
  fs.writeFileSync(outPrefix + '_template.html', template);
  console.log(outPrefix, 'template length', template.length);
  const pageOrder = pageOrderMatch ? JSON.parse(pageOrderMatch[1]) : [];
  console.log(outPrefix, 'pageOrder', pageOrder.length);
  if (manifestMatch) {
    const manifest = JSON.parse(manifestMatch[1]);
    const pageSet = new Set(pageOrder);
    for (const uuid of Object.keys(manifest)) {
      const entry = manifest[uuid];
      if (!pageSet.has(uuid)) continue;
      let bytes = Buffer.from(entry.data, 'base64');
      if (entry.compressed) bytes = zlib.gunzipSync(bytes);
      fs.writeFileSync(outPrefix + '_page_' + uuid.slice(0,8) + '.html', bytes);
      console.log(outPrefix, 'page', uuid.slice(0,8), 'len', bytes.length);
    }
  }
}
extract('progress.html', 'progress');
extract('explor.html', 'explor');
