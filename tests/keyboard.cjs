const {chromium}=require('playwright');
const assert=require('assert/strict');
const {base,local,prepare,audit,save,root}=require('./browser.cjs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:375,height:812}});await prepare(page);
 page.setDefaultNavigationTimeout(60000);
 const checks=[],audits=[];
 const check=async(name,fn)=>{await fn();checks.push({name,passed:true});console.log('PASS',name);};
 const openAudit=async(name)=>{const r=await audit(page);audits.push({name,...r});assert.equal(r.violations.length,0,JSON.stringify(r.violations));};
 const go=path=>page.goto(base+'/temecula_wine_country/'+path,{waitUntil:'domcontentloaded'});
 try{
 await go('');
 await check('Skip link reaches main content',async()=>{await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').textContent(),'Skip to main content');await page.keyboard.press('Enter');assert.equal(await page.locator(':focus').getAttribute('id'),'main-content');});
 const menu=page.locator('.navbar-toggler');
 await check('Mobile menu opens with Space and closes with Escape',async()=>{await menu.focus();await page.keyboard.press('Space');assert.equal(await menu.getAttribute('aria-expanded'),'true');await openAudit('mobile menu');await page.screenshot({path:root+'/.audit-artifacts/'+(local?'':'live-')+'mobile-menu.png'});await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.equal(await page.locator(':focus').getAttribute('class'),await menu.getAttribute('class'));});
 await check('Dropdown opens with Enter and restores focus on Escape',async()=>{await menu.click();const dropdown=page.getByRole('button',{name:'Gallery',exact:true});await dropdown.focus();await page.keyboard.press('Enter');assert.equal(await dropdown.getAttribute('aria-expanded'),'true');await openAudit('gallery dropdown');await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').textContent(),'The Rooms');await page.keyboard.press('Escape');assert.equal(await dropdown.getAttribute('aria-expanded'),'false');assert.equal((await page.locator(':focus').textContent()).trim(),'Gallery');await page.keyboard.press('Escape');});
 await check('Slideshow stays still and changes with keyboard controls',async()=>{const active=page.locator('#site_gallery_carousel .active');const before=await active.getAttribute('aria-label');await page.waitForTimeout(2300);assert.equal(await active.getAttribute('aria-label'),before);const next=page.locator('[data-carousel="site_gallery_carousel"][data-direction="next"]');await next.focus();await page.keyboard.press('Space');assert.notEqual(await active.getAttribute('aria-label'),before);assert.equal(await page.locator('#site_gallery_carousel .carousel-item:not(.active):not([inert])').count(),0);assert.match(await page.locator('.carousel-status').first().textContent(),/Photo 2/);});
 await check('Contact errors are visible, announced and focusable',async()=>{await page.locator('#requestform [type="submit"]').click();assert.equal(await page.locator(':focus').getAttribute('id'),'form-status-requestform');assert.equal(await page.locator('[aria-invalid="true"]').count(),5);await openAudit('contact errors');await page.locator('.form-status a').first().click();assert.equal(await page.locator(':focus').getAttribute('id'),'fname');});
 await check('International phone numbers are accepted',async()=>{const phone=page.locator('#phone_number');await phone.fill('+44 (0)20 7946 0018');assert.equal(await phone.evaluate(f=>f.validity.valid),true);assert.equal(await phone.getAttribute('autocomplete'),'tel');});
 await go('instructions.html');
 await check('Video viewer isolates focus and restores its opener',async()=>{
 const link=page.locator('main a[data-fancybox]').first();await link.click();const dialog=page.locator('dialog');assert.equal(await dialog.evaluate(d=>d.open),true);assert.equal(await dialog.locator('video').getAttribute('controls'),'');assert.equal(await dialog.locator('video').getAttribute('autoplay'),null);
 await openAudit('video viewer');for(let i=0;i<8;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.querySelector('dialog').contains(document.activeElement)),true);}await page.keyboard.press('Escape');assert.equal(await dialog.evaluate(d=>d.open),false);assert.equal(await page.locator(':focus').getAttribute('href'),await link.getAttribute('href'));
 });
 await page.goto(base+'/2/book-now.html',{waitUntil:'domcontentloaded'});
 await check('Booking form labels and error links cover every required field',async()=>{await page.locator('#booknowform [type="submit"]').click();assert.equal(await page.locator('[aria-invalid="true"]').count(),10);await openAudit('booking errors');assert.equal(await page.locator(':focus').getAttribute('id'),'form-status-booknowform');});
 await check('Booking rejects reversed dates and too many guests',async()=>{
 for(const [id,value] of Object.entries({fname:'Audit',lname:'Example',email:'audit@example.invalid',about:'Example',occasion:'Example',fdate:'2027-01-10',ldate:'2027-01-09',people:'25',message:'Example'}))await page.locator('#'+id).fill(value);
 await page.locator('#hear-about-villa').selectOption({label:'Google'});await page.locator('[type="submit"]').click();assert.match(await page.locator('#ldate-error').textContent(),/on or after/);assert.match(await page.locator('#people-error').textContent(),/between 1 and 24/);
 });
 await check('Delivery failure preserves entries and re-enables submission',async()=>{
 await page.locator('#ldate').fill('2027-01-11');await page.locator('#people').fill('12');await page.route('**/book.php',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Delivery unavailable. Please try again.'})}));await page.locator('[type="submit"]').click();await page.waitForFunction(()=>document.querySelector('.form-status').textContent.includes('Delivery unavailable'));assert.equal(await page.locator('#fname').inputValue(),'Audit');assert.equal(await page.locator('[type="submit"]').isEnabled(),true);assert.equal(await page.locator(':focus').getAttribute('id'),'form-status-booknowform');await page.unroute('**/book.php');
 });
 await check('Successful response announces confirmation and clears entries',async()=>{
 await page.route('**/book.php',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({message:'Thanks for contacting us.'})}));await page.locator('[type="submit"]').click();await page.waitForFunction(()=>document.querySelector('.form-status').textContent.includes('Thanks'));assert.equal(await page.locator('#fname').inputValue(),'');assert.equal(await page.locator('.form-status').getAttribute('role'),'status');await page.unroute('**/book.php');
 });
 await go('temecula.html');
 await check('Grocery disclosure opens with a keyboard and updates its state',async()=>{const toggle=page.getByRole('button',{name:'Grocery',exact:true});await toggle.focus();await page.keyboard.press('Space');assert.equal(await toggle.getAttribute('aria-expanded'),'true');assert.equal(await page.locator('#navbarToggleExternalContent').isVisible(),true);await openAudit('grocery details');});
 await page.emulateMedia({reducedMotion:'reduce'});await go('');
 await check('Reduced motion disables slideshow animation',async()=>{assert.equal(await page.locator('.carousel-item').first().evaluate(el=>getComputedStyle(el).animationName),'none');});
 await check('Page fits a 320 pixel viewport',async()=>{await page.setViewportSize({width:320,height:800});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);});
 }finally{console.log(save('keyboard-report',{checks,audits}));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
