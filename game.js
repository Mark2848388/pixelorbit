(()=>{'use strict';
const $=id=>document.getElementById(id),cv=$('arena'),ctx=cv.getContext('2d'),KEY='pixelorbit_v4',PO=window.PO={};
/* ---------- данные ---------- */
const TREE=[
{id:'dmg',b:0,n:'СИЛА ТАПА',d:'+4 урона тапа',max:10},
{id:'crit',b:0,n:'КРИТ',d:'+6% шанс крита (x2.5)',max:8,req:['dmg',2]},
{id:'turret',b:0,n:'АВТО-ТУРЕЛЬ',d:'Урон и скорострельность',max:8,req:['dmg',2]},
{id:'beam',b:0,n:'ЛУЧЕВОЙ МОДУЛЬ',d:'Центральный луч автоматически прожигает врага',max:5,req:['turret',2]},
{id:'beam2',b:0,n:'РАЗДВОЕННЫЙ ЛУЧ',d:'Добавляет второй независимый луч',max:3,req:['beam',2]},
{id:'drone',b:0,n:'ДРОНЫ',d:'+1 орбитальный дрон',max:4,req:['turret',2]},
{id:'hp',b:1,n:'БРОНЯ',d:'+25 макс. здоровья',max:8},
{id:'regen',b:1,n:'РЕГЕН',d:'+0.5 HP в секунду',max:6,req:['hp',2]},
{id:'shield',b:1,n:'ЩИТ',d:'+20 щита, сам восстанавливается',max:5,req:['hp',2]},
{id:'thorns',b:1,n:'ШИПЫ',d:'Враг ранит себя об ядро',max:5,req:['regen',2]},
{id:'gold',b:2,n:'ТРОФЕИ',d:'+20% кредитов за убийство',max:8},
{id:'mine',b:2,n:'ДОБЫЧА',d:'+2 кредита за тап по ядру',max:8,req:['gold',2]},
{id:'xp',b:2,n:'ОБУЧЕНИЕ',d:'+15% опыта',max:5,req:['gold',2]},
{id:'off',b:2,n:'ОФФЛАЙН',d:'Доход, пока игра свёрнута',max:5,req:['mine',2]}];
const BR=['АТАКА','ЗАЩИТА','ЭКОНОМИКА'];
const WORLDS=[
{n:'ОРИОН',d:'Тихий сектор. Идеален для старта.',bg:['#303b59','#242c43','#171c2b'],rc:['#f4b1d5','#b7c9f5','#f2a0bd'],hp:1,cm:1,sp:1,tn:null,req:0,pl:['#6fa8ff','#2a4d9a'],ring:0,x:300,y:1150},
{n:'ПЕПЕЛ',d:'Вулканический мир. Враги быстрее.',bg:['#4d2a22','#34191a','#1b0e10'],rc:['#ffb36b','#ff7a3a','#ff5a5a'],hp:1.3,cm:1.3,sp:1.25,tn:'#ff7a3a',req:8,pl:['#ff9a4a','#8a2a10'],ring:0,x:130,y:980},
{n:'КРИСТАЛЛ',d:'Ледяные кристаллы. Враги крепче.',bg:['#274a5a','#183541','#0b1b24'],rc:['#9ff0ff','#6fb8ff','#c8f4ff'],hp:1.7,cm:1.6,sp:1,tn:'#6fe3ff',req:12,pl:['#9ff0ff','#2a7a9a'],ring:1,x:430,y:860},
{n:'КОЛОНИЯ',d:'Джунгли роя. Щедрые награды.',bg:['#25492b','#18331f','#0b1a10'],rc:['#9fffa0','#5ed07a','#d4ff9a'],hp:2.1,cm:2,sp:1.1,tn:'#7dff7a',req:16,pl:['#7dff7a','#1f6a30'],ring:0,x:170,y:700},
{n:'РАЗЛОМ',d:'Нестабильное пространство.',bg:['#43286a','#2c1850','#150a2a'],rc:['#d9a0ff','#a07aff','#ff9ae8'],hp:2.7,cm:2.6,sp:1.15,tn:'#c07bff',req:20,pl:['#c07bff','#4a1f8a'],ring:1,x:440,y:560},
{n:'ФРОНТИР',d:'Торговая граница. Много кредитов.',bg:['#4d3d1e','#352a14','#1b150a'],rc:['#ffe09a','#ffc36b','#fff0c0'],hp:3.4,cm:3.4,sp:1.1,tn:'#ffd36b',req:25,pl:['#ffd36b','#8a5a10'],ring:0,x:150,y:420},
{n:'АНТИМАТЕРИЯ',d:'Всё вокруг взрывоопасно.',bg:['#561e30','#3a1220','#1c0810'],rc:['#ff9aa8','#ff4d6d','#ffb3c1'],hp:4.6,cm:4.8,sp:1.25,tn:'#ff4d6d',req:30,pl:['#ff4d6d','#7a1030'],ring:1,x:400,y:290},
{n:'СИНГУЛЯРНОСТЬ',d:'Конец и начало всего.',bg:['#401e5a','#241038','#0e0418'],rc:['#ff9af0','#9a7aff','#7affff'],hp:6,cm:7,sp:1.35,tn:'#ff6bf0',req:40,pl:['#ff6bf0','#3a1070'],ring:1,x:300,y:130},
{n:'ЭХО ТУМАННОСТИ',d:'Мир древних маяков. Враги используют усиленную броню.',bg:['#203c56','#14263d','#091321'],rc:['#8cecff','#5e91d8','#d2a7ff'],hp:7.2,cm:8.2,sp:1.45,tn:'#76cfff',req:45,pl:['#76cfff','#253d83'],ring:1,x:150,y:55},
{n:'КРАЙ БЕЗДНЫ',d:'Последний рубеж за пределами известных карт.',bg:['#45204d','#26112f','#100817'],rc:['#ff9adf','#b76bff','#70e8ff'],hp:8.8,cm:10,sp:1.55,tn:'#e27bff',req:50,pl:['#e27bff','#45146b'],ring:1,x:450,y:35}];
const BLD=[
{id:'gen',n:'ГЕНЕРАТОР',w:2,h:2,max:3,c:[80,0],d:'Копит кредиты. В бою: +0.3 ✦/с за уровень.',prod:['coins',10]},
{id:'fac',n:'ФАБРИКА',w:2,h:2,max:2,c:[120,10],d:'Производит детали ⚙ для стройки.',prod:['parts',2]},
{id:'lab',n:'ЛАБОРАТОРИЯ',w:2,h:2,max:2,c:[150,15],d:'+8% опыта за уровень.'},
{id:'tur',n:'БАШНЯ',w:1,h:1,max:4,c:[60,5],d:'+0.5 уровня авто-турели за уровень.'},
{id:'dome',n:'КУПОЛ',w:2,h:2,max:1,c:[200,25],d:'+15 щита за уровень.'},
{id:'dock',n:'РЕМДОК',w:2,h:2,max:1,c:[140,15],d:'Ремонт дешевле на 8%, +0.3 HP/с за уровень.'},
{id:'drl',n:'БУР',w:2,h:2,max:2,c:[100,10],d:'+1 кредит за тап по ядру за уровень.'},
{id:'rad',n:'РАДАР',w:1,h:1,max:3,c:[90,8],d:'+1% шанса крита за уровень.'},
{id:'bay',n:'АНГАР ПОМОЩНИКОВ',w:2,h:2,max:3,c:[180,20],d:'+3% урона помощников за уровень.'},
{id:'array',n:'ЛАЗЕРНАЯ МАТРИЦА',w:2,h:2,max:3,c:[220,30],d:'+5% урона лучей за уровень.'},
{id:'beacon',n:'ЗВЁЗДНЫЙ МАЯК',w:1,h:1,max:3,c:[160,18],d:'+4% кредитов и опыта за уровень.'}];
PO.WORLDS=WORLDS;PO.BLD=BLD;
/* ---------- состояние ---------- */
const fresh=()=>({coins:50,parts:20,kills:0,wave:1,wk:0,level:1,xp:0,best:1,hp:100,sh:0,sp:0,sk:{},snd:1,vib:1,fxq:1,world:0,wp:{},wb:{0:1},bld:[],size:0,prof:{name:'ПИЛОТ-07',avatar:'a0',title:0,accent:'#8fd0ff'},st:{taps:0,bosses:0,crit:0,combo:0,time:0,totalTime:0,built:0},daily:{last:'',streak:0},seen:{},t:Date.now()});
let S=fresh(),W=0,H=0,enemies=[],shots=[],parts=[],texts=[],beamFx=[],paused=false,modal=false,over=false,frame=0,last=performance.now(),hidAt=0,combo=0,comboT=0,autoT=0,pulse=0,shake=0,bossFor=0,uiT=0,spawnT=0,helperT=[0,0,0],beamT=0,Bt=0,Bc=null,pal=[];
const L=id=>S.sk[id]||0,rand=(a,c)=>a+Math.random()*(c-a),cw=()=>WORLDS[S.world]||WORLDS[0],vib=n=>{try{S.vib&&navigator.vibrate&&navigator.vibrate(n)}catch(e){}};
function B(){if(!Bc||Bt<=0){let b={dmg:4*L('dmg'),crit:.05+.06*L('crit'),hp:25*L('hp'),regen:.5*L('regen'),sh:20*L('shield'),coinM:1+.2*L('gold'),xpM:1+.15*L('xp'),mine:2*L('mine'),off:L('off'),drones:L('drone'),turret:L('turret'),thorns:12*L('thorns'),repair:0,passive:0,beam:L('beam'),beam2:L('beam2'),helperBonus:0,beamBonus:0,bonusM:1};
 S.bld.forEach(o=>{let l=o.l,t=o.t;if(t=='gen')b.passive+=.3*l;if(t=='lab')b.xpM+=.08*l;if(t=='tur')b.turret+=.5*l;if(t=='dome')b.sh+=15*l;if(t=='dock'){b.repair+=.08*l;b.regen+=.3*l}if(t=='drl')b.mine+=l;if(t=='rad')b.crit+=.01*l;if(t=='bay')b.helperBonus+=.03*l;if(t=='array')b.beamBonus+=.05*l;if(t=='beacon')b.bonusM+=.04*l});b.coinM*=b.bonusM;b.xpM*=b.bonusM;Bc=b;Bt=.5}return Bc}
const helperCount=()=>Math.min(3,1+Math.floor(Math.max(0,S.level-1)/5));
const maxHp=()=>100+B().hp,maxSh=()=>B().sh,clickDmg=()=>14+B().dmg+Math.floor(S.wave/2),critCh=()=>Math.min(.85,B().crit),xpNeed=()=>Math.floor(10*Math.pow(1.3,S.level-1)),need=()=>8+3*S.wave,repCost=()=>Math.max(5,Math.round(25*(1-Math.min(.6,B().repair))));
const mix=(a,b,t)=>{let p=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16)),x=p(a),y=p(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('')};
function applyWorld(){let w=cw(),base=[['#dce6ff','#687ba7'],['#ffc2d4','#c4577c'],['#9fb4ff','#3d4f9a'],['#ff8a8a','#a02a3a']];pal=base.map(p=>w.tn?[mix(p[0],w.tn,.3),mix(p[1],w.tn,.3)]:p);$('arenaWrap').style.background='radial-gradient(ellipse at 50% 55%,'+w.bg[0]+' 0,'+w.bg[1]+' 57%,'+w.bg[2]+' 100%)';$('worldName').textContent='СЕКТОР · '+w.n}
let ac;function beep(f,d){if(!S.snd)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();let o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=f;g.gain.value=.03;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function toast(s){let t=$('toast');t.textContent=s;setTimeout(()=>{if(t.textContent===s)t.textContent=''},2200)}
/* ---------- сохранение ---------- */
function save(){try{S.t=Date.now();localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function load(){try{let r=JSON.parse(localStorage.getItem(KEY));if(r&&typeof r==='object'){S=Object.assign(fresh(),r);S.prof=Object.assign(fresh().prof,r.prof);S.st=Object.assign(fresh().st,r.st);S.daily=Object.assign(fresh().daily,r.daily);return true}
 let o=JSON.parse(localStorage.getItem('pixelorbit_v2'));if(o&&typeof o==='object'){['coins','kills','wave','wk','level','xp','best','sp','sk'].forEach(k=>{if(o[k]!=null)S[k]=o[k]});S.wb[0]=S.best}}catch(e){}return false}
function away(sec){if(sec<5)return;sec=Math.min(sec,1800+1800*B().off);let c=Math.floor(sec*(.05+.04*B().off+.2*B().passive)*(1+S.wave*.3)*cw().cm);if(c>0){S.coins+=c;toast('ПОКА ТЕБЯ НЕ БЫЛО: +'+c+'✦')}}
function resize(){let r=cv.getBoundingClientRect();if(r.width<10||r.height<10)return;let d=Math.min(devicePixelRatio||1,2),nw=Math.floor(r.width*d),nh=Math.floor(r.height*d);if(cv.width!==nw||cv.height!==nh){let sx=W?r.width/W:1,sy=H?r.height/H:1;enemies.forEach(e=>{e.x*=sx;e.y*=sy});cv.width=nw;cv.height=nh}ctx.setTransform(d,0,0,d,0,0);ctx.imageSmoothingEnabled=false;W=r.width;H=r.height}
/* ---------- бой ---------- */
function spawn(boss,px,py,mini){let w=S.wave,a=rand(0,6.283),rad=Math.max(W,H)*.6,wd=cw(),t=boss?3:(w>=3&&Math.random()<.2?2:(w>=2&&Math.random()<.4?1:0)),hp=(16+w*6)*[1,.55,3.2,w*5][t]*wd.hp*(mini?.4:1);
 enemies.push({x:px!=null?px:W/2+Math.cos(a)*rad,y:py!=null?py:H/2+Math.sin(a)*rad,hp,max:hp,t,r:mini?5:[8,6,11,20][t],s:(rand(22,32)+w*1.5)*[1,1.9,.6,.45][t]*wd.sp,hit:0,fl:0,st:2,boss:!!boss,sm:0});if(boss){toast('⚠ БОСС ВОЛНЫ');vib([80,40,80])}}
function burst(x,y,c,n=8){if(!S.fxq)n=Math.ceil(n/3);for(let i=0;i<n;i++){let a=rand(0,6.283),v=rand(25,110);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.2,.6),color:c})}}
const txt=(x,y,s,c)=>texts.push({x,y,s,c,life:.8});
function hurt(e,d,crit){if(e.dead)return;e.hp-=d;e.fl=.08;txt(e.x,e.y-10,Math.round(d),crit?'#ffd36b':'#fff');burst(e.x,e.y,crit?'#ffd36b':'#ffe69a',crit?6:3);if(e.hp<=0)kill(e)}
function kill(e){e.dead=1;S.kills++;S.wk++;combo++;comboT=2.5;S.st.combo=Math.max(S.st.combo,combo);let b=B(),c=Math.ceil((3+S.wave/2)*(e.t==2?3:e.t==3?30:e.mini?.3:1)*b.coinM*cw().cm*(1+Math.min(combo,40)*.03));S.coins+=c;txt(e.x,e.y,'+'+c,'#ffe38a');burst(e.x,e.y,e.boss?'#ffd36b':'#f28cae',e.boss?30:10);
 if(Math.random()<.04+(e.t==2?.06:0)){S.parts++;txt(e.x,e.y-14,'+1⚙','#9fb4ff')}gain(e.boss?15:e.t==2?2:1);
 if(e.boss){S.sp+=2;S.parts+=4+Math.floor(S.wave/5);S.st.bosses++;toast('БОСС УНИЧТОЖЕН! +2 ОЧКА НАВЫКОВ');vib(80);shake=12}}
function gain(n){S.xp+=n*B().xpM;while(S.xp>=xpNeed()){S.xp-=xpNeed();S.level++;S.sp++;toast('УРОВЕНЬ '+S.level+' · +1 ОЧКО НАВЫКОВ');beep(990,.12)}}
function hitCore(d){if(S.sh>0){let a=Math.min(S.sh,d);S.sh-=a;d-=a}S.hp-=d;shake=6;vib(20)}
const dronePos=(i,n)=>{let a=frame*2.2+i*6.283/n;return[W/2+Math.cos(a)*52,H/2+Math.sin(a)*52]};
const near=(x,y,ex)=>enemies.reduce((p,c)=>!c.dead&&c!==ex&&(!p||Math.hypot(c.x-x,c.y-y)<Math.hypot(p.x-x,p.y-y))?c:p,null);
function update(dt){frame+=dt;S.st.totalTime=(S.st.totalTime||0)+dt;comboT-=dt;if(comboT<=0)combo=0;pulse=Math.max(0,pulse-dt*4);shake=Math.max(0,shake-dt*20);Bt-=dt;S.st.time+=dt;
 let b=B(),w=S.wave,cx=W/2,cy=H/2;
 if(w%5==0&&bossFor!=w){bossFor=w;spawn(1)}
 spawnT-=dt;if(spawnT<=0&&enemies.length<Math.min(22,4+w*2)){spawnT=Math.max(.3,1.2-w*.04);spawn(0)}
 S.hp=Math.min(maxHp(),S.hp+b.regen*dt);if(maxSh())S.sh=Math.min(maxSh(),S.sh+(2+maxSh()/20)*dt);if(b.passive)S.coins+=b.passive*cw().cm*dt;
 autoT+=dt;if(autoT>=1.1*Math.pow(.9,b.turret)&&enemies.length){autoT=0;let e=near(cx,cy);if(e){let a=Math.atan2(e.y-cy,e.x-cx);shots.push({x:cx,y:cy,vx:Math.cos(a)*300,vy:Math.sin(a)*300,life:1.5,d:4+3*b.turret+w/3})}}
 // Три самостоятельных помощника: отдельные модели и собственные очереди стрельбы.
 for(let i=0;i<helperCount();i++){helperT[i]-=dt;if(helperT[i]<=0){let e=near(cx+Math.cos(frame*1.8+i*2.1)*66,cy+Math.sin(frame*1.8+i*2.1)*66);if(e){helperT[i]=[.95,.78,.62][i];let hx=cx+Math.cos(frame*1.8+i*2.1)*66,hy=cy+Math.sin(frame*1.8+i*2.1)*66,a=Math.atan2(e.y-hy,e.x-hx);shots.push({x:hx,y:hy,vx:Math.cos(a)*360,vy:Math.sin(a)*360,life:1.5,d:(3+i*2)*(1+b.helperBonus),helper:i})}}}
 // Прокачиваемые лучи ядра бьют по ближайшим целям автоматически.
 beamT-=dt;if((b.beam||b.beam2)&&beamT<=0&&enemies.length){beamT=Math.max(.28,.95-.08*b.beam);let targets=[];let first=near(cx,cy);if(first)targets.push(first);if(b.beam2>=1){let second=enemies.filter(e=>!e.dead&&e!==first).sort((a,c)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(c.x-cx,c.y-cy))[0];if(second)targets.push(second)}targets.slice(0,1+Math.min(1,b.beam2)).forEach((e,i)=>{let dmg=(12+5*b.beam+4*b.beam2)*(1+b.beamBonus);hurt(e,dmg,0);beamFx.push({x:cx,y:cy,tx:e.x,ty:e.y,life:.18,color:i?'#e7a0ff':'#7feaff'})})}

 let nd=b.drones;
 enemies.forEach(e=>{if(e.dead)return;e.fl=Math.max(0,e.fl-dt);
  if(e.boss&&!e.sm&&e.hp<e.max*.5){e.sm=1;spawn(0,e.x+30,e.y,1);spawn(0,e.x-30,e.y,1);toast('БОСС ПРИЗЫВАЕТ ПОДМОГУ')}
  if(e.boss){e.st-=dt;if(e.st<=0){e.st=2.4;let a=Math.atan2(cy-e.y,cx-e.x);shots.push({x:e.x,y:e.y,vx:Math.cos(a)*150,vy:Math.sin(a)*150,life:4,eb:1,d:10})}}
  let a=Math.atan2(cy-e.y,cx-e.x);e.x+=Math.cos(a)*e.s*dt;e.y+=Math.sin(a)*e.s*dt;
  if(Math.hypot(e.x-cx,e.y-cy)<e.r+10){e.hit+=dt;if(e.hit>.65){e.hit=0;hitCore((5+w*.8)*[1,.7,1.6,2.5][e.t]);burst(cx,cy,'#ff789b',4);if(b.thorns)hurt(e,b.thorns,0)}}
  for(let i=0;i<nd;i++){let p=dronePos(i,nd);if(Math.hypot(e.x-p[0],e.y-p[1])<e.r+5){e.dc=(e.dc||0)-dt;if(e.dc<=0){e.dc=.5;hurt(e,8+2*b.turret,0)}}}});
 shots.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(s.eb){if(Math.hypot(s.x-cx,s.y-cy)<20){hitCore(s.d+w*.5);s.life=0}return}
  for(let e of enemies){if(!e.dead&&!(s.hit&&s.hit.includes(e))&&Math.hypot(s.x-e.x,s.y-e.y)<e.r+5){hurt(e,s.d,s.crit);if(s.pr>0){s.pr--;(s.hit=s.hit||[]).push(e)}else s.life=0;break}}});
 shots=shots.filter(s=>s.life>0&&s.x>-20&&s.x<W+20&&s.y>-20&&s.y<H+20);enemies=enemies.filter(e=>!e.dead);
 beamFx.forEach(p=>p.life-=dt);beamFx=beamFx.filter(p=>p.life>0);parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt});parts=parts.filter(p=>p.life>0);texts.forEach(t=>{t.y-=28*dt;t.life-=dt});texts=texts.filter(t=>t.life>0);
 if(S.wk>=need()&&!enemies.some(e=>e.boss)){S.wave++;S.wk=0;S.best=Math.max(S.best,S.wave);S.wb[S.world]=Math.max(S.wb[S.world]||0,S.wave);S.parts++;S.sh=maxSh();S.hp=Math.min(maxHp(),S.hp+10);toast('ВОЛНА '+String(S.wave).padStart(2,'0'));save()}
 if(S.hp<=0){S.hp=0;over=true;save();show('ЯДРО РАЗРУШЕНО','Волна '+S.wave+'. Можно восстановить ядро за '+reviveCost()+'✦ или начать заново (кредиты делятся пополам).','НАЧАТЬ ЗАНОВО',true)}}
const reviveCost=()=>200+S.wave*20;
function draw(){ctx.clearRect(0,0,W,H);ctx.save();if(shake)ctx.translate(rand(-shake,shake)/2,rand(-shake,shake)/2);
 ctx.fillStyle='#a9b8dc';for(let i=0;i<45;i++)ctx.fillRect((i*97+31)%W,(i*151+Math.floor(frame*5))%H,2,2);
 let wd=cw(),cx=W/2,cy=H/2,R=Math.min(W,H)*.43,g=ctx.createLinearGradient(cx-R,cy-R,cx+R,cy+R);g.addColorStop(0,wd.rc[0]);g.addColorStop(.45,wd.rc[1]);g.addColorStop(1,wd.rc[2]);
 ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.strokeStyle=g;ctx.lineWidth=15;ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,R-12,0,6.283);ctx.fillStyle='#1c2028';ctx.fill();ctx.strokeStyle='#7185b2';ctx.lineWidth=3;ctx.stroke();
 ctx.beginPath();ctx.arc(cx,cy,52,0,6.283);ctx.strokeStyle='rgba(125,151,205,.15)';ctx.lineWidth=2;ctx.setLineDash([3,8]);ctx.stroke();ctx.setLineDash([]);
 enemies.forEach(e=>{let c=pal[e.t],s=e.r,body=e.fl>0?'#fff':c[0];ctx.fillStyle=body;ctx.fillRect(Math.round(e.x-s*.8),Math.round(e.y-s*.9),s*1.6,s*1.7);ctx.fillStyle=c[1];ctx.fillRect(e.x-s*.55,e.y-s*.65,s*1.1,s*.6);ctx.fillStyle='#202638';ctx.fillRect(e.x-s*.3,e.y-s*.5,2,2);ctx.fillRect(e.x+s*.15,e.y-s*.5,2,2);
  if(e.hp<e.max){ctx.fillStyle='#10131c';ctx.fillRect(e.x-s,e.y-s-6,s*2,3);ctx.fillStyle='#f28da9';ctx.fillRect(e.x-s,e.y-s-6,s*2*Math.max(0,e.hp/e.max),3)}});
 shots.forEach(s=>{if(s.eb){ctx.fillStyle='#ff4d6d';ctx.fillRect(s.x-4,s.y-4,8,8)}else{ctx.fillStyle=s.helper?['#8fe0a8','#ffbd75','#d6a0ff'][s.helper-1]:(s.crit?'#ffd36b':'#fff2bd');ctx.fillRect(s.x-3,s.y-3,6,6)}});
 for(let i=0;i<B().drones;i++){let p=dronePos(i,B().drones);ctx.fillStyle='#8fd0ff';ctx.fillRect(p[0]-4,p[1]-4,8,8);ctx.fillStyle='#fff';ctx.fillRect(p[0]-1,p[1]-1,2,2)}
 parts.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3)});ctx.globalAlpha=1;
 if(S.sh>0){ctx.beginPath();ctx.arc(cx,cy,22,0,6.283);ctx.strokeStyle='rgba(143,208,255,'+(.25+.5*S.sh/Math.max(1,maxSh()))+')';ctx.lineWidth=3;ctx.stroke()}
 beamFx.forEach(bf=>{ctx.globalAlpha=Math.max(0,bf.life/.18);ctx.strokeStyle=bf.color;ctx.lineWidth=4;ctx.shadowColor=bf.color;ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(bf.x,bf.y);ctx.lineTo(bf.tx,bf.ty);ctx.stroke();ctx.shadowBlur=0});ctx.globalAlpha=1;
 // Центральный корабль игрока — пиксельный перехватчик вместо квадрата.
 ctx.save();ctx.translate(cx,cy);ctx.rotate(-Math.PI/2+Math.sin(frame*1.1)*.035);let k=1+pulse*.12;ctx.scale(k,k);
 ctx.fillStyle='#273653';ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(12,11);ctx.lineTo(4,8);ctx.lineTo(0,12);ctx.lineTo(-4,8);ctx.lineTo(-12,11);ctx.closePath();ctx.fill();
 ctx.fillStyle=pulse?'#ffe38a':'#dcecff';ctx.beginPath();ctx.moveTo(0,-16);ctx.lineTo(7,8);ctx.lineTo(0,5);ctx.lineTo(-7,8);ctx.closePath();ctx.fill();
 ctx.fillStyle='#65cfff';ctx.fillRect(-2,-5,4,8);ctx.fillStyle='#f28da9';ctx.fillRect(-9,8,4,4);ctx.fillRect(5,8,4,4);ctx.fillStyle='#fff';ctx.fillRect(-2,-12,4,4);ctx.restore();
 // У каждого помощника своя форма и цвет.
 for(let i=0;i<helperCount();i++){let a=frame*1.8+i*2.1,hx=cx+Math.cos(a)*66,hy=cy+Math.sin(a)*66;ctx.save();ctx.translate(hx,hy);ctx.rotate(a+Math.PI/2);
 ctx.fillStyle=['#244c50','#60452a','#48336c'][i];ctx.beginPath();
 if(i===0){ctx.moveTo(0,-9);ctx.lineTo(7,6);ctx.lineTo(0,3);ctx.lineTo(-7,6)}
 else if(i===1){ctx.moveTo(0,-8);ctx.lineTo(8,0);ctx.lineTo(0,8);ctx.lineTo(-8,0)}
 else{ctx.moveTo(0,-9);ctx.lineTo(8,7);ctx.lineTo(-8,7)}
 ctx.closePath();ctx.fill();ctx.fillStyle=['#8fe0a8','#ffbd75','#d6a0ff'][i];ctx.fillRect(-2,-2,4,4);ctx.restore()}
 ctx.font='bold 12px ui-monospace,monospace';ctx.textAlign='center';texts.forEach(t=>{ctx.globalAlpha=Math.min(1,t.life*2);ctx.fillStyle=t.c;ctx.fillText(t.s,t.x,t.y)});ctx.globalAlpha=1;ctx.restore()}
/* ---------- интерфейс боя ---------- */
function ui(){$('coins').textContent=Math.floor(S.coins);$('parts').textContent=Math.floor(S.parts);$('kills').textContent=S.kills;$('wave').textContent=String(S.wave).padStart(2,'0');$('wprog').textContent=Math.min(S.wk,need())+' / '+need()+(S.wave%5==0?' ☠':'');
 $('damage').textContent=clickDmg();$('crit').textContent=Math.round(critCh()*100)+'%';$('hpbar').style.width=(S.hp/maxHp()*100)+'%';$('hptext').textContent=Math.ceil(S.hp)+' / '+maxHp()+(maxSh()?'  +'+Math.ceil(S.sh):'');
 $('xpbar').style.width=(S.xp/xpNeed()*100)+'%';$('combo').textContent=combo>2?'КОМБО x'+combo:'';$('spb').textContent=S.sp?S.sp+'◆':'';$('repCost').textContent=repCost();PO.tick&&PO.tick()}
function show(t,m,bt,dead){paused=true;$('pTitle').textContent=t;$('pMsg').textContent=m||'';$('resume').textContent=bt||'ПРОДОЛЖИТЬ';$('revive').style.display=dead?'block':'none';$('revive').textContent='ВОССТАНОВИТЬ ЯДРО · '+reviveCost()+'✦';$('paused').classList.add('show')}
function hideP(){$('paused').classList.remove('show');paused=false;last=performance.now();save()}
function resetField(){enemies=[];shots=[];combo=0;bossFor=0;spawnT=0;S.hp=maxHp();S.sh=maxSh()}
$('pause').onclick=()=>{if(!over&&!paused)show('ПАУЗА','')};
$('resume').onclick=()=>{if(over){S.coins=Math.floor(S.coins/2);S.wave=1;S.wk=0;S.xp=0;resetField();over=false}hideP()};
$('revive').onclick=()=>{if(S.coins>=reviveCost()){S.coins-=reviveCost();S.hp=maxHp()*.6;enemies=enemies.filter(e=>!e.boss);shots=[];over=false;hideP();toast('ЯДРО ВОССТАНОВЛЕНО')}else toast('НЕДОСТАТОЧНО КРЕДИТОВ')};
$('repair').onclick=()=>{if(over||paused||modal)return;let c=repCost();if(S.coins>=c&&S.hp<maxHp()){S.coins-=c;S.hp=Math.min(maxHp(),S.hp+35);toast('ЯДРО ОТРЕМОНТИРОВАНО')}else toast(S.coins<c?'НЕДОСТАТОЧНО КРЕДИТОВ':'ЗДОРОВЬЕ УЖЕ ПОЛНОЕ')};
$('power').onclick=()=>{if(over||paused||modal)return;if(S.coins<40){toast('НЕДОСТАТОЧНО КРЕДИТОВ');return}S.coins-=40;enemies.forEach(e=>hurt(e,45+clickDmg()*2,0));shake=8;vib(40);beep(200,.2);toast('ИМПУЛЬС АКТИВИРОВАН')};
function renderTree(){$('sp').textContent=S.sp;let gr=$('treeGrid');gr.innerHTML='';BR.forEach((bn,bi)=>{let col=document.createElement('div');col.className='col';col.innerHTML='<h3>'+bn+'</h3>';
 TREE.filter(n=>n.b==bi).forEach(n=>{let lv=L(n.id),lock=n.req&&L(n.req[0])<n.req[1],cost=lv+1,mx=lv>=n.max,b=document.createElement('button');b.className='node'+(lock?' lock':'')+(mx?' max':'')+(!lock&&!mx&&S.sp>=cost?' can':'');
  b.innerHTML='<b>'+n.n+'</b><small>'+n.d+'</small><em>'+(mx?'МАКС':lock?'НУЖНО: '+TREE.find(x=>x.id==n.req[0]).n+' '+n.req[1]:lv+'/'+n.max+' · '+cost+'◆')+'</em>';
  b.onclick=()=>{if(lock||mx||S.sp<cost)return;S.sp-=cost;S.sk[n.id]=lv+1;Bt=0;if(n.id=='hp')S.hp+=25;save();renderTree();beep(760,.06)};col.appendChild(b)});gr.appendChild(col)})}
$('tree').onclick=()=>{if(over||paused||modal)return;paused=true;renderTree();$('treeBox').classList.add('show')};
$('closeTree').onclick=()=>{$('treeBox').classList.remove('show');paused=false;last=performance.now()};
cv.addEventListener('pointerdown',e=>{if(paused||modal||over)return;let r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,cx=W/2,cy=H/2,b=B();S.st.taps++;
 let bs=shots.find(s=>s.eb&&Math.hypot(s.x-x,s.y-y)<28);if(bs){bs.life=0;S.coins+=2;txt(x,y,'СБИТ','#9ff');beep(1000,.03);return}
 if(Math.hypot(x-cx,y-cy)<28){let c=Math.ceil((1+b.mine+Math.floor(S.wave/3))*b.coinM*cw().cm);S.coins+=c;txt(cx+rand(-14,14),cy-20,'+'+c,'#ffe38a');burst(cx,cy,'#ffe38a',3);pulse=1;beep(520,.03);return}
 let t=null,bd=1e9;enemies.forEach(en=>{let d=Math.hypot(en.x-x,en.y-y)-en.r;if(d<34&&d<bd){bd=d;t=en}});let crit=Math.random()<critCh(),d=clickDmg()*(crit?2.5:1);if(crit)S.st.crit++;
 if(t){hurt(t,d,crit)}else{let a=Math.atan2(y-cy,x-cx);shots.push({x:cx,y:cy,vx:Math.cos(a)*420,vy:Math.sin(a)*420,life:1.5,d,crit,pr:0})}
 if(crit)vib(15);beep(crit?880:660,.03)});
/* ---------- API для станции, карты и профиля ---------- */
PO.S=()=>S;PO.B=B;PO.dirty=()=>{Bt=0};PO.toast=toast;PO.save=save;PO.beep=beep;PO.vib=vib;PO.WORLDS=WORLDS;
PO.modal=v=>{modal=v;if(!v)last=performance.now()};
PO.setWorld=i=>{S.wp[S.world]={wave:S.wave,wk:S.wk};S.world=i;let p=S.wp[i]||{wave:1,wk:0};S.wave=p.wave;S.wk=p.wk;S.wb[i]=Math.max(S.wb[i]||0,S.wave);resetField();over=false;$('paused').classList.remove('show');paused=false;applyWorld();save()};
PO.paused=()=>paused||over;
function onHide(){hidAt=Date.now();save();if(!over&&!paused&&!modal)show('ПАУЗА','Игра сохранена')}
function onShow(){resize();last=performance.now();if(hidAt){away((Date.now()-hidAt)/1000);hidAt=0}}
document.addEventListener('visibilitychange',()=>document.hidden?onHide():onShow());addEventListener('pagehide',save);addEventListener('pageshow',onShow);addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,200));
function loop(t){let dt=Math.min(.05,Math.max(0,(t-last)/1000));last=t;if(!paused&&!modal&&!over&&W>0)update(dt);if(W>0&&!modal)draw();uiT-=dt;if(uiT<=0){uiT=.1;ui()}requestAnimationFrame(loop)}
load();away((Date.now()-S.t)/1000);if(!WORLDS[S.world])S.world=0;S.hp=Math.min(S.hp||maxHp(),maxHp());if(S.hp<=0)S.hp=maxHp();applyWorld();
new ResizeObserver(resize).observe(cv.parentElement);resize();setInterval(save,4000);requestAnimationFrame(loop);
})();
