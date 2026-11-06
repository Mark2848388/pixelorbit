(()=>{
const $=id=>document.getElementById(id),canvas=$('arena'),ctx=canvas.getContext('2d'),KEY='pixelorbit_v2';
const BR=['АТАКА','ЗАЩИТА','ЭКОНОМИКА'];
const TREE=[
{id:'dmg',b:0,n:'СИЛА ТАПА',d:'+4 урона тапа',max:10},
{id:'crit',b:0,n:'КРИТ',d:'+6% шанс, урон x2.5',max:8,req:['dmg',2]},
{id:'turret',b:0,n:'ТУРЕЛЬ',d:'Авто-огонь сильнее и чаще',max:8,req:['dmg',2]},
{id:'drone',b:0,n:'ДРОНЫ',d:'+1 орбитальный дрон',max:4,req:['turret',2]},
{id:'hp',b:1,n:'БРОНЯ',d:'+25 макс. здоровья',max:8},
{id:'regen',b:1,n:'РЕГЕН',d:'+0.5 HP в секунду',max:6,req:['hp',2]},
{id:'shield',b:1,n:'ЩИТ',d:'+20 щита, сам восстанавл.',max:5,req:['hp',2]},
{id:'thorns',b:1,n:'ШИПЫ',d:'Враг ранит себя об ядро',max:5,req:['regen',2]},
{id:'gold',b:2,n:'ТРОФЕИ',d:'+20% кредитов за убийство',max:8},
{id:'mine',b:2,n:'ДОБЫЧА',d:'+2 кредита за тап по ядру',max:8,req:['gold',2]},
{id:'xp',b:2,n:'ОБУЧЕНИЕ',d:'+15% опыта',max:5,req:['gold',2]},
{id:'off',b:2,n:'ОФФЛАЙН',d:'Доход, пока игра свёрнута',max:5,req:['mine',2]}
];
const fresh=()=>({coins:0,kills:0,wave:1,wk:0,level:1,xp:0,sp:0,best:1,sk:{},hp:100,sh:0,snd:1,t:Date.now()});
let S=fresh(),W=0,H=0,enemies=[],shots=[],parts=[],texts=[],paused=false,over=false,frame=0,last=performance.now(),hidAt=0,combo=0,comboT=0,autoT=0,pulse=0,shake=0,bossFor=0,uiT=0;
const L=id=>S.sk[id]||0,maxHp=()=>100+25*L('hp'),maxSh=()=>20*L('shield'),clickDmg=()=>10+4*L('dmg')+Math.floor(S.wave/2),critCh=()=>Math.min(.8,.05+.06*L('crit')),xpNeed=()=>Math.floor(10*Math.pow(1.3,S.level-1)),need=()=>8+3*S.wave;
const rand=(a,b)=>a+Math.random()*(b-a),vib=n=>{try{navigator.vibrate&&navigator.vibrate(n)}catch(e){}};
let ac;function beep(f,d){if(!S.snd)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();let o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=f;g.gain.value=.03;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
/* ---------- сохранение / оффлайн ---------- */
function save(){try{S.t=Date.now();localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function away(sec){if(sec<5)return;sec=Math.min(sec,1800);let c=Math.floor(sec*(.05+.04*L('off'))*(1+S.wave*.3));if(c>0){S.coins+=c;toast('ПОКА ТЕБЯ НЕ БЫЛО: +'+c+'✦')}}
try{let r=JSON.parse(localStorage.getItem(KEY));if(r&&typeof r==='object'){S=Object.assign(fresh(),r);away((Date.now()-S.t)/1000)}}catch(e){}
S.hp=Math.min(S.hp||maxHp(),maxHp());if(S.hp<=0)S.hp=maxHp();
/* ---------- размеры (фикс: игра пропадала при сворачивании) ---------- */
function resize(){let r=canvas.getBoundingClientRect();if(r.width<10||r.height<10)return;let d=Math.min(window.devicePixelRatio||1,2),nw=Math.floor(r.width*d),nh=Math.floor(r.height*d);
 if(canvas.width!==nw||canvas.height!==nh){let sx=W?r.width/W:1,sy=H?r.height/H:1;enemies.forEach(e=>{e.x*=sx;e.y*=sy});canvas.width=nw;canvas.height=nh}
 ctx.setTransform(d,0,0,d,0,0);W=r.width;H=r.height}
new ResizeObserver(resize).observe(canvas);resize();
/* ---------- враги ---------- */
function spawn(boss){let a=rand(0,6.283),rad=Math.max(W,H)*.6,w=S.wave,r=Math.random(),t=boss?3:(w>=3&&r<.2?2:(w>=2&&r<.4?1:0)),hp=(16+w*6)*[1,.55,3.2,w*5][t];
 enemies.push({x:W/2+Math.cos(a)*rad,y:H/2+Math.sin(a)*rad,hp,max:hp,t,r:[8,6,11,20][t],s:(rand(22,32)+w*1.5)*[1,1.9,.6,.45][t],hit:0,dc:0,boss:!!boss})}
function burst(x,y,color,n=8){for(let i=0;i<n;i++){let a=rand(0,6.283),v=rand(25,110);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.2,.6),color})}}
function txt(x,y,s,c){texts.push({x,y,s,c,life:.8})}
function hurt(e,d,crit){if(e.dead)return;e.hp-=d;txt(e.x,e.y-10,Math.round(d),crit?'#ffd36b':'#fff');burst(e.x,e.y,crit?'#ffd36b':'#ffe69a',crit?6:3);if(e.hp<=0)kill(e)}
function kill(e){e.dead=1;S.kills++;S.wk++;combo++;comboT=2.5;
 let c=Math.ceil((3+S.wave/2)*[1,1,3,30][e.t]*(1+.2*L('gold'))*(1+Math.min(combo,40)*.03));S.coins+=c;txt(e.x,e.y,'+'+c,'#ffe38a');burst(e.x,e.y,e.boss?'#ffd36b':'#f28cae',e.boss?30:10);
 gain(e.boss?15:e.t==2?2:1);if(e.boss){S.sp+=2;toast('БОСС УНИЧТОЖЕН! +2 ОЧКА НАВЫКОВ');vib(80)}}
function gain(n){S.xp+=n*(1+.15*L('xp'));while(S.xp>=xpNeed()){S.xp-=xpNeed();S.level++;S.sp++;toast('УРОВЕНЬ '+S.level+' · +1 ОЧКО НАВЫКОВ');beep(990,.12)}}
function hitCore(d){if(S.sh>0){let a=Math.min(S.sh,d);S.sh-=a;d-=a}S.hp-=d;shake=6;vib(20)}
const dronePos=i=>{let n=L('drone'),a=frame*2.2+i*6.283/n;return[W/2+Math.cos(a)*52,H/2+Math.sin(a)*52]};
/* ---------- логика ---------- */
function update(dt){frame+=dt;comboT-=dt;if(comboT<=0)combo=0;pulse=Math.max(0,pulse-dt*4);shake=Math.max(0,shake-dt*20);
 let w=S.wave,cx=W/2,cy=H/2;
 if(w%5==0&&bossFor!=w){bossFor=w;spawn(1);toast('⚠ БОСС ВОЛНЫ')}
 if(enemies.length<Math.min(22,4+w*2)&&Math.random()<dt*(.8+w*.12))spawn();
 S.hp=Math.min(maxHp(),S.hp+.5*L('regen')*dt);if(maxSh())S.sh=Math.min(maxSh(),S.sh+(2+L('shield'))*dt);
 autoT+=dt;if(autoT>=1.1*Math.pow(.9,L('turret'))&&enemies.length){autoT=0;let e=enemies.reduce((p,c)=>Math.hypot(c.x-cx,c.y-cy)<Math.hypot(p.x-cx,p.y-cy)?c:p),a=Math.atan2(e.y-cy,e.x-cx);shots.push({x:cx,y:cy,vx:Math.cos(a)*300,vy:Math.sin(a)*300,life:1.5,d:4+3*L('turret')+Math.floor(w/3)})}
 let nd=L('drone');
 enemies.forEach(e=>{let a=Math.atan2(cy-e.y,cx-e.x);e.x+=Math.cos(a)*e.s*dt;e.y+=Math.sin(a)*e.s*dt;e.dc-=dt;
  if(Math.hypot(e.x-cx,e.y-cy)<e.r+10){e.hit+=dt;if(e.hit>.65){e.hit=0;hitCore((5+w*.8)*[1,.7,1.6,2.5][e.t]);burst(cx,cy,'#ff789b',4);if(L('thorns'))hurt(e,12*L('thorns'),0)}}
  for(let i=0;i<nd&&e.dc<=0;i++){let p=dronePos(i);if(Math.hypot(e.x-p[0],e.y-p[1])<e.r+7){e.dc=.5;hurt(e,8+2*L('turret')+L('dmg'),0)}}});
 shots.forEach(s=>{if(s.fx){s.life-=dt;return}s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;for(let e of enemies){if(!e.dead&&Math.hypot(s.x-e.x,s.y-e.y)<e.r+5){hurt(e,s.d,s.crit);s.life=0;break}}});
 shots=shots.filter(s=>s.life>0&&s.x>-20&&s.x<W+20&&s.y>-20&&s.y<H+20);enemies=enemies.filter(e=>!e.dead);
 parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt});parts=parts.filter(p=>p.life>0);
 texts.forEach(t=>{t.y-=28*dt;t.life-=dt});texts=texts.filter(t=>t.life>0);
 if(S.wk>=need()&&!enemies.some(e=>e.boss)){S.wave++;S.wk=0;S.best=Math.max(S.best,S.wave);S.sh=maxSh();S.hp=Math.min(maxHp(),S.hp+10);toast('ВОЛНА '+String(S.wave).padStart(2,'0')+' НАЧАЛАСЬ');save()}
 if(S.hp<=0){S.hp=0;over=true;save();show('ЯДРО РАЗРУШЕНО','Рекорд: волна '+S.best+'. Навыки сохранены, кредиты делятся пополам.','НАЧАТЬ ЗАНОВО')}
}
/* ---------- отрисовка ---------- */
function draw(){ctx.clearRect(0,0,W,H);ctx.save();if(shake)ctx.translate(rand(-shake,shake)/2,rand(-shake,shake)/2);
 ctx.fillStyle='#a9b8dc';for(let i=0;i<45;i++){ctx.fillRect((i*97+31)%W,(i*151+Math.floor(frame*5))%H,2,2)}
 let cx=W/2,cy=H/2,R=Math.min(W,H)*.43,g=ctx.createLinearGradient(cx-R,cy-R,cx+R,cy+R);g.addColorStop(0,'#f4b1d5');g.addColorStop(.45,'#b7c9f5');g.addColorStop(1,'#f2a0bd');
 ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.strokeStyle=g;ctx.lineWidth=15;ctx.stroke();
 ctx.beginPath();ctx.arc(cx,cy,R-12,0,6.283);ctx.fillStyle='#1c2028';ctx.fill();ctx.strokeStyle='#7185b2';ctx.lineWidth=3;ctx.stroke();
 ctx.beginPath();ctx.arc(cx,cy,52,0,6.283);ctx.strokeStyle='rgba(125,151,205,.15)';ctx.setLineDash([3,8]);ctx.stroke();ctx.setLineDash([]);
 const col=[['#dce6ff','#687ba7'],['#ffc2d4','#c4577c'],['#9fb4ff','#3d4f9a'],['#ff8a8a','#a02a3a']];
 enemies.forEach(e=>{let c=col[e.t],s=e.r;ctx.fillStyle=c[0];ctx.fillRect(Math.round(e.x-s*.8),Math.round(e.y-s*.9),s*1.6,s*1.7);ctx.fillStyle=c[1];ctx.fillRect(e.x-s*.55,e.y-s*.65,s*1.1,s*.6);ctx.fillStyle='#202638';ctx.fillRect(e.x-s*.3,e.y-s*.5,2,2);ctx.fillRect(e.x+s*.15,e.y-s*.5,2,2);
  if(e.hp<e.max){ctx.fillStyle='#10131c';ctx.fillRect(e.x-s,e.y-s-6,s*2,3);ctx.fillStyle='#f28da9';ctx.fillRect(e.x-s,e.y-s-6,s*2*Math.max(0,e.hp/e.max),3)}});
 shots.forEach(s=>{if(s.fx){ctx.strokeStyle='#fff2bd';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.tx,s.ty);ctx.stroke()}else{ctx.fillStyle=s.crit?'#ffd36b':'#fff2bd';ctx.fillRect(s.x-3,s.y-3,6,6)}});
 for(let i=0;i<L('drone');i++){let p=dronePos(i);ctx.fillStyle='#8fd0ff';ctx.fillRect(p[0]-4,p[1]-4,8,8);ctx.fillStyle='#fff';ctx.fillRect(p[0]-1,p[1]-1,2,2)}
 parts.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3)});ctx.globalAlpha=1;
 if(S.sh>0){ctx.beginPath();ctx.arc(cx,cy,19,0,6.283);ctx.strokeStyle='rgba(143,208,255,'+(.25+.5*S.sh/maxSh())+')';ctx.lineWidth=3;ctx.stroke()}
 ctx.save();ctx.translate(cx,cy);ctx.rotate(frame*1.5);let k=1+pulse*.4;ctx.scale(k,k);ctx.fillStyle=pulse?'#ffe38a':'#f4f5ff';ctx.fillRect(-9,-9,18,18);ctx.fillStyle='#8da8e0';ctx.fillRect(-4,-4,8,8);ctx.restore();
 ctx.font='bold 12px ui-monospace,monospace';ctx.textAlign='center';texts.forEach(t=>{ctx.globalAlpha=Math.min(1,t.life*2);ctx.fillStyle=t.c;ctx.fillText(t.s,t.x,t.y)});ctx.globalAlpha=1;ctx.restore()}
/* ---------- интерфейс ---------- */
function toast(s){$('toast').textContent=s;setTimeout(()=>{if($('toast').textContent===s)$('toast').textContent=''},1800)}
function ui(){$('coins').textContent=Math.floor(S.coins);$('kills').textContent=S.kills;$('level').textContent=S.level;$('wave').textContent=String(S.wave).padStart(2,'0');$('wprog').textContent=Math.min(S.wk,need())+' / '+need()+(S.wave%5==0?' ☠':'');
 $('damage').textContent=clickDmg();$('crit').textContent=Math.round(critCh()*100)+'%';$('hpbar').style.width=(S.hp/maxHp()*100)+'%';$('hptext').textContent=Math.ceil(S.hp)+' / '+maxHp()+(maxSh()?'  +'+Math.ceil(S.sh):'');
 $('xpbar').style.width=(S.xp/xpNeed()*100)+'%';$('spb').textContent=S.sp+'◆';$('combo').textContent=combo>2?'КОМБО x'+combo:'';$('snd').textContent='ЗВУК: '+(S.snd?'ВКЛ':'ВЫКЛ')}
function show(t,m,b){paused=true;$('ptitle').textContent=t;$('pmsg').textContent=m||'';$('resume').textContent=b||'ПРОДОЛЖИТЬ';$('paused').classList.add('show')}
function renderTree(){$('sp').textContent=S.sp;let gr=$('treeGrid');gr.innerHTML='';
 BR.forEach((bn,bi)=>{let col=document.createElement('div');col.className='col';col.innerHTML='<h3>'+bn+'</h3>';
  TREE.filter(n=>n.b==bi).forEach(n=>{let lv=L(n.id),lock=n.req&&L(n.req[0])<n.req[1],cost=lv+1,mx=lv>=n.max,b=document.createElement('button');
   b.className='node'+(lock?' lock':'')+(mx?' max':'')+(!lock&&!mx&&S.sp>=cost?' can':'');
   b.innerHTML='<b>'+n.n+'</b><small>'+n.d+'</small><em>'+(mx?'МАКС':lock?'НУЖНО: '+TREE.find(x=>x.id==n.req[0]).n+' '+n.req[1]:lv+'/'+n.max+' · '+cost+'◆')+'</em>';
   b.onclick=()=>{if(lock||mx||S.sp<cost)return;S.sp-=cost;S.sk[n.id]=lv+1;if(n.id=='hp')S.hp+=25;if(n.id=='shield')S.sh+=20;save();renderTree();ui();beep(760,.06)};col.appendChild(b)});gr.appendChild(col)})}
$('tree').onclick=()=>{if(over||paused)return;paused=true;renderTree();$('treeBox').classList.add('show')};
$('closeTree').onclick=()=>{$('treeBox').classList.remove('show');paused=false};
$('pause').onclick=()=>{if(!over&&!paused)show('ПАУЗА','')};
$('resume').onclick=()=>{if(over){let b=S.coins;S=Object.assign(fresh(),S,{coins:Math.floor(b/2),wave:1,wk:0,xp:0});S.hp=maxHp();S.sh=maxSh();enemies=[];shots=[];combo=0;bossFor=0;over=false}
 $('paused').classList.remove('show');$('treeBox').classList.remove('show');paused=false;last=performance.now();save()};
$('snd').onclick=()=>{S.snd=S.snd?0:1;ui()};
$('repair').onclick=()=>{if(over||paused)return;if(S.coins>=25&&S.hp<maxHp()){S.coins-=25;S.hp=Math.min(maxHp(),S.hp+35);toast('ЯДРО ОТРЕМОНТИРОВАНО')}else toast(S.coins<25?'НЕДОСТАТОЧНО КРЕДИТОВ':'ЗДОРОВЬЕ УЖЕ ПОЛНОЕ')};
$('power').onclick=()=>{if(over||paused)return;if(S.coins<40){toast('НЕДОСТАТОЧНО КРЕДИТОВ');return}S.coins-=40;enemies.forEach(e=>{hurt(e,45+clickDmg()*2,0)});shake=8;vib(40);beep(200,.2);toast('ИМПУЛЬС АКТИВИРОВАН')};
/* ---------- кликер: тапы ---------- */
canvas.addEventListener('pointerdown',e=>{if(paused||over)return;let r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,cx=W/2,cy=H/2;
 if(Math.hypot(x-cx,y-cy)<28){let c=1+2*L('mine')+Math.floor(S.wave/3);S.coins+=c;txt(cx+rand(-14,14),cy-18,'+'+c,'#ffe38a');burst(cx,cy,'#ffe38a',3);pulse=1;beep(520,.03);return}
 let t=null,bd=1e9;enemies.forEach(en=>{let d=Math.hypot(en.x-x,en.y-y)-en.r;if(d<34&&d<bd){bd=d;t=en}});
 let crit=Math.random()<critCh(),d=clickDmg()*(crit?2.5:1);
 if(t){hurt(t,d,crit);shots.push({fx:1,x:cx,y:cy,tx:t.x,ty:t.y,life:.08})}else{let a=Math.atan2(y-cy,x-cx);shots.push({x:cx,y:cy,vx:Math.cos(a)*420,vy:Math.sin(a)*420,life:1.5,d,crit})}
 if(crit)vib(15);beep(crit?880:660,.03)});
/* ---------- жизненный цикл: сворачивание браузера ---------- */
function onHide(){hidAt=Date.now();save();if(!over&&!paused)show('ПАУЗА','Игра сохранена')}
function onShow(){resize();last=performance.now();if(hidAt){away((Date.now()-hidAt)/1000);hidAt=0}}
document.addEventListener('visibilitychange',()=>document.hidden?onHide():onShow());
window.addEventListener('pagehide',()=>{save()});window.addEventListener('pageshow',onShow);window.addEventListener('resize',resize);window.addEventListener('orientationchange',()=>setTimeout(resize,200));
setInterval(save,4000);
function loop(t){let dt=Math.min(.05,Math.max(0,(t-last)/1000));last=t;if(!paused&&!over&&W>0)update(dt);if(W>0)draw();uiT-=dt;if(uiT<=0){uiT=.1;ui()}requestAnimationFrame(loop)}
requestAnimationFrame(loop);
})();
