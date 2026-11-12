/* Pixel Orbit Online v4.4 — Supabase client. Publishable key only; never place service_role here. */
(() => {
  'use strict';
  const URL = 'https://qdoqpuodighoozkjqqde.supabase.co';
  const KEY = 'sb_publishable_RzgTves0OO2qgjhfY2afQw_03kYfK2x';
  const $ = id => document.getElementById(id);
  if (!window.supabase?.createClient) {
    document.addEventListener('DOMContentLoaded', () => { if ($('onlineStatus')) $('onlineStatus').textContent = 'Не удалось загрузить клиент Supabase. Проверьте подключение к интернету.'; });
    return;
  }
  const db = window.supabase.createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  window.PO_SUPABASE_CLIENT = db;
  let session = null, lobby = null, raidChannel = null, presenceCount = 0, scoreTimer = 0, raidPoller = 0;
  let raidState = null, ownRaidDamage = 0, lastConnectedUser = null, profileModal = null;
  const game = () => window.PO?.S?.();
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const setStatus = (msg, good=false) => {
    const el=$('onlineStatus'); if(el) { el.textContent=msg; el.style.color=good?'#8fe0a8':'#ffbd75'; }
    const st=$('onlineState'); if(st) st.textContent=good?'ONLINE':'OFFLINE';
  };
  function updatePanels() {
    const auth=$('onlineAuth'), account=$('onlineAccount');
    if(auth) auth.style.display=session?'none':'grid';
    if(account) account.style.display=session?'block':'none';
    if($('onlinePlayers')) $('onlinePlayers').textContent=session?String(presenceCount):'—';
  }
  function makeProfile() {
    const s=game(); if(!s || !session) return Promise.resolve({error:null});
    const p=s.prof; p.uid=p.uid||('PO-'+Math.random().toString(36).slice(2,8).toUpperCase());
    return db.from('pilot_profiles').upsert({user_id:session.user.id,pilot_code:p.uid,display_name:p.name||'ПИЛОТ',avatar:String(p.avatar||'a0').slice(0,16),level:s.level||1,total_playtime_seconds:Math.floor(s.st?.totalTime||0),last_seen:new Date().toISOString()},{onConflict:'user_id'});
  }
  async function refreshBoard() {
    if(!session) return;
    const el=$('onlineBoard'); if(el) el.textContent='ЗАГРУЗКА РЕЙТИНГА…';
    const {data,error}=await db.from('leaderboard').select('pilot_code,display_name,level,best_wave,score').order('score',{ascending:false}).limit(20);
    if(error){if(el)el.textContent='Не удалось загрузить рейтинг: '+error.message;return;}
    if(el) el.innerHTML=data.length?data.map((r,i)=>`<div class="po-rank-row"><span>${i+1}. ${esc(r.display_name)} <small>${esc(r.pilot_code)}</small></span><b>${Number(r.score).toLocaleString('ru-RU')}</b></div>`).join(''):'Пока нет опубликованных результатов.';
    const idx=data.findIndex(r=>r.pilot_code===game()?.prof?.uid);
    if($('onlineRank')) $('onlineRank').textContent=idx>=0?'#'+(idx+1):'—';
  }
  async function submitScore() {
    if(!session) return;
    const s=game(); if(!s) return;
    const {error}=await db.functions.invoke('pixel-orbit-submit-score',{body:{pilot_code:s.prof.uid,display_name:s.prof.name,avatar:s.prof.avatar,level:s.level,best_wave:s.best,bosses:s.st.bosses,kills:s.kills,total_playtime_seconds:Math.floor(s.st.totalTime||0)}});
    if(error) { setStatus('Не удалось отправить рекорд: '+error.message); return; }
    await refreshBoard(); setStatus('ПОДКЛЮЧЕНО · РЕКОРД ОТПРАВЛЕН',true);
  }
  function presenceState() { return lobby?.presenceState?.() || {}; }
  function isOnline(uid) { const state=presenceState(); return Array.isArray(state[uid]) ? state[uid].length>0 : !!state[uid]; }
  function relativeSeen(value) {
    if(!value) return 'давно не заходил';
    const ms=Date.now()-new Date(value).getTime(); if(!Number.isFinite(ms)||ms<0) return 'недавно';
    const m=Math.floor(ms/60000),h=Math.floor(ms/3600000),d=Math.floor(ms/86400000);
    if(m<1)return 'только что'; if(m<60)return `${m} мин. назад`; if(h<24)return `${h} ч. назад`; if(d<7)return `${d} дн. назад`;
    return new Date(value).toLocaleDateString('ru-RU');
  }
  async function startPresence() {
    if(lobby) await db.removeChannel(lobby);
    lobby=db.channel('pixel-orbit-lobby',{config:{presence:{key:session.user.id}}});
    lobby.on('presence',{event:'sync'},()=>{
      presenceCount=Object.keys(presenceState()).length;
      if($('onlinePlayers')) $('onlinePlayers').textContent=String(presenceCount);
      loadFriends();
    }).subscribe(async status=>{
      if(status==='SUBSCRIBED') {
        const s=game(); await lobby.track({pilot_code:s?.prof?.uid||'PO-??????',display_name:s?.prof?.name||'ПИЛОТ',level:s?.level||1,online_at:new Date().toISOString()});
        setStatus('ПОДКЛЮЧЕНО · ПИЛОТ В ЛОББИ',true);
      } else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT') setStatus('Ошибка канала присутствия: '+status);
    });
  }
  function friendCard(r,p,kind) {
    const online=isOnline(p.user_id), state=online?'В СЕТИ':`БЫЛ(А) ${relativeSeen(p.last_seen)}`;
    const action=kind==='incoming'?`<button class="btn go" data-friend-accept="${r.id}">ПРИНЯТЬ</button><button class="btn" data-friend-decline="${r.id}">ОТКЛОНИТЬ</button>`:kind==='outgoing'?'<small class="po-pending">ОЖИДАЕТ ОТВЕТА</small>':`<button class="btn" data-open-friend="${esc(p.user_id)}">ПРОФИЛЬ</button><button class="btn go" data-chat-friend="${esc(p.user_id)}" data-chat-name="${esc(p.display_name||'Пилот')}">ЧАТ</button><button class="btn bad" data-remove-friend="${esc(p.user_id)}">УДАЛИТЬ</button>`;
    let avHtml=esc((p.display_name||'П').slice(0,1).toUpperCase());
    try{
      const av=p.avatar||'a0';
      if(typeof window.avURL==='function'){avHtml=`<img src="${window.avURL(av)}" alt="">`;}
      else if(String(av).startsWith('data:')){avHtml=`<img src="${av}" alt="">`;}
    }catch(e){}
    return `<div class="po-friend-card"><div class="po-friend-main"><div class="po-friend-avatar">${avHtml}<span class="po-presence ${online?'online':''}"></span></div><div class="po-friend-info"><b>${esc(p.display_name||'ПИЛОТ')}</b><small>${esc(p.pilot_code||'')} · УР. ${Number(p.level)||1}</small><small class="po-friend-status">${state}</small></div></div><div class="po-friend-actions">${action}</div></div>`;
  }
  async function loadFriends() {
    const el=$('friendList'); if(!session||!el)return;
    const {data,error}=await db.from('friend_requests').select('id,sender_id,receiver_id,status,created_at').or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`).order('created_at',{ascending:false}).limit(80);
    if(error){el.textContent='Не удалось загрузить друзей: '+error.message;return;}
    const active=(data||[]).filter(r=>r.status==='accepted'||r.status==='pending');
    if(!active.length){el.innerHTML='<div class="po-empty">Пока нет друзей. Добавь пилота по коду выше.</div>';return;}
    const ids=[...new Set(active.map(x=>x.sender_id===session.user.id?x.receiver_id:x.sender_id))];
    const {data:profiles,error:profileError}=await db.from('pilot_profiles').select('user_id,pilot_code,display_name,avatar,level,total_playtime_seconds,last_seen,raid_tokens').in('user_id',ids);
    if(profileError){el.textContent='Не удалось загрузить профили друзей: '+profileError.message;return;}
    const map=new Map((profiles||[]).map(x=>[x.user_id,x]));
    const accepted=[],incoming=[],outgoing=[];
    active.forEach(r=>{const incomingReq=r.receiver_id===session.user.id&&r.status==='pending';const outgoingReq=r.sender_id===session.user.id&&r.status==='pending';const uid=r.sender_id===session.user.id?r.receiver_id:r.sender_id;const p=map.get(uid)||{user_id:uid,display_name:'ПИЛОТ',pilot_code:'',level:1};if(r.status==='accepted')accepted.push(friendCard(r,p,'friend'));else if(incomingReq)incoming.push(friendCard(r,p,'incoming'));else if(outgoingReq)outgoing.push(friendCard(r,p,'outgoing'));});
    const search=($('friendSearch')?.value||'').trim().toLowerCase();
    let html='';
    if(incoming.length)html+=`<div class="po-friend-group"><b>ВХОДЯЩИЕ ЗАПРОСЫ · ${incoming.length}</b>${incoming.join('')}</div>`;
    if(accepted.length)html+=`<div class="po-friend-group"><b>МОИ ДРУЗЬЯ · ${accepted.length}</b>${accepted.join('')}</div>`;
    if(outgoing.length)html+=`<div class="po-friend-group"><b>ОТПРАВЛЕННЫЕ · ${outgoing.length}</b>${outgoing.join('')}</div>`;
    if(!html)html='<div class="po-empty">Список друзей пуст.</div>';
    el.innerHTML=html;
    if(search){[...el.querySelectorAll('.po-friend-card')].forEach(card=>{card.style.display=card.textContent.toLowerCase().includes(search)?'':'none';});}
  }
  function ensureProfileModal() {
    if(profileModal)return profileModal;
    profileModal=document.createElement('div');profileModal.id='friendProfileModal';profileModal.className='po-modal';profileModal.innerHTML='<div class="po-modal-card"><button class="po-modal-close" data-close-friend-profile>✕</button><div id="friendProfileContent">ЗАГРУЗКА ПРОФИЛЯ…</div></div>';
    document.body.appendChild(profileModal);return profileModal;
  }
  async function openFriendProfile(uid) {
    if(!session)return;
    const modal=ensureProfileModal(),content=$('friendProfileContent');modal.classList.add('show');content.textContent='ЗАГРУЗКА ПРОФИЛЯ…';
    const {data:p,error}=await db.from('pilot_profiles').select('user_id,pilot_code,display_name,avatar,level,total_playtime_seconds,last_seen,raid_tokens').eq('user_id',uid).maybeSingle();
    if(error||!p){content.textContent='Не удалось открыть профиль пилота.';return;}
    const {data:score}=await db.from('leaderboard').select('best_wave,bosses,kills,score').eq('user_id',uid).maybeSingle();
    const online=isOnline(uid);const friend=uid!==session.user.id;
    content.innerHTML=`<div class="po-profile-head"><div class="po-profile-avatar">${esc((p.display_name||'П').slice(0,1).toUpperCase())}</div><div><h3>${esc(p.display_name)}</h3><small>${esc(p.pilot_code)} · УРОВЕНЬ ${Number(p.level)||1}</small><p class="po-friend-status"><span class="po-presence ${online?'online':''}"></span>${online?'СЕЙЧАС В СЕТИ':`ПОСЛЕДНИЙ ВХОД: ${relativeSeen(p.last_seen)}`}</p></div></div><div class="po-profile-stats"><div><b>${Number(score?.best_wave)||0}</b><small>РЕКОРД ВОЛНЫ</small></div><div><b>${Number(score?.bosses)||0}</b><small>БОССОВ</small></div><div><b>${Number(score?.kills)||0}</b><small>УБИЙСТВ</small></div><div><b>${Number(score?.score)||0}</b><small>ОЧКИ</small></div><div><b>${Math.floor((Number(p.total_playtime_seconds)||0)/3600)}ч</b><small>ВРЕМЯ В ИГРЕ</small></div><div><b>${Number(p.raid_tokens)||0}</b><small>РЕЙД-ЖЕТОНЫ</small></div></div><div class="po-profile-actions"><button class="btn" data-copy-code="${esc(p.pilot_code)}">КОПИРОВАТЬ КОД</button>${friend?`<button class="btn go" data-profile-raid>ОТКРЫТЬ РЕЙД</button>`:''}</div>`;
  }
  async function loadRaidBoard() {
    const el=$('raidBoard');if(!session||!el||!raidState)return;
    const {data,error}=await db.from('coop_raid_contributions').select('user_id,damage,attacks').eq('phase',raidState.phase).order('damage',{ascending:false}).limit(5);
    if(error){el.textContent='Не удалось загрузить вклад игроков.';return;}
    if(!data?.length){el.textContent='Пока никто не атаковал босса.';return;}
    const ids=data.map(x=>x.user_id);const {data:profiles}=await db.from('pilot_profiles').select('user_id,display_name').in('user_id',ids);const map=new Map((profiles||[]).map(p=>[p.user_id,p.display_name]));
    el.innerHTML=data.map((x,i)=>`<div class="po-rank-row"><span>${i+1}. ${esc(map.get(x.user_id)||'ПИЛОТ')} <small>${Number(x.attacks)} атак</small></span><b>${Number(x.damage).toLocaleString('ru-RU')}</b></div>`).join('');
  }
  function paintRaid(message) {
    const hp=Math.max(0,Math.min(Number(raidState?.max_hp)||1,Number(raidState?.hp)||0)),max=Number(raidState?.max_hp)||250000;
    if($('raidBossName'))$('raidBossName').textContent=raidState?.boss_name||'НЕБУЛОН';
    if($('raidPhase'))$('raidPhase').textContent=raidState?.phase||1;
    if($('raidHp'))$('raidHp').textContent=hp.toLocaleString('ru-RU')+' / '+max.toLocaleString('ru-RU');
    if($('raidHpBar'))$('raidHpBar').style.width=(hp/max*100)+'%';
    if($('raidTotalDamage'))$('raidTotalDamage').textContent=Number(raidState?.total_damage||0).toLocaleString('ru-RU');
    if($('raidPlayers'))$('raidPlayers').textContent=raidChannel?String(Object.keys(raidChannel.presenceState()||{}).length):'0';
    if($('raidTokens'))$('raidTokens').textContent=String(game()?.prof?.raidTokens||0);
    if($('raidStatus'))$('raidStatus').textContent=message||(raidState?.defeated_at?'БОСС ПОВЕРЖЕН · НОВАЯ ФАЗА СКОРО':'ОБЩИЙ БОСС · УРОН ПРИНИМАЕТСЯ СЕРВЕРОМ');
    if($('raidAttack'))$('raidAttack').disabled=!raidChannel||!session||!raidState||hp<=0;
  }
  async function refreshRaidState() {
    if(!session||!raidChannel)return;
    const {data,error}=await db.rpc('join_coop_raid');
    if(error){if($('raidStatus'))$('raidStatus').textContent='Ошибка синхронизации: '+error.message;return;}
    raidState=data;paintRaid();await loadRaidBoard();
  }
  async function joinRaid() {
    if(!session){setStatus('Сначала войди в аккаунт.');return;}
    if(raidChannel)return;
    raidChannel=db.channel('pixel-orbit-coop-global',{config:{presence:{key:session.user.id}}});
    raidChannel.on('postgres_changes',{event:'UPDATE',schema:'public',table:'coop_raid_state',filter:'id=eq.global'},payload=>{
      raidState=payload.new;paintRaid();loadRaidBoard();
    }).on('presence',{event:'sync'},()=>{
      if($('raidPlayers'))$('raidPlayers').textContent=String(Object.keys(raidChannel.presenceState()||{}).length);
    }).subscribe(async status=>{
      if(status==='SUBSCRIBED'){
        const s=game();await raidChannel.track({pilot_code:s?.prof?.uid,display_name:s?.prof?.name});
        await refreshRaidState();
        if($('raidStatus'))$('raidStatus').textContent='ТЫ В РЕЙДЕ · БОСС ОБЩИЙ ДЛЯ ВСЕХ ИГРОКОВ';
        clearInterval(raidPoller);raidPoller=setInterval(refreshRaidState,12000);
      } else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){
        if($('raidStatus'))$('raidStatus').textContent='ОШИБКА ПОДКЛЮЧЕНИЯ К РЕЙДУ: '+status;
      }
    });
  }
  async function attackRaid() {
    if(!raidChannel||!session||!raidState||Number(raidState.hp)<=0)return;
    if($('raidAttack'))$('raidAttack').disabled=true;
    const {data,error}=await db.rpc('attack_coop_boss');
    if(error){const msg=error.message||'Ошибка атаки';if($('raidStatus'))$('raidStatus').textContent=msg.includes('attack_cooldown')?'Перезарядка: подожди секунду перед следующей атакой.':msg.includes('boss_defeated')?'Босс уже побеждён. Ожидаем следующую фазу.':'Атака отклонена: '+msg;paintRaid($('raidStatus')?.textContent);return;}
    raidState={...raidState,...data};ownRaidDamage+=Number(data.damage)||0;
    if(data.killed){if($('raidStatus'))$('raidStatus').textContent='ПОБЕДА! Все участники фазы получили по 1 рейд-жетону.';db.functions.invoke('pixel-orbit-push',{body:{type:'raid_boss_defeated',title:'БОСС ПОВЕРЖЕН!',body:'Небулон уничтожен! Твой отряд получил награды.'}}).catch(()=>{});}
    else if($('raidStatus'))$('raidStatus').textContent=`ТВОЙ УРОН: ${Number(data.damage).toLocaleString('ru-RU')} · ВКЛАД: ${ownRaidDamage.toLocaleString('ru-RU')}`;
    const s=game();if(s?.prof){s.prof.raidTokens=Number(data.raid_tokens)||0;window.PO?.save?.();}
    paintRaid($('raidStatus')?.textContent);await loadRaidBoard();
    if($('raidTokens'))$('raidTokens').textContent=String(data.raid_tokens||0);
  }
  window.POOnline={joinRaid,attackRaid,getRaidState:()=>raidState,getPresence:()=>raidChannel?Object.keys(raidChannel.presenceState()||{}).length:0,getOwnDamage:()=>ownRaidDamage,isJoined:()=>!!raidChannel};
  async function connected() {
    const {data:{session:s}}=await db.auth.getSession();session=s;updatePanels();
    if(!session){lastConnectedUser=null;setStatus('НЕ ВОШЛИ В АККАУНТ');return;}
    if(lastConnectedUser===session.user.id&&lobby)return;lastConnectedUser=session.user.id;
    const p=await makeProfile();if(p.error){setStatus('Ошибка профиля: '+p.error.message);return;}
    const {data:ownProfile}=await db.from('pilot_profiles').select('raid_tokens').eq('user_id',session.user.id).maybeSingle();
    if(ownProfile&&game()?.prof)game().prof.raidTokens=Number(ownProfile.raid_tokens)||0;
    await startPresence();await refreshBoard();await loadFriends();await submitScore();
    clearInterval(scoreTimer);scoreTimer=setInterval(async()=>{await makeProfile();await submitScore();},60000);
  }
  async function authAction(kind) {
    const email=$('onlineEmail')?.value.trim(),password=$('onlinePassword')?.value||'';let res;
    if(kind==='guest')res=await db.auth.signInAnonymously();
    else if(!email||password.length<6){setStatus('Укажи email и пароль минимум 6 символов.');return;}
    else if(kind==='register')res=await db.auth.signUp({email,password});else res=await db.auth.signInWithPassword({email,password});
    if(res.error){setStatus(kind==='guest'?'Гостевой вход недоступен. В Supabase включи Anonymous sign-ins. '+res.error.message:res.error.message);return;}
    if(kind==='register'&&!res.data.session){setStatus('Аккаунт создан. Подтверди email по письму, затем войди.');return;}
    session=res.data.session;lastConnectedUser=null;await connected();updatePanels();
  }
  async function cloudSave() {
    if(!session)return;const s=game();if(!s)return;
    const {error}=await db.from('cloud_saves').upsert({user_id:session.user.id,save_data:s,updated_at:new Date().toISOString()},{onConflict:'user_id'});
    setStatus(error?'Ошибка облачного сохранения: '+error.message:'СОХРАНЕНИЕ ОТПРАВЛЕНО В ОБЛАКО',!error);
  }
  async function cloudLoad() {
    if(!session)return;
    if(!confirm('Заменить текущий прогресс облачным сохранением? Сначала экспортируй локальный прогресс, если хочешь оставить копию.'))return;
    const {data,error}=await db.from('cloud_saves').select('save_data').eq('user_id',session.user.id).maybeSingle();
    if(error||!data){setStatus(error?'Ошибка загрузки: '+error.message:'В облаке пока нет сохранения.');return;}
    try{localStorage.setItem('pixelorbit_v4',JSON.stringify(data.save_data));location.reload();}catch(e){setStatus('Не удалось применить сохранение: '+e.message);}
  }
  async function addFriend() {
    const code=$('friendCode')?.value.trim().toUpperCase();if(!session||!/^PO-[A-Z0-9]{6}$/.test(code||'')){setStatus('Введи код друга в формате PO-XXXXXX (кнопка копирования в профиле).');return;}
    const {data:profile,error}=await db.from('pilot_profiles').select('user_id').eq('pilot_code',code).maybeSingle();
    if(error||!profile){setStatus('Пилот с таким кодом не найден. Он должен хотя бы раз войти в сеть.');return;}
    if(profile.user_id===session.user.id){setStatus('Нельзя добавить самого себя.');return;}
    const {error:e}=await db.from('friend_requests').insert({sender_id:session.user.id,receiver_id:profile.user_id});
    if(e){setStatus(e.code==='23505'?'Запрос уже существует.':'Ошибка запроса: '+e.message);return;}
    db.functions.invoke('pixel-orbit-push',{body:{type:'friend_request',target_user_id:profile.user_id,title:'Новый запрос в друзья',body:(game()?.prof?.name||'Пилот')+' хочет добавить тебя в друзья.'}}).catch(()=>{});
    if($('friendCode'))$('friendCode').value='';setStatus('ЗАПРОС ДРУГУ ОТПРАВЛЕН',true);await loadFriends();
  }
  async function removeFriend(uid) {
    if(!confirm('Удалить этого пилота из списка друзей?'))return;
    const me=session.user.id;
    const {data,error}=await db.from('friend_requests').delete().eq('status','accepted').or(`and(sender_id.eq.${me},receiver_id.eq.${uid}),and(sender_id.eq.${uid},receiver_id.eq.${me})`).select('id');
    if(error||!data?.length){setStatus(error?'Не удалось удалить друга: '+error.message:'Связь с другом не найдена.');return;}
    setStatus('ДРУГ УДАЛЁН',true);await loadFriends();
  }
  document.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b)return;const id=b.id;
    try{
      if(id==='onlineGuest')await authAction('guest');if(id==='onlineRegister')await authAction('register');if(id==='onlineLogin')await authAction('login');
      if(id==='cloudSave')await cloudSave();if(id==='cloudLoad')await cloudLoad();
      if(id==='onlineLogout'){if(lobby)await db.removeChannel(lobby);lobby=null;if(raidChannel)await db.removeChannel(raidChannel);raidChannel=null;clearInterval(raidPoller);clearInterval(scoreTimer);await db.auth.signOut();session=null;lastConnectedUser=null;raidState=null;updatePanels();setStatus('ВЫ ВЫШЛИ ИЗ АККАУНТА');paintRaid('Войди в сеть, чтобы присоединиться к рейду.');}
      if(id==='friendAdd')await addFriend();if(id==='friendRefresh')await loadFriends();if(id==='onlineRefresh')await refreshBoard();
      if(id==='raidJoin')await joinRaid();if(id==='raidAttack')await attackRaid();
      if(b.dataset.openFriend)await openFriendProfile(b.dataset.openFriend);
      if(b.dataset.removeFriend)await removeFriend(b.dataset.removeFriend);
      if(b.dataset.friendAccept||b.dataset.friendDecline){const response=b.dataset.friendAccept?'accepted':'declined';const {error}=await db.rpc('respond_to_friend_request',{request_id:Number(b.dataset.friendAccept||b.dataset.friendDecline),response});setStatus(error?'Не удалось обработать запрос: '+error.message:response==='accepted'?'ДРУГ ДОБАВЛЕН':'ЗАПРОС ОТКЛОНЁН',!error);await loadFriends();}
      if(b.dataset.closeFriendProfile&&profileModal)profileModal.classList.remove('show');
      if(b.dataset.copyCode){await navigator.clipboard?.writeText(b.dataset.copyCode);setStatus('КОД ПИЛОТА СКОПИРОВАН',true);}
      if(b.dataset.profileRaid){if(profileModal)profileModal.classList.remove('show');await joinRaid();}
    }catch(err){setStatus('Ошибка сети: '+(err?.message||err));}
  });
  document.addEventListener('click',e=>{if(profileModal&&e.target===profileModal)profileModal.classList.remove('show');});
  $('friendSearch')?.addEventListener('input',()=>{const q=($('friendSearch')?.value||'').trim().toLowerCase();document.querySelectorAll('#friendList .po-friend-card').forEach(card=>{card.style.display=card.textContent.toLowerCase().includes(q)?'':'none';});});
  db.auth.onAuthStateChange((_event,s)=>{session=s;updatePanels();if(s){lastConnectedUser=null;setTimeout(()=>connected(),0);}else{if(lobby)db.removeChannel(lobby);lobby=null;if(raidChannel)db.removeChannel(raidChannel);raidChannel=null;clearInterval(raidPoller);lastConnectedUser=null;setStatus('НЕ ВОШЛИ В АККАУНТ');paintRaid('Войди в сеть, чтобы присоединиться к рейду.');}});
  const profileRoot=$('profBody');
  if(profileRoot)new MutationObserver(()=>{updatePanels();if(session){refreshBoard();loadFriends();}}).observe(profileRoot,{childList:true});
  connected();

  /* ---- private chat (local + optional supabase) ---- */
  let chatTarget = null;
  function chatKey(uid){ return 'po_chat_' + (session?.user?.id||'local') + '_' + uid; }
  function loadChatHistory(uid){
    try{ return JSON.parse(localStorage.getItem(chatKey(uid))||'[]'); }catch(e){return []}
  }
  function saveChatHistory(uid, msgs){
    try{ localStorage.setItem(chatKey(uid), JSON.stringify(msgs.slice(-80))); }catch(e){}
  }
  function renderChat(){
    const box = $('chatMsgs'); if(!box||!chatTarget) return;
    const msgs = loadChatHistory(chatTarget);
    box.innerHTML = msgs.map(m => `<div class="chat-msg ${m.me?'me':'them'}">${esc(m.text)}<br><small style="opacity:.5;font-size:10px">${new Date(m.t).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</small></div>`).join('') || '<p style="text-align:center;color:#6a7;padding:20px">Начни переписку</p>';
    box.scrollTop = box.scrollHeight;
  }
  function openChat(uid, name, av){
    chatTarget = uid;
    $('chatName').textContent = name || 'Пилот';
    const img = $('chatAv');
    if(img){ img.src = (window.avURL ? avURL(av||'a0') : ''); img.style.imageRendering='pixelated'; }
    $('chatModal').classList.add('show');
    renderChat();
    $('chatInput')?.focus();
  }
  function sendChat(){
    const inp = $('chatInput'); if(!inp||!chatTarget) return;
    const text = (inp.value||'').trim(); if(!text) return;
    const msgs = loadChatHistory(chatTarget);
    msgs.push({me:true, text, t:Date.now()});
    saveChatHistory(chatTarget, msgs);
    inp.value = '';
    renderChat();
    // optional: try supabase insert if table exists
    if(session && db){
      db.from('pilot_messages').insert({
        sender_id: session.user.id,
        receiver_id: chatTarget,
        body: text.slice(0,280)
      }).then(({error})=>{ if(error) console.log('chat sync skip', error.message); });
    }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-chat-friend]');
    if(b){ openChat(b.dataset.chatFriend, b.dataset.chatName, 'a0'); return; }
    if(e.target.id==='chatClose' || e.target.closest('#chatClose')){ $('chatModal')?.classList.remove('show'); chatTarget=null; }
    if(e.target.id==='chatSend') sendChat();
  });
  $('chatInput')?.addEventListener('keydown', e => { if(e.key==='Enter') sendChat(); });

})();