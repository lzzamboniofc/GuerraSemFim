/* Auditoria visual real: Chrome headless em dimensões de celular, tablet e desktop.
 * Requer playwright-core instalado apenas no CI; o jogo não precisa de dependências. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp'};
function serve(req,res){
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+pathname);
 if(!(file===root||file.startsWith(root+path.sep))){res.writeHead(403);res.end();return;}
 fs.readFile(file==='/'?path.join(root,'index.html'):file,(err,data)=>{
  if(err){res.writeHead(404);res.end(String(err));return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'text/plain');res.end(data);
 });
}
const routes=['village','fields','map','rivals','army','war','hero','quests','daily','worldEvents','campaign','reports','market','expansion','empire','settings'];
async function run(){
 const server=http.createServer(serve);
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/index.html';
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const failures=[];const dimensions=[360,390,600,900,920,959,960,1024,1366,1680];
 try{
  for(const width of dimensions){
   const context=await browser.newContext({viewport:{width,height:720},reducedMotion:'reduce'});
   const page=await context.newPage();
   page.on('pageerror',e=>failures.push(width+': erro JavaScript '+e.message));
   page.on('console',e=>{if(e.type()==='error')failures.push(width+': console '+e.text());});
   await page.goto(url,{waitUntil:'load'});
   await page.evaluate(()=>{state=E.newGame({speed:12,enemyAttacks:false});render();});
   for(const route of routes){
    const result=await page.evaluate(route=>{
     ui.page=route;ui.menuOpen=false;ui.modal=null;render();
     const content=document.querySelector('#game-content'),s=document.querySelector('.sidebar'),dock=document.querySelector('.nav-dock');
     const box=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
     return {
      heading:!!content.querySelector('.page-head h2'),
      sidebar:box(s),content:box(content),
      sidebarVisible:getComputedStyle(s).display!=='none',
      dockVisible:getComputedStyle(dock).display!=='none',
      horizontalOverflow:document.documentElement.scrollWidth>window.innerWidth+4,
      contentOverflows:content.scrollWidth>content.clientWidth+5
     };
    },route);
    if(!result.heading)failures.push(width+'/'+route+': título ausente');
    if(width<960&&result.sidebarVisible)failures.push(width+'/'+route+': sidebar deveria estar oculta');
    if(width<960&&!result.dockVisible)failures.push(width+'/'+route+': barra de atalhos ausente');
    if(width>=960&&!result.sidebarVisible)failures.push(width+'/'+route+': sidebar deveria estar visível');
    if(width>=960&&result.sidebar.right>result.content.left+1)failures.push(width+'/'+route+': menu sobrepõe conteúdo');
    if(result.horizontalOverflow)failures.push(width+'/'+route+': rolagem horizontal global');
    if(result.contentOverflows)failures.push(width+'/'+route+': conteúdo horizontal cortado');
   }
   if(width<960){
    await page.evaluate(()=>{ui.page='village';render();});
    await page.locator('[data-toggle-menu]').click();
    const sheet=await page.evaluate(()=>{
     const s=document.querySelector('.sidebar.nav-expanded');if(!s)return {shown:false};
     const r=s.getBoundingClientRect();
     const hit=document.elementFromPoint(r.left+r.width*.5,r.top+Math.min(34,r.height*.5));
     return {shown:getComputedStyle(s).display!=='none',inViewport:r.top>=0&&r.bottom<=innerHeight-40,onTop:hit===s||s.contains(hit),focused:s.contains(document.activeElement)};
    });
    if(!sheet.shown||!sheet.inViewport||!sheet.onTop||!sheet.focused)failures.push(width+': sobreposição/foco no menu Mais '+JSON.stringify(sheet));
    await page.locator('.sidebar.nav-expanded [data-nav="reports"]').click();
    const closed=await page.evaluate(()=>!ui.menuOpen&&ui.page==='reports');
    if(!closed)failures.push(width+': não fechou ao navegar');
    await page.locator('[data-toggle-menu]').click();
    await page.keyboard.press('Escape');
    if(await page.evaluate(()=>ui.menuOpen))failures.push(width+': Escape não fecha menu');
   }
   await page.evaluate(()=>{ui.page='village';ui.modal='help';render();});
   const modal=await page.evaluate(()=>{
    const m=document.querySelector('.modal-backdrop .modal'),r=m.getBoundingClientRect(),e=document.elementFromPoint(r.left+r.width/2,r.top+Math.min(r.height/2,120));
    return {visible:!!m&&getComputedStyle(m).display!=='none',top:e===m||m.contains(e)};
   });
   if(!modal.visible||!modal.top)failures.push(width+': modal encoberto '+JSON.stringify(modal));
   await page.keyboard.press('Escape');
   if(await page.evaluate(()=>ui.modal!==null))failures.push(width+': Escape não fecha modal');
   // Exercita o fluxo que antes perdia a quantidade digitada ao renderizar.
   await page.evaluate(()=>{ui.page='market';ui.modal=null;E.active(state).buildings.marketplace=1;render();});
   await page.locator('#trade-from').selectOption('wood');
   await page.locator('#trade-to').selectOption('clay');
   await page.locator('#trade-amount').fill('150');
   const previous=await page.evaluate(()=>({...E.active(state).resources}));
   await page.locator('[data-trade]').click();
   const tradeResult=await page.evaluate(()=>({
    resources:E.active(state).resources,
    amount:document.querySelector('#trade-amount')?.value,
    from:document.querySelector('#trade-from')?.value,
    to:document.querySelector('#trade-to')?.value
   }));
   if(tradeResult.resources.wood!==previous.wood-150||tradeResult.resources.clay!==previous.clay+150||
      tradeResult.amount!=='150'||tradeResult.from!=='wood'||tradeResult.to!=='clay')
    failures.push(width+': troca ou formulário não preservado '+JSON.stringify(tradeResult));
   // Valida abertura de modal de construção e foco para teclado.
   await page.evaluate(()=>{ui.page='village';render();});
   await page.locator('[data-slot="0"]').first().click();
   const buildingModal=await page.evaluate(()=>({modal:ui.modal,focus:document.activeElement?.classList?.contains('dialog-close')}));
   if(buildingModal.modal!=='building'||!buildingModal.focus)failures.push(width+': modal de construção inacessível '+JSON.stringify(buildingModal));
   await page.keyboard.press('Escape');
   if(width===390||width===960||width===1366){
    fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});
    await page.evaluate(()=>{ui.page='village';ui.modal=null;render();});
    const pic=await page.locator('.stage-illustration').evaluate(el=>({ok:el.complete&&el.naturalWidth>0,src:el.getAttribute('src'),width:el.naturalWidth}));
    if(!pic.ok||!pic.src.includes('village-stages/'))failures.push(width+': ilustração da aldeia ausente '+JSON.stringify(pic));
    if(await page.locator('.life-walker,.scene-vitality').count())failures.push(width+': animações antigas ainda presentes');
    await page.screenshot({path:path.join(root,'artifacts','aldeia-estagios-'+width+'.png'),fullPage:true,animations:'disabled'});
    await page.evaluate(()=>{ui.page='fields';render();});
    if(await page.locator('.life-ground,.field-ground').count())failures.push(width+': cenário animado antigo persistiu');
    await page.screenshot({path:path.join(root,'artifacts','campos-estaticos-'+width+'.png'),fullPage:true,animations:'disabled'});
    await page.evaluate(()=>{ui.page='worldEvents';render();});
    await page.screenshot({path:path.join(root,'artifacts','revisao-'+width+'.png'),fullPage:true,animations:'disabled'});
   }
   await context.close();
  }
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
 assert.deepEqual(failures,[],'Falhas de layout e navegação: \n'+failures.join('\n'));
 console.log('✓ Chrome: 10 larguras × 16 telas, menu Mais, camadas de modal, foco e Escape');
}
run().catch(err=>{console.error(err);process.exitCode=1;});
