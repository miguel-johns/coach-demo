import fs from 'fs'; import zlib from 'zlib';
function extract(file, pre){
  const html=fs.readFileSync(file,'utf8');
  const po=html.match(/<script type="__bundler\/page_order">\s*([\s\S]*?)<\/script>/);
  const mf=html.match(/<script type="__bundler\/manifest">\s*([\s\S]*?)<\/script>/);
  const order=po?JSON.parse(po[1]):[];
  console.log(pre,'pages:',order.length, order.map(u=>u.slice(0,8)));
  if(mf){const m=JSON.parse(mf[1]); order.forEach((u,i)=>{const e=m[u]; if(!e)return; let b=Buffer.from(e.data,'base64'); if(e.compressed)b=zlib.gunzipSync(b); fs.writeFileSync(`${pre}_p${i}.html`,b); console.log(pre,'p'+i,u.slice(0,8),b.length);});}
}
extract('explor.html','ex');
extract('progress.html','pr');
