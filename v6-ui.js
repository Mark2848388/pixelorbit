/* Pixel Orbit Infinite v6 — home dashboard, pilot cosmetics and event boss */
(()=>{'use strict';
 const $=id=>document.getElementById(id),PO=window.PO;
 if(!PO?.S)return;
 const skins=[
  {id:'alien',name:'НЕОНОВЫЙ ПИЛОТ',cost:0,color:'#ef78dc',desc:'Классический розовый инопланетянин'},
  {id:'ember',name:'ПЛАМЕННЫЙ',cost:450,color:'#ff9a45',desc:'Огненная броня'},
  {id:'ice',name:'КРИО-ПИЛОТ',cost:700,color:'#8cecff',desc:'Ледяной кристалл'},
  {id:'royal',name:'КОРОЛЕВСКИЙ',cost:1100,color:'#ffd36b',desc:'Золотая корона'},
  {id:'void',name:'СТРАННИК ПУСТОТЫ',cost:1600,color:'#a99aff',desc:'Энергия далёкой галактики'},
  {id:'nechaev',name:'СЕРГЕЙ НЕЧАЕВ',cost:2200,color:'#e04545',desc:'Atomic Heart · красный костюм'},
  {id:'halloween',name:'ХЕЛЛОУИН',cost:1800,color:'#ff8a20',desc:'Тыквенный инопланетянин'},
  {id:'cat',name:'ИНОПЛАНЕТНЫЙ КОТ',cost:1500,color:'#c9a0ff',desc:'Уши, хвост и любопытство'},
  {id:'cyber',name:'КИБЕР-НЕОН',cost:2000,color:'#00e8ff',desc:'Неоновые линии и визор'},
  {id:'nebula',name:'ТУМАННОСТЬ',cost:2400,color:'#b06bff',desc:'Сияние далёкой туманности'}
 ];
 const S=()=>PO.S(),owned=()=>{let c=S().cosmetic||(S().cosmetic={skin:'alien',owned:['alien']});c.owned=Array.isArray(c.owned)?c.owned:['alien'];return c};
 function refresh(){
  let s=S(),c=owned(),w=PO.WORLDS[s.world]||PO.WORLDS[0];
  updateHomeGoal();if($('homePilot'))$('homePilot').textContent=s.prof?.name||'ПИЛОТ';
  if($('homeLevel'))$('homeLevel').textContent=s.level;
  if($('homeTitle'))$('homeTitle').textContent=s.prof?.title?'ЭЛИТНЫЙ ПИЛОТ':'КОСМИЧЕСКИЙ ПИЛОТ';
  if($('homeXp'))$('homeXp').style.width=Math.min(100,s.xp/(10*Math.pow(1.3,s.level-1))*100)+'%';
  if($('homeCoins'))$('homeCoins').textContent=Math.floor(s.coins);
  if($('homeParts'))$('homeParts').textContent=Math.floor(s.parts);
  if($('homeWave'))$('homeWave').textContent=s.wave;
  if($('homeWorld'))$('homeWorld').textContent=w.n;
  if($('homeSector'))$('homeSector').textContent=(s.world+1);
  if($('shopCoins'))$('shopCoins').textContent=Math.floor(s.coins);
  if($('shopParts'))$('shopParts').textContent=Math.floor(s.parts);
  if($('skinGrid'))renderShop();renderWorldNodes();
 }

 function renderWorldNodes(){
  const s=S(),worlds=PO.WORLDS||[];
  document.querySelectorAll('.world-node').forEach(el=>{
   const i=Number(el.dataset.world),w=worlds[i];
   if(!w)return;
   const open=i===0||(s.level>=(w.reqLevel||1)&&(s.wb[i-1]||0)>=w.req);
   el.classList.toggle('locked',!open);
   el.classList.toggle('active',s.world===i);
   el.title=w.n+' · '+(open?'ОТКРЫТ':'ЗАКРЫТ');
   const label=el.querySelector('span');if(label)label.textContent=w.n;
   el.setAttribute('aria-label',w.n+(open?' открыт':' закрыт'));
  });
 }
 document.querySelectorAll('.world-node').forEach(el=>el.addEventListener('click',()=>{
  const i=Number(el.dataset.world);
  if(PO.setWorld(i)){document.querySelector('#tabs [data-t="map"]')?.click();refresh()}
 }));

 function renderShop(){
  let c=owned(),s=S(),grid=$('skinGrid');if(!grid)return;grid.innerHTML='';
  skins.forEach(sk=>{
   let has=c.owned.includes(sk.id),active=c.skin===sk.id,el=document.createElement('article');
   el.className='skin-card'+(active?' active':'');
   el.dataset.skin=sk.id;
   el.innerHTML=`<div class="skin-preview" style="--skin:${sk.color}"><i></i><b></b><em></em></div><strong>${sk.name}</strong><small>${sk.desc}</small><button data-skin="${sk.id}">${active?'ЭКИПИРОВАН':has?'ВЫБРАТЬ':sk.cost+' ✦ · КУПИТЬ'}</button>`;
   el.querySelector('button').onclick=()=>{if(has){c.skin=sk.id;PO.save();refresh();return}if(s.coins<sk.cost){PO.toast('НЕДОСТАТОЧНО КРЕДИТОВ');return}s.coins-=sk.cost;c.owned.push(sk.id);c.skin=sk.id;PO.save();refresh();PO.toast('СКИН ОТКРЫТ: '+sk.name)};
   grid.appendChild(el);
  });
 }
 function updateHomeGoal(){
  const s=S();
  const el=$('homeGoalText');if(!el)return;
  let text='Исследуй галактику';
  if((s.best||0)<10)text='Дойди до волны 10';
  else if((s.best||0)<25)text='Дойди до волны 25';
  else if((s.st&&s.st.bosses||0)<1)text='Победи первого босса';
  else if(Object.keys(s.wb||{}).filter(k=>s.wb[k]>0).length<3)text='Открой 3-й мир';
  else if(!(s.cosmetic&&s.cosmetic.owned&&s.cosmetic.owned.length>1))text='Купи первый скин в магазине';
  else if((s.best||0)<50)text='Дойди до волны 50';
  else text='Покоряй новые миры и рейды';
  el.textContent=text;
 }
 document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{if(typeof window.POHubGo==='function')window.POHubGo(b.dataset.go);else document.querySelector(`#tabs [data-t="${b.dataset.go}"]`)?.click()}));
 $('homeBattle')?.addEventListener('click',()=>document.querySelector('#tabs [data-t="battle"]')?.click());
 document.querySelector('.home-primary')?.addEventListener('click',()=>document.querySelector('#tabs [data-t="battle"]')?.click());
 $('homePrimaryBattle')?.addEventListener('click',()=>document.querySelector('#tabs [data-t="battle"]')?.click());
 $('homeFriendsBtn')?.addEventListener('click',()=>{document.querySelector('#tabs [data-t="profile"]')?.click();setTimeout(()=>{const t=document.querySelector('.po-social-block');if(t)t.scrollIntoView({behavior:'smooth',block:'start'})},120)});
 $('homeBoss')?.addEventListener('click',()=>{document.querySelector('#tabs [data-t="battle"]')?.click();setTimeout(()=>PO.eventBoss?.(),80)});
 $('eventBoss')?.addEventListener('click',()=>{document.querySelector('#tabs [data-t="battle"]')?.click();setTimeout(()=>PO.eventBoss?.(),80)});
 $('fleetBoss')?.addEventListener('click',()=>{document.querySelector('#tabs [data-t="battle"]')?.click();setTimeout(()=>PO.eventBoss?.(),80)});
 $('sideEvent')?.addEventListener('click',()=>{document.querySelector('#tabs [data-t="battle"]')?.click();setTimeout(()=>PO.eventBoss?.(),80)});
 $('shopBack')?.addEventListener('click',()=>document.querySelector('#tabs [data-t="home"]')?.click());
 document.querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',()=>{
  let s=S(),kind=b.dataset.buy;
  if(kind==='parts'){if(s.coins<120)return PO.toast('НУЖНО 120 ✦');s.coins-=120;s.parts+=10}
  if(kind==='credits'){if(s.parts<5)return PO.toast('НУЖНО 5 ◆');s.parts-=5;s.coins+=250}
  if(kind==='repair'){if(s.coins<80)return PO.toast('НУЖНО 80 ✦');s.coins-=80;s.hp=Math.min(100+PO.B().hp,s.hp+65)}
  PO.save();refresh();PO.toast('ПОКУПКА УСПЕШНА');
 }));
 document.querySelectorAll('#tabs [data-t="home"]').forEach(b=>b.addEventListener('click',refresh));
 document.querySelectorAll('#tabs [data-t="shop"]').forEach(b=>b.addEventListener('click',refresh));
 refresh();setInterval(refresh,800);
})();