(()=> {
"use strict";
const $=id=>document.getElementById(id), STORE="pixelorbit_infinite_meta_v1";
const branches=[
 {id:"assault",name:"АТАКА",icon:"⚔",desc:"Урон, критические попадания и оружейные системы"},
 {id:"guardian",name:"ЗАЩИТА",icon:"🛡",desc:"Броня, щиты, ремонт и выживаемость"},
 {id:"industry",name:"ЭКОНОМИКА",icon:"✦",desc:"Добыча, кредиты и производство"},
 {id:"command",name:"КОМАНДОВАНИЕ",icon:"◈",desc:"Дроны, флот и тактические бонусы"},
 {id:"singularity",name:"СИНГУЛЯРНОСТЬ",icon:"✧",desc:"Энергия ядра, аномалии и престиж"}
];
const skillNames=[
 ["Импульсный выстрел","Пробой брони","Критический контур","Перегрев ствола","Фазовый боеприпас"],
 ["Усиленный корпус","Регенерация","Полярный щит","Аварийный ремонт","Непробиваемое ядро"],
 ["Автосборщик","Контракт добычи","Кристальная жила","Энергосбережение","Проценты офлайн"],
 ["Рой разведчиков","Тактическая сеть","Боевой протокол","Синхронизация флота","Командный ИИ"],
 ["Стабилизация ядра","Резонанс","Гравитационная линза","Петля времени","Предел сингулярности"]
];
const skills=branches.flatMap((b,bi)=>skillNames[bi].map((name,i)=>({id:b.id+i,name,branch:bi,desc:["Усиливает боевые характеристики ядра","Открывает новый уровень специализации"][i%2],cost:1+i,level:0,max:5,icon:["✦","⬡","⌁","◈","✧"][bi]})));
const techNames=["Плазменная баллистика","Квантовая навигация","Наноремонт","Гравитационный двигатель","Кристаллический синтез","Автономный ИИ","Орбитальная логистика","Фазовый щит","Тёмная материя","Сверхпроводники"];
const technologies=Array.from({length:50},(_,i)=>({id:"t"+i,name:techNames[i%techNames.length]+(i>=10?" "+(Math.floor(i/10)+1):""),tier:Math.floor(i/10)+1,cost:35+Math.floor(i/10)*55+(i%10)*12,desc:["Ускоряет производство ресурсов","Усиливает боевые модули","Открывает новые схемы флота","Повышает эффективность ядра"][i%4],icon:["⚡","⌘","◈","🛡","✧"][i%5]}));
const unitRoles=["Разведчик","Шахтёр","Экстрактор","Ремонтник","Турель","Перехватчик","Тяжёлый дрон","Инженер","Командный ИИ","Дрон-щит"];
const units=Array.from({length:30},(_,i)=>({id:"u"+i,name:unitRoles[i%10]+(i>=10?" Mk."+ (Math.floor(i/10)+1):""),role:unitRoles[i%10],cost:50+(i*37),power:8+i*4,icon:["🛸","⛏","🔶","✚","♜","🚀","🤖","⚙","◈","🛡"][i%10],desc:["Сканирует угрозы и отмечает цели","Добывает ресурсы во время боя","Поддерживает ядро и флот"][i%3]}));
const bossNames=["Пожиратель орбит","Красный колосс","Матриарх бездны","Разрушитель секторов","Архонт пустоты","Собиратель звёзд","Крио-титан","Нулевая форма","Король разлома","Сингулярный страж","Левиафан","Палач колонии","Звёздный призрак","Механический прародитель","Чёрный маяк","Гравитационный зверь","Омега-рой","Падший навигатор","Сердце туманности","Абсолютный наблюдатель"];
const bosses=bossNames.map((name,i)=>({name,hp:1200+i*950,reward:100+i*35,icon:["🕷","👁","☠","👾","🛸"][i%5],sector:Math.floor(i/2)+1}));
const regionNames=["Пояс Ориона","Туманность Пепла","Кристальный предел","Забытая колония","Красный разлом","Ледяной фронтир","Некрополь машин","Сектор Антиматерии","Гравитационная бездна","Сердце сингулярности"];
const regions=regionNames.map((name,i)=>({name,level:i*8+1,bonus:10+i*8,desc:["Старые шахтёрские станции и обломки кораблей","Нестабильная туманность скрывает редкие минералы","Кристаллы здесь реагируют на энергию ядра"][i%3],icon:["🌌","☄","💎","🛰","🔴","❄","⚙","🌀","🕳","✧"][i]}));
const upgrades=Array.from({length:100},(_,i)=>({id:"up"+i,name:["Усилитель ядра","Реакторный контур","Дроновый привод","Квантовый накопитель","Орбитальный стабилизатор"][i%5]+" "+(Math.floor(i/5)+1),cost:20+i*18,desc:["+2% к урону ядра","+2% к доходу","+2% к эффективности флота","+2% к щиту"][i%4],icon:["✧","⚙","◈","⚡","🛡"][i%5]}));
const baseBuildings=[["Реактор","Производит энергию","⚛"],["Ангар","Увеличивает вместимость флота","🛸"],["Лаборатория","Открывает исследования","🔬"],["Фабрика","Создаёт детали","🏭"],["Генератор","Ускоряет добычу энергии","🔋"],["Турельная","Автоматическая защита базы","♜"],["Космопорт","Открывает экспедиции","🚀"],["Щитовая","Укрепляет защиту","🛡"],["Исследовательский центр","Ускоряет технологии","🔭"],["Портал","Связь с дальними регионами","🌀"]];
const fresh=()=>({crystals:30,parts:50,energy:40,skillPoints:5,skills:{},tech:{},units:{},bosses:{},regions:{0:true},upgrades:{},buildings:{},gear:{weapon:0,armor:0,core:0},artifacts:[],prestige:0,prestigeShards:0,story:0,secrets:0,last:Date.now(),totalKills:0,unlockedBoss:0});
let M=fresh();try{M=Object.assign(fresh(),JSON.parse(localStorage.getItem(STORE)||"{}"))}catch(e){}
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(M))}catch(e){}};
const coreCoins=()=>{try{return Math.floor(JSON.parse(localStorage.getItem("pixelorbit_v2")||"{}").coins||0)}catch(e){return 0}};
const coins=()=>coreCoins();
const pay=(amount,currency="coins")=>{if(currency==="coins"){if(coins()<amount)return false;try{let s=JSON.parse(localStorage.getItem("pixelorbit_v2")||"{}");s.coins-=amount;localStorage.setItem("pixelorbit_v2",JSON.stringify(s));return true}catch(e){return false}}if((M[currency]||0)<amount)return false;M[currency]-=amount;save();return true};
const fmt=n=>Math.floor(n).toLocaleString("ru-RU");
const add=(tag,html)=>{let d=document.createElement(tag);d.innerHTML=html;return d};
function resourceUI(){ $("rCoins").textContent=fmt(coins());$("rCrystals").textContent=fmt(M.crystals);$("rParts").textContent=fmt(M.parts);$("rEnergy").textContent=fmt(M.energy); }
function card(icon,title,desc,meta,button,disabled=false,cls=""){return `<article class="featureCard ${cls}"><div class="pixelIcon">${icon}</div><h3>${title}</h3><p>${desc}</p><div class="meta">${meta||""}</div>${button||""}</article>`}
function buyButton(label,fn,disabled=false){let id="act"+Math.random().toString(36).slice(2);setTimeout(()=>{let b=$(id);if(b)b.onclick=fn},0);return `<button class="buyBtn" id="${id}" ${disabled?"disabled":""}>${label}</button>`}
function panel(title,body){return `<div class="wideCard"><h3>${title}</h3>${body}</div>`}
let page="base",tab="all";
function open(p){page=p;$("commandLayer").classList.add("open");$("commandLayer").setAttribute("aria-hidden","false");document.querySelectorAll(".commandNav button").forEach(b=>b.classList.toggle("active",b.dataset.page===p));render()}
function close(){$("commandLayer").classList.remove("open");$("commandLayer").setAttribute("aria-hidden","true")}
function render(){
 resourceUI();let title={base:"БАЗА И ПРОИЗВОДСТВО",skills:"ДРЕВО НАВЫКОВ",fleet:"ДРОНЫ И БОЕВЫЕ ЮНИТЫ",tech:"ТЕХНОЛОГИИ",map:"ГАЛАКТИЧЕСКАЯ КАРТА",more:"АРСЕНАЛ И ПРОГРЕСС"}[page];$("pageTitle").textContent=title;
 let html="";
 if(page==="base"){
 html=`<p class="sectionIntro">Твоя база — центр развития экспедиции. Строй модули, собирай ресурсы и открывай новые производственные цепочки.</p><div class="featureGrid">${baseBuildings.map((b,i)=>{let lv=M.buildings[i]||0,cost=80+lv*90;return card(b[2],b[0],b[1],`УРОВЕНЬ ${lv} · СТОИМОСТЬ ${cost}✦`,buyButton("УЛУЧШИТЬ · "+cost+"✦",()=>{if(pay(cost)){M.buildings[i]=lv+1;M.parts+=8;M.energy+=5;save();render()}else alert("Недостаточно кредитов")},coins()<cost))}).join("")}</div>${panel("ПРОИЗВОДСТВО",`<p>Фабрики и реакторы дают дополнительные ресурсы. За каждый уровень базы ты получаешь детали и энергию при улучшении модулей.</p><span class="tag">10 типов построек</span><span class="tag">Постоянное сохранение</span>`)}`;
 }
 if(page==="skills"){
 html=`<p class="sectionIntro">Пять специализаций, 25 основных узлов. Очки навыков можно получить за уровни и победы над боссами. Улучшения сохраняются между сессиями.</p><div class="subTabs">${branches.map((b,i)=>`<button class="tabBtn ${tab==b.id?"selected":""}" data-branch="${b.id}">${b.icon} ${b.name}</button>`).join("")}</div>`;
 let bi=branches.findIndex(b=>b.id===tab);if(bi<0)bi=0;let b=branches[bi],nodes=skills.filter(s=>s.branch===bi);
 html+=panel(`${b.icon} ${b.name} · ОЧКИ: ${M.skillPoints}`,`<p>${b.desc}</p><div class="featureGrid">${nodes.map(n=>{let lv=M.skills[n.id]||0,cost=n.cost+lv;return card(n.icon,n.name,n.desc,`УР. ${lv}/${n.max} · ${cost}◆`,buyButton(lv>=n.max?"МАКСИМУМ":"ИЗУЧИТЬ · "+cost+"◆",()=>{if(M.skillPoints>=cost&&lv<n.max){M.skillPoints-=cost;M.skills[n.id]=lv+1;save();render()}},M.skillPoints<cost||lv>=n.max))}).join("")}</div>`);
 }
 if(page==="fleet"){
 html=`<p class="sectionIntro">Собери флот под свой стиль игры. Купленные юниты добавляются в ангар; характеристики и роли различаются.</p><div class="featureGrid">${units.map((u,i)=>{let owned=M.units[u.id]||0;return card(u.icon,u.name,u.desc,`МОЩЬ ${u.power} · В АНГАРЕ ${owned} · ${u.cost}✦`,buyButton("ПОСТРОИТЬ · "+u.cost+"✦",()=>{if(pay(u.cost)){M.units[u.id]=owned+1;M.parts+=3;save();render()}else alert("Недостаточно кредитов")},coins()<u.cost))}).join("")}</div>${panel("АНГАР",`<p>Доступно <b>${Object.values(M.units).reduce((a,b)=>a+b,0)}</b> юнитов. Всего в каталоге: 30 типов. Следующий этап развития флота — назначение формаций и автоматических приказов.</p>`)}`;
 }
 if(page==="tech"){
 html=`<p class="sectionIntro">50 исследовательских проектов в пяти технологических эпохах. Исследования требуют кредитов и открывают постоянные бонусы.</p><div class="subTabs">${[1,2,3,4,5].map(n=>`<button class="tabBtn ${tab==n?"selected":""}" data-tier="${n}">ЭПОХА ${n}</button>`).join("")}</div><div class="featureGrid">${technologies.filter(t=>t.tier===(Number(tab)||1)).map(t=>{let done=!!M.tech[t.id];return card(t.icon,t.name,t.desc,`ЭПОХА ${t.tier} · ${done?"ИЗУЧЕНО":t.cost+"✦"}`,buyButton(done?"ИЗУЧЕНО":"ИССЛЕДОВАТЬ · "+t.cost+"✦",()=>{if(pay(t.cost)){M.tech[t.id]=true;M.energy+=2;save();render()}else alert("Недостаточно кредитов")},done||coins()<t.cost))}).join("")}</div>`;
 }
 if(page==="map"){
 html=`<p class="sectionIntro">Десять регионов галактики. Новые сектора открываются по мере роста волны и исследования карты.</p><div class="featureGrid">${regions.map((r,i)=>{let open=!!M.regions[i],cost=100+i*120;return card(r.icon,r.name,r.desc,`РЕКОМЕНД. УР. ${r.level} · БОНУС +${r.bonus}%`,buyButton(open?"СЕКТОР ОТКРЫТ":`ОТКРЫТЬ · ${cost}✦`,()=>{if(pay(cost)){M.regions[i]=true;M.story=Math.max(M.story,i);save();render()}else alert("Недостаточно кредитов")},open||coins()<cost),false,open?"":"")}).join("")}</div>${panel("СЮЖЕТ: СИГНАЛ ИЗ ПУСТОТЫ",`<p class="storyText">Экспедиционный корабль «Атлас» обнаружил сигнал, исходящий из центра древней сингулярности. Каждая новая область раскрывает фрагмент истории исчезнувшей цивилизации.</p><p>Открыто фрагментов: ${M.story+1}/10</p>${buyButton("РАСШИФРОВАТЬ СИГНАЛ · 25 ◆",()=>{if(M.crystals>=25&&M.story<9){M.crystals-=25;M.story++;if(M.story%3===0)M.secrets++;save();render()}else alert("Нужно 25 кристаллов и новый фрагмент")},M.crystals<25||M.story>=9)}`)}`;
 }
 if(page==="more"){
 html=`<div class="subTabs"><button class="tabBtn ${tab==="gear"?"selected":""}" data-more="gear">ЭКИПИРОВКА</button><button class="tabBtn ${tab==="boss"?"selected":""}" data-more="boss">БОССЫ</button><button class="tabBtn ${tab==="up"?"selected":""}" data-more="up">УЛУЧШЕНИЯ</button><button class="tabBtn ${tab==="prestige"?"selected":""}" data-more="prestige">ПРЕСТИЖ</button><button class="tabBtn ${tab==="story"?"selected":""}" data-more="story">СЮЖЕТ</button></div>`;
 if(!["gear","boss","up","prestige","story"].includes(tab))tab="gear";
 if(tab==="gear"){
 let slots=[["weapon","ОРУЖИЕ","Увеличивает силу атаки"],["armor","БРОНЯ","Увеличивает запас прочности"],["core","ЯДРО","Усиливает добычу и энергию"]];
 html+=`<p class="sectionIntro">Три слота экипировки и коллекция артефактов. Каждый уровень снаряжения повышает характеристики.</p><div class="featureGrid">${slots.map(([id,n,d])=>{let lv=M.gear[id],cost=90+lv*120;return card("💠",n,d,`УР. ${lv} · ${cost}✦`,buyButton("УСИЛИТЬ · "+cost+"✦",()=>{if(pay(cost)){M.gear[id]++;save();render()}else alert("Недостаточно кредитов")},coins()<cost))}).join("")}</div>${panel("АРТЕФАКТЫ",`<p>Собрано артефактов: ${M.artifacts.length}. Найденные артефакты дают постоянные бонусы.</p>${buyButton("ИССЛЕДОВАТЬ РЕЛИКВИЮ · 20 ◆",()=>{if(M.crystals>=20){M.crystals-=20;M.artifacts.push("Реликвия "+(M.artifacts.length+1));save();render()}else alert("Нужно 20 кристаллов")},M.crystals<20)}`)}`;
 } else if(tab==="boss"){
 html+=`<p class="sectionIntro">20 уникальных противников. Боссы открываются последовательно; победа в бою пока фиксируется через прогресс волны.</p><div class="featureGrid">${bosses.map((b,i)=>{let done=!!M.bosses[i],unlocked=i<=M.unlockedBoss;let bossAction=unlocked?('<button class="buyBtn" '+(done?'disabled':'')+' data-boss="'+i+'">'+(done?'ПОБЕЖДЁН':'ВЫЗВАТЬ БОССА')+'</button>'):"<span class='lockedText'>Сначала одолей предыдущего</span>";return card(b.icon,b.name,"Здоровье: "+fmt(b.hp)+" · Награда: "+b.reward+"✦",unlocked?(done?"ПОБЕЖДЁН":"ДОСТУПЕН"):"ЗАБЛОКИРОВАН",bossAction)}).join("")}</div>`
 } else if(tab==="up"){
 html+=`<p class="sectionIntro">100 модификаций ядра и инфраструктуры. Каждая покупка усиливает один из постоянных параметров.</p><div class="featureGrid">${upgrades.slice(0,100).map(u=>{let done=!!M.upgrades[u.id];return card(u.icon,u.name,u.desc,done?"УСТАНОВЛЕНО":u.cost+"✦",buyButton(done?"УСТАНОВЛЕНО":"УСТАНОВИТЬ · "+u.cost+"✦",()=>{if(pay(u.cost)){M.upgrades[u.id]=true;save();render()}else alert("Недостаточно кредитов")},done||coins()<u.cost))}).join("")}</div>`
 } else if(tab==="prestige"){
 let req= Math.max(10, M.prestige*10+10);
 html+=`<p class="sectionIntro">Сброс обычного прогресса ради осколков сингулярности. Престиж сохраняет открытые системы мета-прогресса и усиливает будущие забеги.</p>${panel("УРОВЕНЬ ПРЕСТИЖА",`<div class="pixelIcon">✧</div><h3>${M.prestige}</h3><p>Следующий уровень требует волну ${req}. Награда: ${M.prestige+1} осколков сингулярности.</p><p>Осколки: ${M.prestigeShards}</p><button class="buyBtn" id="prestigeBtn" ${Number($("wave").textContent)<req?"disabled":""}>ВОЗНЕСТИСЬ</button>`)}<p class="sectionIntro">Престиж — добровольный сброс кредитов и текущей волны. Навыки, коллекции и открытые регионы сохраняются.</p>`;
 } else {
 html+=`<p class="sectionIntro">Журнал экспедиции: раскрывай историю, находи секреты и восстанавливай архив исчезнувших миров.</p>${panel("АРХИВ ЦИВИЛИЗАЦИИ",`<p class="storyText">Данные показывают, что ядро — не источник энергии, а замок. Пять ветвей навыков соответствуют пяти протоколам древних хранителей.</p><p>Сюжетных фрагментов: ${M.story+1}/10 · Секретов: ${M.secrets}</p><button class="buyBtn" id="secretBtn">ПОИСК СЕКРЕТНОГО СИГНАЛА · 30 ◆</button>`)}`;
 }
 html+="<div class='wideCard'><h3>СЕТЕВЫЕ ФУНКЦИИ</h3><p>Онлайн-рейтинги и кооперативный режим запланированы для следующего этапа. Текущая версия полностью работает локально и не требует подключения к сети.</p><span class='tag'>ОФЛАЙН</span><span class='tag'>ЛОКАЛЬНОЕ СОХРАНЕНИЕ</span></div>";
 }
 $("pageContent").innerHTML=html;
 $("pageContent").querySelectorAll("[data-branch]").forEach(b=>b.onclick=()=>{tab=b.dataset.branch;render()});
 $("pageContent").querySelectorAll("[data-tier]").forEach(b=>b.onclick=()=>{tab=b.dataset.tier;render()});
 $("pageContent").querySelectorAll("[data-more]").forEach(b=>b.onclick=()=>{tab=b.dataset.more;render()});
 $("pageContent").querySelectorAll("[data-boss]").forEach(b=>b.onclick=()=>{let i=+b.dataset.boss;if(i===M.unlockedBoss){let boss=bosses[i];if(coins()>=boss.reward){M.bosses[i]=true;M.unlockedBoss=Math.min(19,i+1);M.crystals+=5+i;M.skillPoints+=2;save();render();alert("Победа в тренировочном испытании! Получено "+(5+i)+" кристаллов.")}else alert("Для вызова нужно "+boss.reward+" кредитов")}});
 let pb=$("prestigeBtn");if(pb)pb.onclick=()=>{let req=Math.max(10,M.prestige*10+10);if(Number($("wave").textContent)>=req&&confirm("Подтвердить престиж? Кредиты и текущая волна будут сброшены.")){M.prestige++;M.prestigeShards+=M.prestige;try{let s=JSON.parse(localStorage.getItem("pixelorbit_v2")||"{}");s.coins=0;s.wave=1;s.wk=0;localStorage.setItem("pixelorbit_v2",JSON.stringify(s))}catch(e){}save();render();alert("Престиж повышен!")}};
 let sb=$("secretBtn");if(sb)sb.onclick=()=>{if(M.crystals>=30){M.crystals-=30;M.secrets++;M.story=Math.min(9,M.story+1);save();render()}else alert("Нужно 30 кристаллов")};
}
document.querySelectorAll(".commandNav button").forEach(b=>b.onclick=()=>{tab=b.dataset.page==="skills"?"assault":b.dataset.page==="tech"?1:b.dataset.page==="more"?"gear":"all";open(b.dataset.page)});
$("closeCommand").onclick=close;$("commandLayer").addEventListener("click",e=>{if(e.target===$("commandLayer"))close()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
/* Integrate command screens into existing bottom controls without replacing combat. */
$("tree").addEventListener("contextmenu",e=>{e.preventDefault();open("skills")});
/* Offline resource accrual: bounded to eight hours, separate from the combat save. */
let elapsed=Math.max(0,Math.min(8*3600,(Date.now()-(M.last||Date.now()))/1000));
if(elapsed>30){let bonus=Math.floor(elapsed/60);M.energy+=Math.floor(bonus/5);M.parts+=Math.floor(bonus/10);M.last=Date.now();save();setTimeout(()=>alert("ПОКА ТЕБЯ НЕ БЫЛО: база произвела "+Math.floor(bonus/5)+" энергии и "+Math.floor(bonus/10)+" деталей."),500)}
setInterval(()=>{M.energy+=Math.max(0,(M.buildings[0]||0));M.parts+=Math.max(0,(M.buildings[3]||0));save()},60000);
window.addEventListener("pagehide",()=>{M.last=Date.now();save()});window.addEventListener("beforeunload",()=>{M.last=Date.now();save()});
setInterval(()=>{let s=Number($("wave").textContent)||1;M.totalKills=Math.max(M.totalKills,Number($("kills").textContent)||0);if(s>=Math.floor((M.unlockedBoss+1)*2+1))M.unlockedBoss=Math.min(19,Math.floor(s/2));save()},10000);
resourceUI();
})();
