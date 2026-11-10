/* Pixel Orbit v4.5 — shared co-op boss arena presentation */
(()=>{'use strict';
 const $=id=>document.getElementById(id),cv=$('raidArena');if(!cv)return;const g=cv.getContext('2d');let w=0,h=0,dpr=1,t=0,last=0,shots=[],sparks=[],joined=false;
 function resize(){const r=cv.getBoundingClientRect();if(r.width<10||r.height<10)return;dpr=Math.min(devicePixelRatio||1,2);w=r.width;h=r.height;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);g.setTransform(dpr,0,0,dpr,0,0)}
 function burst(x,y,n=14){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=30+Math.random()*170;sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.4+Math.random()*.8,max:.8})}}
 function draw(now){requestAnimationFrame(draw);let dt=Math.min(.05,(now-last)/1000||0);last=now;t+=dt;if(!w)resize();g.clearRect(0,0,w,h);const bg=g.createRadialGradient(w*.5,h*.42,10,w*.5,h*.48,Math.max(w,h)*.8);bg.addColorStop(0,'#293958');bg.addColorStop(1,'#080d19');g.fillStyle=bg;g.fillRect(0,0,w,h);
 for(let i=0;i<90;i++){let x=(i*83.17+t*(i%3+1)*3)%w,y=(i*137.7)%h;g.globalAlpha=.18+(i%5)*.09;g.fillStyle=i%7?'#b9d7ff':'#ffb3dc';g.fillRect(x,y,i%9===0?2:1,i%9===0?2:1)}g.globalAlpha=1;
 const cx=w/2,cy=h*.48,scale=Math.min(w/390,h/560),r=Math.min(w*.29,h*.22);g.save();g.translate(cx,cy);
 for(let k=0;k<3;k++){g.beginPath();g.ellipse(0,0,r*(1.35+k*.28),r*(.28+k*.08),-.35+t*.05,0,Math.PI*2);g.strokeStyle=['#7adfff33','#c88aff30','#ff85bc28'][k];g.lineWidth=2;g.stroke()}
 const glow=g.createRadialGradient(0,0,r*.1,0,0,r*1.4);glow.addColorStop(0,'#ff79ba55');glow.addColorStop(1,'#ff4c8a00');g.fillStyle=glow;g.beginPath();g.arc(0,0,r*1.5,0,Math.PI*2);g.fill();
 const pulse=1+Math.sin(t*2.4)*.025;g.scale(pulse,pulse);
 // Nebulon, a multi-segment leviathan boss silhouette.
 g.fillStyle='#351b3d';g.strokeStyle='#ff9ad3';g.lineWidth=3;g.beginPath();g.moveTo(0,-r*.95);g.bezierCurveTo(r*.55,-r*.9,r*.9,-r*.35,r*.72,r*.25);g.lineTo(r*.95,r*.72);g.lineTo(r*.34,r*.56);g.lineTo(0,r*.98);g.lineTo(-r*.34,r*.56);g.lineTo(-r*.95,r*.72);g.lineTo(-r*.72,r*.25);g.bezierCurveTo(-r*.9,-r*.35,-r*.55,-r*.9,0,-r*.95);g.fill();g.stroke();
 g.fillStyle='#9c4f9d';g.beginPath();g.ellipse(0,-r*.05,r*.48,r*.58,0,0,Math.PI*2);g.fill();g.fillStyle='#fff0ff';g.beginPath();g.ellipse(0,-r*.18,r*.17,r*.24,0,0,Math.PI*2);g.fill();g.fillStyle='#62e5ff';g.beginPath();g.arc(0,-r*.18,r*.085,0,Math.PI*2);g.fill();
 for(let side of [-1,1]){g.strokeStyle='#ffb1df';g.lineWidth=4;g.beginPath();g.moveTo(side*r*.55,-r*.38);g.quadraticCurveTo(side*r*1.05,-r*.9,side*r*.92,-r*1.2);g.stroke();g.fillStyle='#ffb1df';g.beginPath();g.arc(side*r*.92,-r*1.2,4,0,Math.PI*2);g.fill()}
 g.restore();
 // pilot ships circle the boss
 const pilots=Math.max(1,window.POOnline?.getPresence?.()||0);for(let i=0;i<Math.min(pilots,8);i++){let a=t*.35+i*Math.PI*2/Math.min(pilots,8),x=cx+Math.cos(a)*r*1.75,y=cy+Math.sin(a)*r*.85;g.save();g.translate(x,y);g.rotate(a+Math.PI/2);g.fillStyle=i%2?'#8fe0a8':'#8fd0ff';g.beginPath();g.moveTo(0,-8);g.lineTo(6,7);g.lineTo(0,4);g.lineTo(-6,7);g.closePath();g.fill();g.restore()}
 // particles
 for(let i=sparks.length-1;i>=0;i--){let p=sparks[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy*=.97;if(p.life<=0){sparks.splice(i,1);continue}g.globalAlpha=Math.max(0,p.life/p.max);g.fillStyle='#ffe38a';g.fillRect(p.x,p.y,3,3)}g.globalAlpha=1;
 const state=window.POOnline?.getRaidState?.();if(state){const hp=Math.max(0,Number(state.hp)||0),max=Number(state.max_hp)||250000;$('arenaRaidPhase').textContent=`ФАЗА ${state.phase||1} · ${state.boss_name||'НЕБУЛОН'}`;$('arenaRaidHp').textContent=hp.toLocaleString('ru-RU')+' / '+max.toLocaleString('ru-RU');$('arenaRaidHpBar').style.width=(hp/max*100)+'%';$('arenaRaidPlayers').textContent=(window.POOnline?.getPresence?.()||0)+' ПИЛОТОВ';$('arenaRaidDamage').textContent=(window.POOnline?.getOwnDamage?.()||0).toLocaleString('ru-RU');$('arenaRaidStatus').textContent=state.defeated_at?'БОСС ПОВЕРЖЕН · ФАЗА ЗАВЕРШЕНА':window.POOnline?.isJoined?.()?'АРЕНА СИНХРОНИЗИРОВАНА · АТАКУЙ!':'ОЖИДАНИЕ ПОДКЛЮЧЕНИЯ';$('arenaRaidTeam').textContent=(window.POOnline?.getPresence?.()||0)>0?'Пилоты в строю':'Нужны союзники';$('arenaRaidAttack').disabled=!window.POOnline?.isJoined?.()||hp<=0}
 }
 $('arenaRaidJoin').addEventListener('click',()=>{window.POOnline?.joinRaid?.();$('arenaRaidStatus').textContent='ПОДКЛЮЧАЕМСЯ К ОБЩЕЙ АРЕНЕ…'});
 const attack=()=>{if(!window.POOnline?.isJoined?.())return;let x=w/2+(Math.random()-.5)*w*.2,y=h*.48;burst(x,y,20);shots.push({x,y,life:.35});window.POOnline.attackRaid?.()};$('arenaRaidAttack').addEventListener('click',attack);cv.addEventListener('pointerdown',()=>attack());
 const old=window.POOnline;window.PORaidArena={resize};window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(!document.hidden)resize()});resize();requestAnimationFrame(draw);
})();
