const {chromium}=require('playwright');
const fs=require('fs');
const {base,root,prepare,audit,save}=require('./browser.cjs');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const mobile=process.argv.includes('--mobile');
  const reflow=process.argv.includes('--reflow');
  const enlarged=process.argv.includes('--text-enlarged');
  const all=process.argv.includes('--all');
  const viewport=reflow?{width:320,height:800}:mobile?{width:375,height:812}:{width:1280,height:720};
  const page=await browser.newPage({viewport});await prepare(page);
  const args=process.argv.slice(2).filter(arg=>!arg.startsWith('--'));
  const routes=args.length?args:all?['/',...['','2/','temecula_wine_country/'].flatMap(dir=>fs.readdirSync(root+'/'+dir).filter(f=>f.endsWith('.html')).map(f=>'/'+dir+f))]:['/temecula_wine_country/',...fs.readdirSync(root+'/temecula_wine_country').filter(f=>f.endsWith('.html')&&f!=='index.html').map(f=>'/temecula_wine_country/'+f)];
  const results=[];
  for(const route of routes){
    const errors=[],resourceFailures=[];
    const onError=e=>errors.push(e.message);
    const onFailure=request=>{const url=new URL(request.url());resourceFailures.push({host:url.hostname,path:url.pathname,error:request.failure()?.errorText});};
    page.on('pageerror',onError);page.on('requestfailed',onFailure);
    const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForTimeout(1500);
    if(enlarged){await page.addStyleTag({content:'html { font-size: 200% !important; }'});await page.waitForTimeout(100);}
    const result=await audit(page);
    const headings=await page.locator('h1').count();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    results.push({route,url:page.url(),status:response.status(),errors,resourceFailures,headings,overflow,...result});
    console.log(route,JSON.stringify({status:response.status(),errors,violations:result.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),headings,overflow}));
    page.off('pageerror',onError);page.off('requestfailed',onFailure);
  }
  console.log(save((all?'all-':'')+(enlarged?'axe-text-enlarged-report':reflow?'axe-reflow-report':mobile?'axe-mobile-report':'axe-report'),{viewport,textSize:enlarged?'200%':'100%',results}));
  await browser.close();
  if(results.some(r=>r.status!==200||r.violations.length||r.errors.length||r.headings!==1||r.overflow))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
