const {request}=require('playwright');
const assert=require('assert/strict');
const {base,save}=require('./browser.cjs');
(async()=>{
 const api=await request.newContext({baseURL:base,timeout:60000});const checks=[];
 try{
 for(const path of ['/contact.php','/book.php','/2/contact.php','/2/book.php','/temecula_wine_country/contact.php','/temecula_wine_country/book.php']){
  const r=await api.post(path,{form:{},headers:{Accept:'application/json'}});assert.equal(r.status(),422,path);const body=await r.json();const expected=path.endsWith('/book.php')?10:path.startsWith('/temecula_wine_country/')?5:4;assert.equal(Object.keys(body.errors).length,expected);checks.push({path,status:r.status(),passed:true});console.log('PASS invalid form validation',path);
 }
 for(const path of ['/.git','/tests/browser.cjs','/docs/accessibility.md','/temecula_wine_country/contact-test.php']){
  const r=await api.get(path);assert([403,404].includes(r.status()),path+' '+r.status());checks.push({path,status:r.status(),passed:true});console.log('PASS protected path',path,r.status());
 }
 }finally{console.log(save('deployment-report',{checks}));await api.dispose();}
})().catch(e=>{console.error(e);process.exitCode=1;});
