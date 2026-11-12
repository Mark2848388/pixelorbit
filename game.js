(()=>{'use strict';
const $=id=>document.getElementById(id),cv=$('arena'),ctx=cv.getContext('2d'),KEY='pixelorbit_v4',PO=window.PO={};
/* ---------- данные ---------- */
const TREE=[
{id:'dmg',b:0,n:'СИЛА ТАПА',d:'+4 базового урона за уровень. Усиливает каждый прямой выстрел.',max:10},
{id:'crit',b:0,n:'КРИТИЧЕСКИЙ УДАР',d:'+6% шанс критического попадания (×2,5 урона).',max:8,req:['dmg',2]},
{id:'overdrive',b:0,n:'ПЕРЕГРУЗКА',d:'+5% общего урона оружия за уровень.',max:8,req:['dmg',3]},
{id:'pulseCore',b:0,n:'ИМПУЛЬСНОЕ ЯДРО',d:'+18 урона активного импульса за уровень.',max:5,req:['overdrive',2]},
{id:'hp',b:1,n:'БРОНЯ КОРПУСА',d:'+25 максимального здоровья за уровень.',max:8},
{id:'regen',b:1,n:'РЕГЕНЕРАЦИЯ',d:'+0,5 HP в секунду.',max:6,req:['hp',2]},
{id:'shield',b:1,n:'ЭНЕРГОЩИТ',d:'+20 максимального щита, который восстанавливается.',max:5,req:['hp',2]},
{id:'thorns',b:1,n:'ОТРАЖАЮЩАЯ БРОНЯ',d:'Враги получают ответный урон при атаке ядра.',max:5,req:['regen',2]},
{id:'repairDrone',b:1,n:'РЕМОНТНЫЙ ДРОН',d:'+0,35 HP/с за уровень.',max:5,req:['regen',2]},
{id:'turret',b:2,n:'АВТО-ТУРЕЛЬ',d:'Урон и скорострельность автоматической турели.',max:8,req:['dmg',2]},
{id:'beam',b:2,n:'ПЛАЗМЕННЫЙ ЛУЧ',d:'Центральный луч автоматически прожигает врага.',max:5,req:['turret',2]},
{id:'beam2',b:2,n:'РАЗДВОЕННЫЙ ЛУЧ',d:'Добавляет второй независимый лазерный луч.',max:3,req:['beam',2]},
{id:'scanner',b:2,n:'СКАНЕР УЯЗВИМОСТЕЙ',d:'+2% критического шанса за уровень.',max:5,req:['beam',1]},
{id:'capacitor',b:2,n:'СУПЕРКОНДЕНСАТОР',d:'+0,15 пассивных кредитов/с за уровень.',max:5,req:['turret',2]},
{id:'drone',b:3,n:'БОЕВЫЕ ДРОНЫ',d:'+1 орбитальный дрон за уровень.',max:4,req:['turret',2]},
{id:'guardian',b:3,n:'СТРАЖ ЯДРА',d:'Дроны наносят +8% урона за уровень.',max:5,req:['drone',1]},
{id:'swarm',b:3,n:'РОЙ ПЕРЕХВАТЧИКОВ',d:'Каждые 5 уровней открывает дополнительного помощника.',max:3,req:['guardian',2]},
{id:'repair',b:3,n:'АВАРИЙНЫЙ ПРОТОКОЛ',d:'+5 HP при переходе на новую волну за уровень.',max:5,req:['repairDrone',2]},
{id:'gold',b:4,n:'ТРОФЕЙНЫЙ ПРОТОКОЛ',d:'+20% кредитов за убийство.',max:8},
{id:'mine',b:4,n:'ГЛУБОКАЯ ДОБЫЧА',d:'+2 кредита за тап по ядру.',max:8,req:['gold',2]},
{id:'xp',b:4,n:'НЕЙРООБУЧЕНИЕ',d:'+15% получаемого опыта.',max:5,req:['gold',2]},
{id:'off',b:4,n:'АВТОНОМНЫЙ РЕЖИМ',d:'Увеличивает лимит и доход офлайн-прогресса.',max:5,req:['mine',2]},
{id:'salvage',b:4,n:'ПЕРЕРАБОТКА',d:'+8% деталей с уничтоженных врагов за уровень.',max:5,req:['mine',2]},
{id:'cartographer',b:4,n:'КАРТОГРАФ СЕКТОРОВ',d:'+10% наград за исследование карты.',max:5,req:['xp',2]}
];
const BR=['КЛИНКИ ХАОСА · АТАКА','ЩИТ И ВОССТАНОВЛЕНИЕ','ТЕХНОЛОГИИ И ОРУЖИЕ','ДРОНЫ И ПОДДЕРЖКА','ИССЛЕДОВАНИЕ И РЕСУРСЫ'];
const WORLDS=[
{n:'ОРИОН',d:'Тихий сектор. Идеален для старта.',bg:['#303b59','#242c43','#171c2b'],rc:['#f4b1d5','#b7c9f5','#f2a0bd'],hp:1,cm:1,sp:1,tn:null,req:0,pl:['#6fa8ff','#2a4d9a'],ring:0,x:300,y:2650},
{n:'ПЕПЕЛ',d:'Вулканический мир. Враги быстрее.',bg:['#4d2a22','#34191a','#1b0e10'],rc:['#ffb36b','#ff7a3a','#ff5a5a'],hp:1.3,cm:1.3,sp:1.25,tn:'#ff7a3a',req:8,pl:['#ff9a4a','#8a2a10'],ring:0,x:130,y:2480},
{n:'КРИСТАЛЛ',d:'Ледяные кристаллы. Враги крепче.',bg:['#274a5a','#183541','#0b1b24'],rc:['#9ff0ff','#6fb8ff','#c8f4ff'],hp:1.7,cm:1.6,sp:1,tn:'#6fe3ff',req:12,pl:['#9ff0ff','#2a7a9a'],ring:1,x:430,y:2360},
{n:'КОЛОНИЯ',d:'Джунгли роя. Щедрые награды.',bg:['#25492b','#18331f','#0b1a10'],rc:['#9fffa0','#5ed07a','#d4ff9a'],hp:2.1,cm:2,sp:1.1,tn:'#7dff7a',req:16,pl:['#7dff7a','#1f6a30'],ring:0,x:170,y:2200},
{n:'РАЗЛОМ',d:'Нестабильное пространство.',bg:['#43286a','#2c1850','#150a2a'],rc:['#d9a0ff','#a07aff','#ff9ae8'],hp:2.7,cm:2.6,sp:1.15,tn:'#c07bff',req:20,pl:['#c07bff','#4a1f8a'],ring:1,x:440,y:2060},
{n:'ФРОНТИР',d:'Торговая граница. Много кредитов.',bg:['#4d3d1e','#352a14','#1b150a'],rc:['#ffe09a','#ffc36b','#fff0c0'],hp:3.4,cm:3.4,sp:1.1,tn:'#ffd36b',req:25,pl:['#ffd36b','#8a5a10'],ring:0,x:150,y:1920},
{n:'АНТИМАТЕРИЯ',d:'Всё вокруг взрывоопасно.',bg:['#561e30','#3a1220','#1c0810'],rc:['#ff9aa8','#ff4d6d','#ffb3c1'],hp:4.6,cm:4.8,sp:1.25,tn:'#ff4d6d',req:30,pl:['#ff4d6d','#7a1030'],ring:1,x:400,y:1790},
{n:'СИНГУЛЯРНОСТЬ',d:'Конец и начало всего.',bg:['#401e5a','#241038','#0e0418'],rc:['#ff9af0','#9a7aff','#7affff'],hp:6,cm:7,sp:1.35,tn:'#ff6bf0',req:40,pl:['#ff6bf0','#3a1070'],ring:1,x:300,y:1630},
{n:'ЭХО ТУМАННОСТИ',d:'Мир древних маяков. Враги используют усиленную броню.',bg:['#203c56','#14263d','#091321'],rc:['#8cecff','#5e91d8','#d2a7ff'],hp:7.2,cm:8.2,sp:1.45,tn:'#76cfff',req:45,pl:['#76cfff','#253d83'],ring:1,x:150,y:1555},
{n:'КРАЙ БЕЗДНЫ',d:'Последний рубеж за пределами известных карт.',bg:['#45204d','#26112f','#100817'],rc:['#ff9adf','#b76bff','#70e8ff'],hp:8.8,cm:10,sp:1.55,tn:'#e27bff',req:50,pl:['#e27bff','#45146b'],ring:1,x:450,y:1535},
{n:'НЕОНОВЫЙ ШТОРМ',d:'Электрические разряды ускоряют врагов; редкие батареи дают импульсный заряд.',bg:['#203e78','#121d4a','#070d27'],rc:['#67f7ff','#5288ff','#e07bff'],hp:10.5,cm:11.5,sp:1.7,tn:'#62eaff',req:55,reqLevel:12,pl:['#62eaff','#193b9b'],ring:1,x:110,y:1240,special:'storm'},
{n:'БИОСФЕРА',d:'Растительные стражи лечат друг друга; уничтожай целителей первыми.',bg:['#1d593d','#103d2b','#061b17'],rc:['#8dff9a','#46d987','#d5ff9b'],hp:12,cm:13,sp:1.35,tn:'#72ff8b',req:60,reqLevel:15,pl:['#72ff8b','#176b43'],ring:0,x:490,y:1140,special:'healer'},
{n:'ЛЕДЯНАЯ ГРОБНИЦА',d:'Холод замедляет восстановление щита; ледяные панцири требуют больше урона.',bg:['#285b7c','#153d62','#071c35'],rc:['#b9f5ff','#75caff','#e4fbff'],hp:14,cm:15,sp:1.45,tn:'#9cecff',req:65,reqLevel:18,pl:['#9cecff','#286caa'],ring:1,x:90,y:1030,special:'frost'},
{n:'КРАСНЫЙ ГИГАНТ',d:'Солнечные вспышки наносят периодический урон ядру.',bg:['#71331e','#431b20','#1e0b17'],rc:['#ffc16b','#ff654d','#ffe0a1'],hp:17,cm:18,sp:1.6,tn:'#ff8a55',req:70,reqLevel:21,pl:['#ff8a55','#9a2c20'],ring:0,x:500,y:930,special:'flare'},
{n:'ЗЕРКАЛЬНЫЙ ЛАБИРИНТ',d:'Фантомы копируют атаки; комбо даёт больше наград.',bg:['#49336e','#261d4e','#100d2b'],rc:['#e3c0ff','#9b8cff','#9df4ff'],hp:20,cm:21,sp:1.75,tn:'#c9a0ff',req:75,reqLevel:24,pl:['#c9a0ff','#593c9d'],ring:1,x:100,y:820,special:'mirror'},
{n:'МАШИННЫЙ КОВЧЕГ',d:'Автоматические турели прикрывают врагов; импульс эффективнее.',bg:['#38465a','#1b2b43','#090f20'],rc:['#b9d5ff','#6c9cff','#f1f7ff'],hp:24,cm:25,sp:1.5,tn:'#8fbaff',req:80,reqLevel:27,pl:['#8fbaff','#315a9a'],ring:0,x:500,y:710,special:'turret'},
{n:'СОЛНЕЧНЫЙ ТРОН',d:'Элитные стражи оставляют усиленные детали.',bg:['#6b4a20','#3c2814','#1c1008'],rc:['#fff0a3','#ffc45e','#ff8a4b'],hp:29,cm:30,sp:1.8,tn:'#ffd36b',req:85,reqLevel:30,pl:['#ffd36b','#986018'],ring:1,x:100,y:600,special:'elite'},
{n:'ЭХО ПУСТОТЫ',d:'Пустотные волны ослабляют щит, но тайники дают редкие ресурсы.',bg:['#29234f','#171331','#080817'],rc:['#b6a5ff','#7d72ff','#ff9bf2'],hp:35,cm:36,sp:1.9,tn:'#a99aff',req:90,reqLevel:34,pl:['#a99aff','#44368e'],ring:1,x:500,y:490,special:'void'},
{n:'СЕРДЦЕ ВСЕЛЕННОЙ',d:'Финальный сектор: адаптивные боссы, высокая скорость и лучшие награды.',bg:['#542a60','#281642','#0c0920'],rc:['#ffb4f0','#b08aff','#7ef8ff'],hp:43,cm:45,sp:2.05,tn:'#e49bff',req:100,reqLevel:38,pl:['#e49bff','#6b278f'],ring:1,x:100,y:360,special:'core'},
{n:'ЗАПРЕДЕЛЬЕ',d:'Скрытый мир после ядра вселенной. Боссы меняют тактику, а ресурсы удваиваются.',bg:['#203c53','#17152f','#050916'],rc:['#a7f7ff','#a58cff','#ffffff'],hp:55,cm:60,sp:2.2,tn:'#a7f7ff',req:115,reqLevel:42,pl:['#a7f7ff','#3b3a9d'],ring:1,x:500,y:220,special:'apex'}
];
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
{id:'beacon',n:'ЗВЁЗДНЫЙ МАЯК',w:1,h:1,max:3,c:[160,18],d:'+4% кредитов и опыта за уровень.'},
{id:'shieldGen',n:'ЩИТ-ГЕНЕРАТОР',w:2,h:2,max:2,c:[280,35],d:'+28 щита и +0.2 реген щита за уровень. Синергия с Куполом.'},
{id:'miner',n:'ГЛУБИННЫЙ РУДНИК',w:2,h:2,max:2,c:[200,25],d:'+1.5 оффлайн-кредита/с и +1 деталь/10мин за уровень.'},
{id:'warp',n:'ВАРП-РЕЛЕ',w:1,h:1,max:2,c:[250,40],d:'+6% опыта и +3% кредитов. Ускоряет открытие миров.'},
{id:'aiCore',n:'ЯДРО ИИ',w:2,h:2,max:1,c:[400,60],d:'Снижает КД способностей на 12% за уровень. Авто-импульс раз в 45с.'},
{id:'quantum',n:'КВАНТОВАЯ КУЗНИЦА',w:2,h:2,max:2,c:[320,45],d:'+8% крит-урона и +3% шанса крита за уровень.'},
{id:'grid',n:'СЕТЬ ЗАЩИТЫ',w:2,h:2,max:2,c:[260,30],d:'+1.2 уровня турелей и +4% урона башен за уровень.'},
{id:'reactor',n:'ТЕРМОЯДЕРНЫЙ РЕАКТОР',w:2,h:2,max:1,c:[500,80],d:'×1.25 ко всем производственным бонусам станции. Требует синергии.'},
{id:'barracks',n:'КАЗАРМЫ',w:2,h:2,max:2,c:[240,28],d:'+1 слот помощника и +5% урона помощников за уровень.'},
{id:'observ',n:'ОБСЕРВАТОРИЯ',w:1,h:1,max:2,c:[180,22],d:'+10% опыта и +5% шанса редких наград за уровень.'},
{id:'artifact',n:'АЛИЕН-АРТЕФАКТ',w:1,h:1,max:1,c:[600,100],d:'Случайный мощный бонус каждый день: урон / щит / ресурсы. Уникально.'},
{id:'trade',n:'ТОРГОВЫЙ УЗЕЛ',w:2,h:2,max:1,c:[350,50],d:'Конвертация ресурсов выгоднее на 20%. +пассивные кредиты.'},
{id:'nest',n:'ГНЕЗДО РОЯ',w:2,h:2,max:2,c:[300,40],d:'+2 орбитальных дрона и +6% урона дронов за уровень.'}];
PO.WORLDS=WORLDS;PO.BLD=BLD;
/* ---------- состояние ---------- */
const fresh=()=>({coins:50,parts:20,kills:0,wave:1,wk:0,level:1,xp:0,best:1,hp:100,sh:0,sp:0,sk:{},snd:1,vib:1,fxq:1,music:1,world:0,wp:{},wb:{0:1},bld:[],size:0,prof:{name:'ПИЛОТ-07',avatar:'a0',title:0,accent:'#8fd0ff'},st:{taps:0,bosses:0,crit:0,combo:0,time:0,totalTime:0,built:0,killsToday:0},daily:{last:'',streak:0},quests:{daily:[],weekly:[],monthly:[],claimed:{},lastD:'',lastW:'',lastM:''},seen:{},cosmetic:{skin:'alien',owned:['alien']},impulseAt:0,artDay:null,t:Date.now(),chat:{}});
let S=fresh(),W=0,H=0,worldEventT=0,freezeUntil=0,abilityTimers={heavy:0,freeze:0,chain:0},enemies=[],shots=[],parts=[],texts=[],beamFx=[],paused=false,modal=false,over=false,frame=0,last=performance.now(),hidAt=0,combo=0,comboT=0,autoT=0,pulse=0,shake=0,bossFor=0,uiT=0,spawnT=0,helperT=[0,0,0],beamT=0,Bt=0,Bc=null,pal=[];
const L=id=>S.sk[id]||0,rand=(a,c)=>a+Math.random()*(c-a),cw=()=>WORLDS[S.world]||WORLDS[0],vib=n=>{try{S.vib&&navigator.vibrate&&navigator.vibrate(n)}catch(e){}};
function B(){if(!Bc||Bt<=0){let b={dmg:4*L('dmg'),crit:.05+.06*L('crit')+.02*L('scanner'),hp:25*L('hp'),regen:.5*L('regen')+.35*L('repairDrone'),sh:20*L('shield'),coinM:1+.2*L('gold'),xpM:1+.15*L('xp'),mine:2*L('mine'),off:L('off'),drones:L('drone'),turret:L('turret'),thorns:12*L('thorns'),repair:0,passive:.15*L('capacitor'),beam:L('beam'),beam2:L('beam2'),helperBonus:.08*L('guardian')+.12*L('swarm'),beamBonus:0,bonusM:1,damageM:1+.05*L('overdrive'),pulse:18*L('pulseCore'),mapBonus:.1*L('cartographer'),critDmg:2.5,cdRed:0,autoPulse:0,helperSlots:0,rareChance:0,shRegen:0,tradeBonus:0,artBonus:null};
 const has=t=>S.bld.some(o=>o.t==t);const lvl=t=>{let s=0;S.bld.forEach(o=>{if(o.t==t)s+=o.l});return s};
 S.bld.forEach(o=>{let l=o.l,t=o.t;
  if(t=='gen')b.passive+=.3*l;if(t=='lab')b.xpM+=.08*l;if(t=='tur')b.turret+=.5*l;if(t=='dome')b.sh+=15*l;
  if(t=='dock'){b.repair+=.08*l;b.regen+=.3*l}if(t=='drl')b.mine+=l;if(t=='rad')b.crit+=.01*l;
  if(t=='bay')b.helperBonus+=.03*l;if(t=='array')b.beamBonus+=.05*l;if(t=='beacon')b.bonusM+=.04*l;
  if(t=='shieldGen'){b.sh+=28*l;b.shRegen+=.2*l}if(t=='miner'){b.passive+=1.5*l;b.off+=l}if(t=='warp'){b.xpM+=.06*l;b.bonusM+=.03*l;b.mapBonus+=.05*l}
  if(t=='aiCore'){b.cdRed+=.12*l;b.autoPulse=1}if(t=='quantum'){b.critDmg+=.08*l;b.crit+=.03*l}
  if(t=='grid'){b.turret+=1.2*l;b.beamBonus+=.04*l}if(t=='reactor'){b.bonusM*=1.25}if(t=='barracks'){b.helperSlots+=l;b.helperBonus+=.05*l}
  if(t=='observ'){b.xpM+=.10*l;b.rareChance+=.05*l}if(t=='artifact'){b.artBonus=S.artDay||'dmg'}if(t=='trade'){b.tradeBonus=.2;b.passive+=.5*l}
  if(t=='nest'){b.drones+=2*l;b.helperBonus+=.06*l}
 });
 // Синергии станций
 if(has('dome')&&has('shieldGen')){b.sh*=1.15;b.shRegen+=0.3}
 if(has('gen')&&has('reactor')){b.passive*=1.4}
 if(has('bay')&&has('nest')){b.helperBonus*=1.25}
 if(has('array')&&has('grid')){b.beamBonus*=1.3;b.turret+=1}
 if(has('lab')&&has('observ')){b.xpM*=1.2}
 if(has('drl')&&has('miner')){b.mine*=1.3;b.passive+=0.5}
 if(has('aiCore')&&has('quantum')){b.crit+=0.04;b.cdRed+=0.08}
 b.coinM*=b.bonusM;b.xpM*=b.bonusM;Bc=b;Bt=.5}return Bc}
const helperCount=()=>Math.min(3,1+Math.floor(Math.max(0,S.level-1)/5));
function grantOffline(){try{const now=Date.now();const last=S.t||now;let sec=Math.floor((now-last)/1000);if(sec<45){S.t=now;return;}sec=Math.min(sec,8*3600);const b=B();const rate=(b.passive||0.15)+(b.mine||0)*0.05;const coins=Math.floor(rate*sec*0.45);const parts=Math.floor(sec/400);if(coins>0||parts>0){S.coins=(S.coins||0)+coins;S.parts=(S.parts||0)+parts;const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60);const t=(h?h+'ч ':'')+(m?m+'м':'')||sec+'с';setTimeout(()=>PO.toast('Оффлайн '+t+': +'+coins+'✦'+(parts?' +'+parts+'◆':'')),600);}S.t=now;PO.save();}catch(e){}}
const maxHp=()=>100+B().hp,maxSh=()=>B().sh,clickDmg=()=>19+B().dmg+Math.floor(S.wave/2)+Math.floor((S.level||1)/3),critCh=()=>Math.min(.85,B().crit),xpNeed=()=>Math.floor(10*Math.pow(1.3,S.level-1)),need=()=>8+3*S.wave,repCost=()=>Math.max(5,Math.round(25*(1-Math.min(.6,B().repair))));
const mix=(a,b,t)=>{let p=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16)),x=p(a),y=p(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('')};
function applyWorld(){let w=cw(),base=[['#dce6ff','#687ba7'],['#ffc2d4','#c4577c'],['#9fb4ff','#3d4f9a'],['#ff8a8a','#a02a3a']];pal=base.map(p=>w.tn?[mix(p[0],w.tn,.3),mix(p[1],w.tn,.3)]:p);$('arenaWrap').style.background='radial-gradient(ellipse at 50% 55%,'+w.bg[0]+' 0,'+w.bg[1]+' 57%,'+w.bg[2]+' 100%)';$('worldName').textContent='СЕКТОР · '+w.n}
let ac;function beep(f,d){if(!S.snd)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();let o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=f;g.gain.value=.03;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function toast(s){let t=$('toast');t.textContent=s;setTimeout(()=>{if(t.textContent===s)t.textContent=''},2200)}
/* ---------- задания (daily/weekly/monthly) ---------- */
const QTEMPLATES={
daily:[
 {id:'d_kills',n:'Охотник',d:'Убей {t} врагов',t:80,r:{coins:120,parts:5},track:'kills'},
 {id:'d_taps',n:'Точный удар',d:'Сделай {t} тапов',t:200,r:{coins:100,xp:30},track:'taps'},
 {id:'d_wave',n:'Волна',d:'Достигни волны {t}',t:15,r:{coins:150,parts:8},track:'wave'},
 {id:'d_build',n:'Строитель',d:'Построй или улучши {t} зданий',t:2,r:{parts:12,coins:80},track:'built'},
 {id:'d_boss',n:'Охотник на боссов',d:'Победи босса',t:1,r:{coins:200,parts:15},track:'bosses'},
 {id:'d_time',n:'Дежурство',d:'Проведи {t} мин в игре',t:15,r:{coins:90,xp:40},track:'timeMin'},
 {id:'d_crit',n:'Критик',d:'Нанеси {t} критических ударов',t:25,r:{coins:110,parts:6},track:'crit'}
],
weekly:[
 {id:'w_kills',n:'Галактический охотник',d:'Убей {t} врагов за неделю',t:800,r:{coins:800,parts:40},track:'kills'},
 {id:'w_wave',n:'Ветеран волн',d:'Достигни волны {t}',t:40,r:{coins:600,parts:30,xp:150},track:'wave'},
 {id:'w_build',n:'Колонизатор',d:'Построй всего {t} зданий',t:8,r:{parts:50,coins:500},track:'builtTotal'},
 {id:'w_boss',n:'Истребитель',d:'Победи {t} боссов',t:5,r:{coins:1000,parts:60},track:'bosses'},
 {id:'w_world',n:'Исследователь',d:'Открой {t} новых миров',t:2,r:{coins:700,parts:35},track:'worlds'}
],
monthly:[
 {id:'m_kills',n:'Легенда орбиты',d:'Убей {t} врагов за месяц',t:5000,r:{coins:5000,parts:200,xp:500},track:'kills'},
 {id:'m_level',n:'Мастер пилот',d:'Достигни уровня {t}',t:25,r:{coins:4000,parts:150},track:'level'},
 {id:'m_best',n:'Рекордсмен',d:'Установи рекорд волны {t}',t:80,r:{coins:6000,parts:250},track:'best'},
 {id:'m_build',n:'Архитектор',d:'Имей {t} построек одновременно',t:12,r:{parts:300,coins:3500},track:'bldCount'}
]};
function dayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function weekKey(){const d=new Date();const onejan=new Date(d.getFullYear(),0,1);const w=Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7);return d.getFullYear()+'-W'+w}
function monthKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)}
function pickQuests(list,n){const sh=[...list].sort(()=>Math.random()-0.5);return sh.slice(0,n).map(q=>({...q,prog:0,done:0,claimed:0}))}
function ensureQuests(){
  if(!S.quests)S.quests={daily:[],weekly:[],monthly:[],claimed:{},lastD:'',lastW:'',lastM:''};
  const dk=dayKey(),wk=weekKey(),mk=monthKey();
  if(S.quests.lastD!==dk){S.quests.daily=pickQuests(QTEMPLATES.daily,4);S.quests.lastD=dk;S.st.killsToday=0;if(S.daily.last!==dk){S.daily.streak=(S.daily.last&& (new Date(dk)-new Date(S.daily.last))/(864e5)<2)?(S.daily.streak||0)+1:1;S.daily.last=dk} }
  if(S.quests.lastW!==wk){S.quests.weekly=pickQuests(QTEMPLATES.weekly,3);S.quests.lastW=wk}
  if(S.quests.lastM!==mk){S.quests.monthly=pickQuests(QTEMPLATES.monthly,2);S.quests.lastM=mk}
  // artifact daily roll
  if(!S.artDay||S.artDay.day!==dk){const opts=['dmg','sh','coins','crit'];S.artDay={day:dk,type:opts[Math.floor(Math.random()*opts.length)]}}
}
function questTrack(type,val=1){
  ensureQuests();
  const apply=(qs)=>{qs.forEach(q=>{if(q.done||q.claimed)return;if(q.track===type){if(type==='wave'||type==='best'||type==='level'||type==='bldCount')q.prog=Math.max(q.prog,val);else q.prog+=val;if(q.prog>=q.t)q.done=1}})}
  apply(S.quests.daily);apply(S.quests.weekly);apply(S.quests.monthly);
  if(type==='kills')S.st.killsToday=(S.st.killsToday||0)+val;
}
function claimQuest(period,id){
  ensureQuests();const qs=S.quests[period];const q=qs.find(x=>x.id===id);if(!q||!q.done||q.claimed)return false;
  q.claimed=1;const r=q.r;if(r.coins)S.coins+=r.coins;if(r.parts)S.parts+=r.parts;if(r.xp){S.xp=(S.xp||0)+r.xp;while(S.xp>=xpNeed()){S.xp-=xpNeed();S.level++;S.sp=(S.sp||0)+1}}
  toast('Награда: '+(r.coins?r.coins+'✦ ':'')+(r.parts?r.parts+'◆ ':'')+(r.xp?r.xp+' XP':''));PO.save();return true;
}
PO.ensureQuests=ensureQuests;PO.questTrack=questTrack;PO.claimQuest=claimQuest;PO.dayKey=dayKey;PO.B=B;
/* ---------- сохранение ---------- */
function save(){try{S.t=Date.now();localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function load(){try{let r=JSON.parse(localStorage.getItem(KEY));if(r&&typeof r==='object'){S=Object.assign(fresh(),r);S.prof=Object.assign(fresh().prof,r.prof);S.st=Object.assign(fresh().st,r.st);S.daily=Object.assign(fresh().daily,r.daily);S.cosmetic=Object.assign(fresh().cosmetic,r.cosmetic);S.cosmetic.owned=Array.isArray(S.cosmetic.owned)?S.cosmetic.owned:['alien'];try{grantOffline()}catch(e){}return true}
 let o=JSON.parse(localStorage.getItem('pixelorbit_v2'));if(o&&typeof o==='object'){['coins','kills','wave','wk','level','xp','best','sp','sk'].forEach(k=>{if(o[k]!=null)S[k]=o[k]});S.wb[0]=S.best}}catch(e){}return false}
function away(sec){if(sec<5)return;sec=Math.min(sec,28800);let c=Math.floor(sec*(.08+.05*B().off+.25*B().passive)*(1+S.wave*.25)*cw().cm);let p=Math.floor(sec/350);if(c>0||p>0){S.coins+=c;S.parts=(S.parts||0)+p;toast('ОФФЛАЙН: +'+c+'✦'+(p?' +'+p+'◆':''))}}
function resize(){let r=cv.getBoundingClientRect();if(r.width<10||r.height<10)return;let d=Math.min(devicePixelRatio||1,2),nw=Math.floor(r.width*d),nh=Math.floor(r.height*d);if(cv.width!==nw||cv.height!==nh){let sx=W?r.width/W:1,sy=H?r.height/H:1;enemies.forEach(e=>{e.x*=sx;e.y*=sy});cv.width=nw;cv.height=nh}ctx.setTransform(d,0,0,d,0,0);ctx.imageSmoothingEnabled=false;W=r.width;H=r.height}
/* ---------- бой ---------- */
function spawn(boss,px,py,mini){let w=S.wave,a=rand(0,6.283),rad=Math.max(W,H)*.6,wd=cw(),t=boss?3:(w>=3&&Math.random()<.2?2:(w>=2&&Math.random()<.4?1:0)),hp=(24+w*10+Math.pow(w,1.18)*2)*[1,.62,3.8,w*6][t]*wd.hp*(mini?.4:1);
 enemies.push({x:px!=null?px:W/2+Math.cos(a)*rad,y:py!=null?py:H/2+Math.sin(a)*rad,hp,max:hp,t,r:mini?5:[8,6,11,20][t],s:(rand(25,36)+w*1.9)*[1,2.05,.68,.5][t]*wd.sp,hit:0,fl:0,st:2,boss:!!boss,sm:0});if(boss){toast('⚠ БОСС ВОЛНЫ');vib([80,40,80])}}
function burst(x,y,c,n=8){if(!S.fxq)n=Math.ceil(n/3);for(let i=0;i<n;i++){let a=rand(0,6.283),v=rand(25,110);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.2,.6),color:c})}}
const txt=(x,y,s,c)=>texts.push({x,y,s,c,life:.8});
function hurt(e,d,crit){if(e.dead)return;d=Math.round(d*B().damageM);e.hp-=d;e.fl=.08;txt(e.x,e.y-10,Math.round(d),crit?'#ffd36b':'#fff');burst(e.x,e.y,crit?'#ffd36b':'#ffe69a',crit?6:3);if(e.hp<=0)kill(e)}
function kill(e){e.dead=1;S.kills++;S.wk++;combo++;comboT=2.5;questTrack('kills');S.st.combo=Math.max(S.st.combo,combo);let b=B(),c=Math.ceil((3+S.wave/2)*(e.t==2?3:e.t==3?30:e.mini?.3:1)*b.coinM*cw().cm*(1+Math.min(combo,40)*.03));S.coins+=c;if(e.boss&&['elite','core','apex'].includes(cw().special))S.parts+=3;txt(e.x,e.y,'+'+c,'#ffe38a');burst(e.x,e.y,e.boss?'#ffd36b':'#f28cae',e.boss?30:10);
 if(Math.random()<.04+(e.t==2?.06:0)+.015*L('salvage')){S.parts++;txt(e.x,e.y-14,'+1⚙','#9fb4ff')}gain(e.boss?15:e.t==2?2:1);
 if(e.boss){S.sp+=2;S.parts+=4+Math.floor(S.wave/5);S.st.bosses++;questTrack('bosses');toast('БОСС УНИЧТОЖЕН! +2 ОЧКА НАВЫКОВ');vib(80);shake=12}}
function gain(n){S.xp+=n*B().xpM;while(S.xp>=xpNeed()){S.xp-=xpNeed();S.level++;S.sp++;toast('УРОВЕНЬ '+S.level+' · +1 ОЧКО НАВЫКОВ');beep(990,.12)}}
function hitCore(d){if(S.sh>0){let a=Math.min(S.sh,d);S.sh-=a;d-=a}S.hp-=d;shake=6;vib(20)}
const dronePos=(i,n)=>{let a=frame*2.2+i*6.283/n;return[W/2+Math.cos(a)*52,H/2+Math.sin(a)*52]};
const near=(x,y,ex)=>enemies.reduce((p,c)=>!c.dead&&c!==ex&&(!p||Math.hypot(c.x-x,c.y-y)<Math.hypot(p.x-x,p.y-y))?c:p,null);
function update(dt){frame+=dt;S.st.totalTime=(S.st.totalTime||0)+dt;comboT-=dt;if(comboT<=0)combo=0;pulse=Math.max(0,pulse-dt*4);shake=Math.max(0,shake-dt*20);Bt-=dt;S.st.time+=dt;S.st.totalTime=(S.st.totalTime||0)+dt;worldEventT+=dt;if(!S._lastMin)S._lastMin=0;const mins=Math.floor(S.st.time/60);if(mins>S._lastMin){questTrack('timeMin',mins-S._lastMin);S._lastMin=mins}
 let b=B(),w=S.wave,cx=W/2,cy=H/2,special=cw().special;
 // У каждого позднего сектора есть собственная игровая опасность/механика.
 if(special==='storm'&&worldEventT>8){worldEventT=0;enemies.forEach(e=>e.boost=2.2);toast('НЕОНОВЫЙ ШТОРМ: ВРАГИ УСКОРЕНЫ')}
 if(special==='healer'&&worldEventT>6){worldEventT=0;let alive=enemies.filter(e=>!e.dead);alive.forEach(e=>{if(!e.boss)e.hp=Math.min(e.max,e.hp+e.max*.12)});if(alive.length)toast('БИОСФЕРА: СТРАЖИ ВОССТАНАВЛИВАЮТСЯ')}
 if(special==='flare'&&worldEventT>10){worldEventT=0;hitCore(10+Math.floor(w*1.4));shake=5;toast('ВСПЫШКА КРАСНОГО ГИГАНТА')}
 if(special==='mirror'&&worldEventT>9){worldEventT=0;let a=rand(0,6.283),r=Math.max(W,H)*.52;spawn(0,cx+Math.cos(a)*r,cy+Math.sin(a)*r,1);spawn(0,cx-Math.cos(a)*r,cy-Math.sin(a)*r,1);toast('ЗЕРКАЛЬНЫЕ ФАНТОМЫ')}
 if(special==='void'&&worldEventT>7){worldEventT=0;let a=rand(0,6.283);shots.push({x:cx+Math.cos(a)*Math.min(W,H)*.4,y:cy+Math.sin(a)*Math.min(W,H)*.4,vx:-Math.cos(a)*145,vy:-Math.sin(a)*145,life:3,eb:1,d:12+w*.7});toast('ЭХО ПУСТОТЫ: СНАРЯД В ПОЛЁТЕ')}
 if(special==='turret'&&worldEventT>8){worldEventT=0;spawn(0,cx+rand(-W*.35,W*.35),cy-Math.min(W,H)*.45);toast('МАШИННЫЙ КОВЧЕГ: ТУРЕЛЬНЫЙ ДОЗОР')}

 if(w%5==0&&bossFor!=w){bossFor=w;spawn(1)}
 spawnT-=dt;if(spawnT<=0&&enemies.length<Math.min(22,4+w*2)){spawnT=Math.max(.3,1.2-w*.04);spawn(0)}
 S.hp=Math.min(maxHp(),S.hp+b.regen*dt);if(maxSh())S.sh=Math.min(maxSh(),S.sh+(2+maxSh()/20)*dt*(special==='frost'?.5:1));if(b.passive)S.coins+=b.passive*cw().cm*dt;
 autoT+=dt;if(autoT>=1.1*Math.pow(.9,b.turret)&&enemies.length){autoT=0;let e=near(cx,cy);if(e){let a=Math.atan2(e.y-cy,e.x-cx);shots.push({x:cx,y:cy,vx:Math.cos(a)*300,vy:Math.sin(a)*300,life:1.5,d:4+3*b.turret+w/3})}}
 // Три самостоятельных помощника: отдельные модели и собственные очереди стрельбы.
 for(let i=0;i<helperCount();i++){helperT[i]-=dt;if(helperT[i]<=0){let e=near(cx+Math.cos(frame*1.8+i*2.1)*66,cy+Math.sin(frame*1.8+i*2.1)*66);if(e){helperT[i]=[.95,.78,.62][i];let hx=cx+Math.cos(frame*1.8+i*2.1)*66,hy=cy+Math.sin(frame*1.8+i*2.1)*66,a=Math.atan2(e.y-hy,e.x-hx);shots.push({x:hx,y:hy,vx:Math.cos(a)*360,vy:Math.sin(a)*360,life:1.5,d:(3+i*2)*(1+b.helperBonus),helper:i})}}}
 // Прокачиваемые лучи ядра бьют по ближайшим целям автоматически.
 beamT-=dt;if((b.beam||b.beam2)&&beamT<=0&&enemies.length){beamT=Math.max(.28,.95-.08*b.beam);let targets=[];let first=near(cx,cy);if(first)targets.push(first);if(b.beam2>=1){let second=enemies.filter(e=>!e.dead&&e!==first).sort((a,c)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(c.x-cx,c.y-cy))[0];if(second)targets.push(second)}targets.slice(0,1+Math.min(1,b.beam2)).forEach((e,i)=>{let dmg=(12+5*b.beam+4*b.beam2)*(1+b.beamBonus);hurt(e,dmg,0);beamFx.push({x:cx,y:cy,tx:e.x,ty:e.y,life:.18,color:i?'#e7a0ff':'#7feaff'})})}

 let nd=b.drones;
 enemies.forEach(e=>{if(e.dead)return;e.fl=Math.max(0,e.fl-dt);
  if(e.boss){e.phase=e.phase||0;let threshold=[.75,.5,.25][e.phase];if(e.phase<3&&e.hp<e.max*threshold){e.phase++;spawn(0,e.x+30,e.y,1);if(e.phase>=2)spawn(0,e.x-30,e.y,1);toast('БОСС · ФАЗА '+(e.phase+1))}}
  if(Date.now()<freezeUntil){e.fl=Math.max(0,e.fl-dt);return;}
  if(e.boss){e.st-=dt;if(e.st<=0){e.st=(special==='void'||special==='apex')?1.65:2.4;let a=Math.atan2(cy-e.y,cx-e.x);shots.push({x:e.x,y:e.y,vx:Math.cos(a)*150,vy:Math.sin(a)*150,life:4,eb:1,d:10})}}
  let a=Math.atan2(cy-e.y,cx-e.x);if(e.boost>0)e.boost=Math.max(0,e.boost-dt);e.x+=Math.cos(a)*e.s*(e.boost>0?1.65:1)*dt;e.y+=Math.sin(a)*e.s*(e.boost>0?1.65:1)*dt;
  if(Math.hypot(e.x-cx,e.y-cy)<e.r+10){e.hit+=dt;if(e.hit>.65){e.hit=0;hitCore((5+w*.8)*[1,.7,1.6,2.5][e.t]);burst(cx,cy,'#ff789b',4);if(b.thorns)hurt(e,b.thorns,0)}}
  for(let i=0;i<nd;i++){let p=dronePos(i,nd);if(Math.hypot(e.x-p[0],e.y-p[1])<e.r+5){e.dc=(e.dc||0)-dt;if(e.dc<=0){e.dc=.5;hurt(e,8+2*b.turret,0)}}}});
 shots.forEach(s=>{if(s.eb&&Date.now()<freezeUntil)return;s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(s.eb){if(Math.hypot(s.x-cx,s.y-cy)<20){hitCore(s.d+w*.5);s.life=0}return}
  for(let e of enemies){if(!e.dead&&!(s.hit&&s.hit.includes(e))&&Math.hypot(s.x-e.x,s.y-e.y)<e.r+5){hurt(e,s.d,s.crit);if(s.pr>0){s.pr--;(s.hit=s.hit||[]).push(e)}else s.life=0;break}}});
 shots=shots.filter(s=>s.life>0&&s.x>-20&&s.x<W+20&&s.y>-20&&s.y<H+20);enemies=enemies.filter(e=>!e.dead);
 beamFx.forEach(p=>p.life-=dt);beamFx=beamFx.filter(p=>p.life>0);parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt});parts=parts.filter(p=>p.life>0);texts.forEach(t=>{t.y-=28*dt;t.life-=dt});texts=texts.filter(t=>t.life>0);
 if(S.wk>=need()&&!enemies.some(e=>e.boss)){S.wave++;S.wk=0;S.best=Math.max(S.best,S.wave);questTrack('wave',S.wave);questTrack('best',S.best);S.wb[S.world]=Math.max(S.wb[S.world]||0,S.wave);S.parts++;S.sh=maxSh();S.hp=Math.min(maxHp(),S.hp+10+5*L('repair'));toast('ВОЛНА '+String(S.wave).padStart(2,'0'));save()}
 if(S.hp<=0){S.hp=0;over=true;save();show('ЯДРО РАЗРУШЕНО','Волна '+S.wave+'. Можно восстановить ядро за '+reviveCost()+'✦ или начать заново (кредиты делятся пополам).','НАЧАТЬ ЗАНОВО',true)}}
const reviveCost=()=>200+S.wave*20;
function draw(){ctx.clearRect(0,0,W,H);ctx.save();if(shake)ctx.translate(rand(-shake,shake)/2,rand(-shake,shake)/2);
 ctx.fillStyle='#a9b8dc';for(let i=0;i<45;i++)ctx.fillRect((i*97+31)%W,(i*151+Math.floor(frame*5))%H,2,2);
 let wd=cw(),cx=W/2,cy=H/2,R=Math.min(W,H)*.43,g=ctx.createLinearGradient(cx-R,cy-R,cx+R,cy+R);g.addColorStop(0,wd.rc[0]);g.addColorStop(.45,wd.rc[1]);g.addColorStop(1,wd.rc[2]);
 ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.strokeStyle=g;ctx.lineWidth=15;ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,R-12,0,6.283);ctx.fillStyle='#1c2028';ctx.fill();ctx.strokeStyle='#7185b2';ctx.lineWidth=3;ctx.stroke();
 ctx.beginPath();ctx.arc(cx,cy,52,0,6.283);ctx.strokeStyle='rgba(125,151,205,.15)';ctx.lineWidth=2;ctx.setLineDash([3,8]);ctx.stroke();ctx.setLineDash([]);
 enemies.forEach(e=>{let s=e.r,flash=e.fl>0,sets=[['#54d6b0','#247b78','#163b50'],['#e7b45e','#9b553f','#472e4d'],['#b78cff','#6546a5','#30234f'],['#ff718e','#a82e59','#4b204b']],c=sets[e.t]||sets[0],u=Math.max(1,Math.round(s/8));ctx.save();ctx.translate(Math.round(e.x),Math.round(e.y));ctx.imageSmoothingEnabled=false;ctx.shadowColor=e.boss?'#ff668c':c[0];ctx.shadowBlur=e.boss?16:5;
 let px=(x,y,w,h,col)=>{ctx.fillStyle=flash?'#fff':col;ctx.fillRect(x*u,y*u,w*u,h*u)};
 if(e.t===0){px(-5,-3,10,7,c[1]);px(-4,-5,8,3,c[0]);px(-3,2,2,2,c[2]);px(1,2,2,2,c[2]);px(-3,-7,2,2,'#eaffff');px(2,-7,2,2,'#eaffff')}
 else if(e.t===1){px(-5,-5,10,10,c[2]);px(-4,-7,8,4,c[0]);px(-3,-2,2,2,'#fff0b0');px(2,-2,2,2,'#fff0b0');px(-7,-1,2,5,c[1]);px(5,-1,2,5,c[1])}
 else if(e.t===2){px(-6,-4,12,8,c[2]);px(-4,-7,8,4,c[0]);px(-3,-2,2,2,'#f4eaff');px(2,-2,2,2,'#f4eaff');px(-8,-7,3,5,c[1]);px(5,-7,3,5,c[1])}
 else{px(-7,-6,14,13,c[2]);px(-5,-9,10,4,c[0]);px(-9,-4,3,8,c[1]);px(6,-4,3,8,c[1]);px(-4,-3,2,2,'#fff4c8');px(3,-3,2,2,'#fff4c8');px(-3,7,3,3,c[0]);px(2,7,3,3,c[0])}
 ctx.shadowBlur=0;if(e.boss){px(-2,-12,4,4,'#ffe38a');px(-1,-15,2,3,'#ff718e')}
 ctx.restore();if(e.hp<e.max){ctx.fillStyle='#10131c';ctx.fillRect(e.x-s,e.y-s-8,s*2,3);ctx.fillStyle=e.boss?'#ff718e':'#78e6c2';ctx.fillRect(e.x-s,e.y-s-8,s*2*Math.max(0,e.hp/e.max),3)}});
 shots.forEach(s=>{if(s.eb){ctx.fillStyle='#ff4d6d';ctx.fillRect(s.x-4,s.y-4,8,8)}else{ctx.fillStyle=s.helper?['#8fe0a8','#ffbd75','#d6a0ff'][s.helper-1]:(s.crit?'#ffd36b':'#fff2bd');ctx.fillRect(s.x-3,s.y-3,6,6)}});
 for(let i=0;i<B().drones;i++){let p=dronePos(i,B().drones);ctx.fillStyle='#8fd0ff';ctx.fillRect(p[0]-4,p[1]-4,8,8);ctx.fillStyle='#fff';ctx.fillRect(p[0]-1,p[1]-1,2,2)}
 parts.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3)});ctx.globalAlpha=1;
 if(S.sh>0){ctx.beginPath();ctx.arc(cx,cy,22,0,6.283);ctx.strokeStyle='rgba(143,208,255,'+(.25+.5*S.sh/Math.max(1,maxSh()))+')';ctx.lineWidth=3;ctx.stroke()}
 beamFx.forEach(bf=>{ctx.globalAlpha=Math.max(0,bf.life/.18);ctx.strokeStyle=bf.color;ctx.lineWidth=4;ctx.shadowColor=bf.color;ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(bf.x,bf.y);ctx.lineTo(bf.tx,bf.ty);ctx.stroke();ctx.shadowBlur=0});ctx.globalAlpha=1;
 // Пилот — мини-пиксельный инопланетянин; косметика меняет вид.
 ctx.save();ctx.translate(cx,cy+Math.sin(frame*1.8)*1.5);let k=1+pulse*.1;ctx.scale(k,k);
 const skin=(S.cosmetic&&S.cosmetic.skin)||'alien',skinColors={alien:['#ef78dc','#8c42bd','#ffe6ff'],ember:['#ff9a45','#a73535','#fff0a0'],ice:['#8cecff','#327bb4','#ffffff'],royal:['#ffd36b','#8a56c9','#fff4c0'],void:['#a99aff','#44336e','#f7dfff'],nechaev:['#e04545','#6a1018','#ffd0d0'],halloween:['#ff8a20','#4a2208','#ffe6a0'],cat:['#c9a0ff','#5a3a8a','#ffffff'],cyber:['#00e8ff','#0a4060','#e0ffff'],nebula:['#b06bff','#401868','#f0e0ff']},sc=skinColors[skin]||skinColors.alien;
 if(skin==='nechaev'){
  ctx.fillStyle='#1a0a0a';ctx.fillRect(-12,-14,24,24);
  ctx.fillStyle=sc[0];ctx.fillRect(-10,-16,20,18);ctx.fillRect(-14,-8,4,12);ctx.fillRect(10,-8,4,12);
  ctx.fillStyle=sc[1];ctx.fillRect(-8,2,16,10);
  ctx.fillStyle='#222';ctx.fillRect(-7,-10,14,6);
  ctx.fillStyle='#8cf';ctx.fillRect(-5,-9,4,3);ctx.fillRect(2,-9,4,3);
  ctx.fillStyle=sc[2];ctx.fillRect(-3,-1,6,2);
  ctx.fillStyle=sc[0];ctx.fillRect(-8,12,6,5);ctx.fillRect(2,12,6,5);
 }else if(skin==='halloween'){
  ctx.fillStyle='#1a1008';ctx.fillRect(-11,-12,22,20);
  ctx.fillStyle=sc[0];ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(12,-4);ctx.lineTo(8,10);ctx.lineTo(-8,10);ctx.lineTo(-12,-4);ctx.closePath();ctx.fill();
  ctx.fillStyle=sc[1];ctx.fillRect(-6,-6,4,5);ctx.fillRect(2,-6,4,5);
  ctx.fillStyle='#211';ctx.fillRect(-5,-5,2,3);ctx.fillRect(3,-5,2,3);
  ctx.fillStyle=sc[2];ctx.fillRect(-4,2,8,3);
  ctx.fillStyle='#3a0';ctx.fillRect(-2,-20,4,4);
 }else if(skin==='cat'){
  ctx.fillStyle='#1a1528';ctx.fillRect(-11,-12,22,20);
  ctx.fillStyle=sc[0];ctx.fillRect(-9,-14,18,18);
  ctx.fillStyle=sc[0];ctx.beginPath();ctx.moveTo(-9,-14);ctx.lineTo(-14,-22);ctx.lineTo(-4,-14);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(9,-14);ctx.lineTo(14,-22);ctx.lineTo(4,-14);ctx.closePath();ctx.fill();
  ctx.fillStyle=sc[1];ctx.fillRect(-8,3,16,8);
  ctx.fillStyle='#fff';ctx.fillRect(-6,-8,4,5);ctx.fillRect(3,-8,4,5);
  ctx.fillStyle='#211';ctx.fillRect(-5,-7,2,3);ctx.fillRect(4,-7,2,3);
  ctx.fillStyle=sc[2];ctx.fillRect(-2,-2,4,2);
  ctx.fillStyle=sc[0];ctx.fillRect(8,4,10,3);
 }else if(skin==='cyber'){
  ctx.fillStyle='#041018';ctx.fillRect(-11,-12,22,20);
  ctx.fillStyle=sc[0];ctx.fillRect(-9,-15,18,18);ctx.fillRect(-13,-10,4,10);ctx.fillRect(9,-10,4,10);
  ctx.fillStyle=sc[1];ctx.fillRect(-8,3,16,8);
  ctx.fillStyle='#0ff';ctx.fillRect(-7,-9,14,4);
  ctx.fillStyle='#031';ctx.fillRect(-6,-8,5,2);ctx.fillRect(1,-8,5,2);
  ctx.fillStyle=sc[2];ctx.fillRect(-4,0,8,2);
  ctx.fillStyle=sc[0];ctx.fillRect(-7,11,5,4);ctx.fillRect(3,11,5,4);
  ctx.strokeStyle='rgba(0,255,255,.5)';ctx.lineWidth=1;ctx.strokeRect(-9,-15,18,18);
 }else if(skin==='nebula'){
  ctx.fillStyle='#120820';ctx.fillRect(-11,-12,22,20);
  ctx.fillStyle=sc[0];ctx.fillRect(-9,-15,18,18);ctx.fillRect(-13,-10,4,10);ctx.fillRect(9,-10,4,10);
  ctx.fillStyle=sc[1];ctx.fillRect(-8,3,16,8);
  ctx.fillStyle='#fff';ctx.fillRect(-6,-8,4,5);ctx.fillRect(3,-8,4,5);
  ctx.fillStyle='#311';ctx.fillRect(-5,-7,2,3);ctx.fillRect(4,-7,2,3);
  ctx.fillStyle=sc[2];ctx.fillRect(-3,0,6,2);
  ctx.globalAlpha=.55;ctx.fillStyle='#f8a';ctx.fillRect(-12,-16,6,6);ctx.fillStyle='#aef';ctx.fillRect(6,-4,5,5);ctx.globalAlpha=1;
  ctx.fillStyle=sc[0];ctx.fillRect(-7,11,5,4);ctx.fillRect(3,11,5,4);
 }else{
  ctx.fillStyle='#291a4a';ctx.fillRect(-11,-12,22,20);ctx.fillStyle=sc[0];ctx.fillRect(-9,-15,18,18);ctx.fillRect(-13,-10,4,10);ctx.fillRect(9,-10,4,10);
  ctx.fillStyle=sc[1];ctx.fillRect(-8,3,16,8);ctx.fillStyle='#fff';ctx.fillRect(-6,-8,4,5);ctx.fillRect(3,-8,4,5);ctx.fillStyle='#21152f';ctx.fillRect(-5,-7,2,3);ctx.fillRect(4,-7,2,3);ctx.fillStyle=sc[2];ctx.fillRect(-3,0,6,2);ctx.fillStyle=sc[0];ctx.fillRect(-7,11,5,4);ctx.fillRect(3,11,5,4);
 }
 ctx.restore();
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
$('power').onclick=()=>{if(over||paused||modal)return;let now=Date.now(),cool=12000,cost=40+Math.floor(S.wave*2);if(now-(S.impulseAt||0)<cool){toast('ИМПУЛЬС ПЕРЕЗАРЯЖАЕТСЯ · '+Math.ceil((cool-(now-(S.impulseAt||0)))/1000)+'с');return}if(S.coins<cost){toast('НУЖНО '+cost+' КРЕДИТОВ');return}if(!enemies.length){toast('НЕТ ЦЕЛЕЙ ДЛЯ ИМПУЛЬСА');return}S.coins-=cost;S.impulseAt=now;let target=enemies.slice().sort((a,b)=>a.hp-b.hp).slice(0,Math.max(1,4+L('pulseCore')));target.forEach(e=>hurt(e,35+clickDmg()*1.25+B().pulse,0));shake=8;vib(40);beep(200,.2);toast('ИМПУЛЬС · '+target.length+' ЦЕЛЕЙ · '+cost+'✦');save()};
function useAbility(kind){if(over||paused||modal)return;let now=Date.now(),cfg={heavy:[9000,'СИЛЬНЫЙ УДАР'],freeze:[18000,'ЗАМОРОЗКА'],chain:[14000,'ЦЕПНАЯ МОЛНИЯ']}[kind],left=abilityTimers[kind]-now;if(left>0){toast(cfg[1]+' · '+Math.ceil(left/1000)+'с');return}let alive=enemies.filter(e=>!e.dead);if(!alive.length){toast('НЕТ ЦЕЛЕЙ');return}
 if(kind==='heavy'){let e=alive.sort((a,b)=>Math.hypot(a.x-W/2,a.y-H/2)-Math.hypot(b.x-W/2,b.y-H/2))[0];hurt(e,clickDmg()*5+75,1);burst(e.x,e.y,'#ffd36b',24);shake=12;abilityTimers.heavy=now+9000;toast('✹ СОКРУШАЮЩИЙ УДАР')}
 if(kind==='freeze'){freezeUntil=now+4500;abilityTimers.freeze=now+18000;alive.forEach(e=>{burst(e.x,e.y,'#8cecff',5)});toast('❄ ВРЕМЯ ОСТАНОВЛЕНО')}
 if(kind==='chain'){let targets=alive.sort((a,b)=>Math.hypot(a.x-W/2,a.y-H/2)-Math.hypot(b.x-W/2,b.y-H/2)).slice(0,Math.min(6,alive.length));targets.forEach((e,i)=>{hurt(e,clickDmg()*2+45,0);if(i)beamFx.push({x:targets[i-1].x,y:targets[i-1].y,tx:e.x,ty:e.y,life:.25,color:'#8cecff'});burst(e.x,e.y,'#8cecff',7)});abilityTimers.chain=now+14000;toast('ϟ ЦЕПНАЯ МОЛНИЯ · '+targets.length)}
 save();ui()}
$('heavyStrike')?.addEventListener('click',()=>useAbility('heavy'));$('timeFreeze')?.addEventListener('click',()=>useAbility('freeze'));$('chainLightning')?.addEventListener('click',()=>useAbility('chain'));
function renderTree(){$('sp').textContent=S.sp;let gr=$('treeGrid');gr.innerHTML='';BR.forEach((bn,bi)=>{let col=document.createElement('div');col.className='skill-branch';col.innerHTML='<h3>'+bn+'</h3><div class="skill-chain"></div>';let chain=col.querySelector('.skill-chain');TREE.filter(n=>n.b==bi).forEach(n=>{let lv=L(n.id),req=n.req&&L(n.req[0])<n.req[1],cost=lv+1,mx=lv>=n.max,can=!req&&!mx&&S.sp>=cost,b=document.createElement('button');b.className='node skill-node'+(req?' lock':'')+(mx?' max':'')+(can?' can':'');b.innerHTML='<span class="skill-glyph">'+(['✦','⬡','⌘','◈','✧'][bi])+'</span><b>'+n.n+'</b><small>'+n.d+'</small><em>'+(mx?'МАКСИМУМ':req?'🔒 Требуется '+TREE.find(x=>x.id==n.req[0]).n+' · '+n.req[1]+' ур.':'УРОВЕНЬ '+lv+'/'+n.max+' · ЦЕНА '+cost+'◆')+'</em>';b.onclick=()=>{if(req||mx||S.sp<cost)return;S.sp-=cost;S.sk[n.id]=lv+1;Bt=0;if(n.id=='hp')S.hp+=25;save();renderTree();beep(760,.06)};chain.appendChild(b)});gr.appendChild(col)})}
$('tree').onclick=()=>{if(over||paused||modal)return;paused=true;renderTree();$('treeBox').classList.add('show')};
$('closeTree').onclick=()=>{$('treeBox').classList.remove('show');paused=false;last=performance.now()};
let tapStamp=0,tapWindow=0,tapCount=0;
cv.addEventListener('pointerdown',e=>{if(paused||modal||over)return;let now=performance.now();if(now-tapStamp<125)return;if(now-tapWindow>=1000){tapWindow=now;tapCount=0}if(tapCount>=7)return;tapStamp=now;tapCount++;let r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,cx=W/2,cy=H/2,b=B();S.st.taps++;
 let bs=shots.find(s=>s.eb&&Math.hypot(s.x-x,s.y-y)<28);if(bs){bs.life=0;S.coins+=2;txt(x,y,'СБИТ','#9ff');beep(1000,.03);return}
 if(Math.hypot(x-cx,y-cy)<34){toast('ЯДРО НЕ ДАЁТ КРЕДИТЫ ЗА НАЖАТИЯ');return}
 let t=null,bd=1e9;enemies.forEach(en=>{let d=Math.hypot(en.x-x,en.y-y)-en.r;if(d<34&&d<bd){bd=d;t=en}});let crit=Math.random()<critCh(),d=clickDmg()*(crit?2.5:1);if(crit)S.st.crit++;
 if(t){hurt(t,d,crit)}else{let a=Math.atan2(y-cy,x-cx);shots.push({x:cx,y:cy,vx:Math.cos(a)*420,vy:Math.sin(a)*420,life:1.5,d,crit,pr:0})}
 if(crit)vib(15);beep(crit?880:660,.03)});
/* ---------- API для станции, карты и профиля ---------- */
PO.S=()=>S;PO.B=B;PO.dirty=()=>{Bt=0};PO.toast=toast;PO.save=save;PO.beep=beep;PO.vib=vib;PO.WORLDS=WORLDS;
PO.modal=v=>{modal=v;if(!v)last=performance.now()};
PO.setWorld=i=>{if(!WORLDS[i]||S.level<(WORLDS[i].reqLevel||1)|| (i>0&&(S.wb[i-1]||0)<WORLDS[i].req)){toast('СЕКТОР ЗАКРЫТ · НУЖЕН УР. '+(WORLDS[i]?.reqLevel||1));return false}S.wp[S.world]={wave:S.wave,wk:S.wk};S.world=i;worldEventT=0;let p=S.wp[i]||{wave:1,wk:0};S.wave=p.wave;S.wk=p.wk;S.wb[i]=Math.max(S.wb[i]||0,S.wave);resetField();over=false;$('paused').classList.remove('show');paused=false;applyWorld();save();return true};
PO.paused=()=>paused||over;PO.eventBoss=()=>{if(paused||over||modal)return false;enemies=[];spawn(true,W/2+Math.min(W,H)*.32,H/2);let e=enemies[enemies.length-1];e.hp*=3.5;e.max=e.hp;e.r=25;e.t=3;toast('ИВЕНТОВЫЙ БОСС: АРХОНТ');save();return true};
function onHide(){hidAt=Date.now();save();if(!over&&!paused&&!modal)show('ПАУЗА','Игра сохранена')}
function onShow(){resize();last=performance.now();if(hidAt){away((Date.now()-hidAt)/1000);hidAt=0}}
document.addEventListener('visibilitychange',()=>document.hidden?onHide():onShow());addEventListener('pagehide',save);addEventListener('pageshow',onShow);addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,200));
function loop(t){let dt=Math.min(.05,Math.max(0,(t-last)/1000));last=t;if(!paused&&!modal&&!over&&W>0)update(dt);if(W>0&&!modal)draw();uiT-=dt;if(uiT<=0){uiT=.1;ui()}requestAnimationFrame(loop)}
load();ensureQuests();away((Date.now()-S.t)/1000);if(!WORLDS[S.world])S.world=0;S.hp=Math.min(S.hp||maxHp(),maxHp());if(S.hp<=0)S.hp=maxHp();applyWorld();
new ResizeObserver(resize).observe(cv.parentElement);resize();setInterval(save,4000);requestAnimationFrame(loop);
})();
