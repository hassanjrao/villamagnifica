const assert=require('assert/strict');
const http=require('http');
const base=process.env.FORM_TEST_BASE_URL||'http://127.0.0.1:8201';
assert(['127.0.0.1','localhost'].includes(new URL(base).hostname),'Delivery fixture tests must use localhost');
const post=(path,data)=>new Promise((resolve,reject)=>{const body=new URLSearchParams(data).toString();const r=http.request(base+path,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(body)}},res=>{let text='';res.on('data',d=>text+=d);res.on('end',()=>resolve({status:res.statusCode,body:JSON.parse(text)}));});r.on('error',reject);r.end(body);});
(async()=>{
 let r=await post('/temecula_wine_country/contact.php',{});assert.equal(r.status,422);assert.equal(Object.keys(r.body.errors).length,5);console.log('PASS contact field validation');
 r=await post('/temecula_wine_country/book.php',{fname:'Test',lname:'Audit',email:'audit@example.invalid',about:'Example',occasion:'Example',fdate:'2027-02-30',ldate:'2027-01-10',people:'25',hearabout:'Google',message:'Example'});assert.equal(r.status,422);assert(r.body.errors.fdate&&r.body.errors.people);console.log('PASS booking date and guest validation');
 r=await post('/temecula_wine_country/contact.php',{fname:['invalid'],lname:'Test',email:'bad',phone_number:'+1 (555) 123-4567',message:'Example'});assert.equal(r.status,422);assert(r.body.errors.email);console.log('PASS invalid email validation');
 const valid={fname:'<script>alert(1)</script>',lname:'Audit',email:'audit@example.invalid',phone_number:'+44 (0)20 1234 5678',message:'Example & characters',reason:'Google'};
 r=await post('/temecula_wine_country/contact.php',valid);assert.equal(r.status,process.env.EXPECT_DELIVERY_FAILURE?503:200);console.log('PASS contact delivery fixture and HTML escaping');
 for(const fname of ['Fixture failure','Fixture exception']){r=await post('/temecula_wine_country/contact.php',{...valid,fname});assert.equal(r.status,503);assert(!JSON.stringify(r.body).includes('Fixture'));}console.log('PASS delivery failure and exception handling');
 for(const prefix of ['/','/2/']){
  r=await post(prefix+'contact.php',{});assert.equal(r.status,422);assert.equal(Object.keys(r.body.errors).length,4);assert(!r.body.errors.phone_number);
  const {phone_number,...legacyFields}=valid;r=await post(prefix+'contact.php',legacyFields);assert.equal(r.status,process.env.EXPECT_DELIVERY_FAILURE?503:200);
 }console.log('PASS legacy contact endpoints accept their original four fields');
 r=await post('/temecula_wine_country/book.php',{fname:'Test',lname:'Audit',email:'audit@example.invalid',about:'Example',occasion:'Example',fdate:'2027-01-10',ldate:'2027-01-12',people:'12',hearabout:'Google',message:'Example'});assert.equal(r.status,process.env.EXPECT_DELIVERY_FAILURE?503:200);console.log('PASS booking delivery fixture');
})().catch(e=>{console.error(e);process.exitCode=1;});
