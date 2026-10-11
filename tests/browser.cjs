const fs = require('fs');
const path = require('path');
const base = process.env.ACCESSIBILITY_BASE_URL || 'http://127.0.0.1:8200';
const root = path.resolve(__dirname, '..');
const local = ['localhost','127.0.0.1','[::1]'].includes(new URL(base).hostname);
async function prepare(page) {
  await page.route('**/*', async route => {
    const request=route.request();const url=new URL(request.url());
    if(request.method()==='POST' && /\/(?:contact|book)\.php$/.test(url.pathname) && !local)
      return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Live delivery is disabled during the audit.'})});
    if(local && url.origin===new URL(base).origin && /\.(?:css|js|png|jpe?g|gif|webp|avif|mp4)$/i.test(url.pathname)) {
      const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
      if(!file.startsWith(root+path.sep)) return route.abort();
      if(fs.existsSync(file)) return route.fulfill({path:file});
      return route.fulfill({status:404,body:'Missing local asset'});
    }
    return route.continue();
  });
}
async function audit(page) {
  await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  return page.evaluate(async()=>{
    const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}});
    const summarize=items=>items.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));
    return {violations:summarize(r.violations),incomplete:summarize(r.incomplete),passes:r.passes.length};
  });
}
function save(name,result) {
  const dir=path.join(root,'.audit-artifacts');fs.mkdirSync(dir,{recursive:true});
  const file=path.join(dir,(local?'':'live-')+name+'.json');
  fs.writeFileSync(file,JSON.stringify({generated:new Date().toISOString(),base,assetSource:local?'local checkout':'production server',...result},null,2));
  return file;
}
module.exports={base,root,local,prepare,audit,save};
