/* Pixel Orbit Online — browser client. Publishable key only; never place service_role here. */
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
  let session = null, lobby = null, boardChannel = null, raidChannel = null, presenceCount = 0, scoreTimer = 0, raidHp = 10000, raidMax = 10000, raidDamage = 0, raidResetTimer = null;
  const game = () => window.PO?.S?.();
  const setStatus = (msg, good=false) => {
    const el=$('onlineStatus'); if(el) { el.textContent=msg; el.style.color=good?'#8fe0a8':'#ffbd75'; }
    const st=$('onlineState'); if(st) st.textContent=good?'ONLINE':'OFFLINE';
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function updatePanels() {
    const auth=$('onlineAuth'), account=$('onlineAccount');
    if(auth) auth.style.display=session?'none':'grid';
    if(account) account.style.display=session?'block':'none';
    if($('onlinePlayers')) $('onlinePlayers').textContent=session?String(presenceCount):'—';
  }
  function makeProfile() {
    const s=game(); if(!s || !session) return Promise.resolve();
    const p=s.prof; p.uid=p.uid||('PO-'+Math.random().toString(36).slice(2,8).toUpperCase());
    return db.from('pilot_profiles').upsert({user_id:session.user.id,pilot_code:p.uid,display_name:p.name||'ПИЛОТ',avatar:String(p.avatar||'a0').slice(0,16),level:s.level||1,total_playtime_seconds:Math.floor(s.st?.totalTime||0),last_seen:new Date().toISOString()},{onConflict:'user_id'});
  }
  async function refreshBoard() {
    if(!session) return;
    const el=$('onlineBoard'); if(el) el.textContent='ЗАГРУЗКА РЕЙТИНГА…';
    const {data,error}=await db.from('leaderboard').select('pilot_code,display_name,level,best_wave,score').order('score',{ascending:false}).limit(20);
    if(error){if(el)el.textContent='Не удалось загрузить рейтинг: '+error.message;return;}
    if(el) el.innerHTML=data.length?data.map((r,i)=>`<div style="display:flex;justify-content:space-between;gap:8px;padding:6px 2px;border-bottom:1px solid #30394e"><span>${i+1}. ${esc(r.display_name)} <small style="color:#8d9ab7">${esc(r.pilot_code)}</small></span><b>${Number(r.score).toLocaleString('ru-RU')}</b></div>`).join(''):'Пока нет опубликованных результатов.';
    const idx=data.findIndex(r=>r.pilot_code===game()?.prof?.uid);
    if($('onlineRank')) $('onlineRank').textContent=idx>=0?'#'+(idx+1):'—';
  }
  async function submitScore() {
    if(!session) return;
    const s=game(); if(!s) return;
    const {data,error}=await db.functions.invoke('pixel-orbit-submit-score',{body:{pilot_code:s.prof.uid,display_name:s.prof.name,avatar:s.prof.avatar,level:s.level,best_wave:s.best,bosses:s.st.bosses,kills:s.kills,total_playtime_seconds:Math.floor(s.st.totalTime||0)}});
    if(error) { setStatus('Не удалось отправить рекорд: '+error.message); return; }
    await refreshBoard();
    setStatus('ПОДКЛЮЧЕНО · РЕКОРД ОТПРАВЛЕН',true);
  }
  async function startPresence() {
    if(lobby) await db.removeChannel(lobby);
    lobby=db.channel('pixel-orbit-lobby',{config:{presence:{key:session.user.id}}});
    lobby.on('presence',{event:'sync'},()=>{
      const state=lobby.presenceState(); presenceCount=Object.keys(state).length;
      if($('onlinePlayers')) $('onlinePlayers').textContent=String(presenceCount);
    }).subscribe(async status=>{
      if(status==='SUBSCRIBED') {
        const s=game(); await lobby.track({pilot_code:s?.prof?.uid||'PO-??????',display_name:s?.prof?.name||'ПИЛОТ',level:s?.level||1,online_at:new Date().toISOString()});
        setStatus('ПОДКЛЮЧЕНО · ПИЛОТ В ЛОББИ',true);
      } else if(status==='CHANNEL_ERROR' || status==='TIMED_OUT') setStatus('Ошибка канала присутствия: '+status);
    });
  }
  async function loadFriends() {
    const el=$('friendList'); if(!session||!el)return;
    const {data,error}=await db.from('friend_requests').select('id,sender_id,receiver_id,status').or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`).order('created_at',{ascending:false}).limit(30);
    if(error){el.textContent='Не удалось загрузить друзей: '+error.message;return;}
    if(!data.length){el.textContent='Пока нет друзей. Добавь пилота по коду выше.';return;}
    const ids=[...new Set(data.map(x=>x.sender_id===session.user.id?x.receiver_id:x.sender_id))];
    const {data:profiles}=await db.from('pilot_profiles').select('user_id,pilot_code,display_name').in('user_id',ids);
    const map=new Map((profiles||[]).map(x=>[x.user_id,x]));
    el.innerHTML=data.map(r=>{const incoming=r.receiver_id===session.user.id&&r.status==='pending',id=r.sender_id===session.user.id?r.receiver_id:r.sender_id,p=map.get(id);return `<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding:6px 0;border-bottom:1px solid #30394e"><span>${esc(p?.display_name||'ПИЛОТ')} · ${esc(p?.pilot_code||'')}</span><span>${incoming?`<button class="btn" data-friend-accept="${r.id}">ПРИНЯТЬ</button>`:r.status==='accepted'?'ДРУЗЬЯ':r.status==='declined'?'ОТКЛОНЕНО':'ОЖИДАНИЕ'}</span></div>`}).join('');
  }
  function paintRaid(message) {
    const hp=Math.max(0,Math.min(raidMax,raidHp));
    if($('raidHp')) $('raidHp').textContent=hp.toLocaleString('ru-RU')+' / '+raidMax.toLocaleString('ru-RU');
    if($('raidHpBar')) $('raidHpBar').style.width=(hp/raidMax*100)+'%';
    if($('raidStatus')) $('raidStatus').textContent=message||('РЕЙД АКТИВЕН · ТВОЙ УРОН: '+raidDamage.toLocaleString('ru-RU'));
    if($('raidAttack')) $('raidAttack').disabled=!raidChannel||!session||hp<=0;
  }
  async function joinRaid() {
    if(!session){setStatus('Сначала войди в аккаунт.');return;}
    if(raidChannel) return;
    raidChannel=db.channel('pixel-orbit-coop-raid',{config:{presence:{key:session.user.id},broadcast:{ack:true,self:false}}});
    raidChannel.on('broadcast',{event:'raid_hit'},({payload})=>{
      raidHp=Math.max(0,raidHp-Math.max(0,Math.min(500,Number(payload?.damage)||0)));
      if(raidHp===0){paintRaid('БОСС ПОВЕРЖЕН! Новый противник прибудет через несколько секунд.');clearTimeout(raidResetTimer);raidResetTimer=setTimeout(()=>{raidHp=raidMax;paintRaid('НОВЫЙ БОСС · РЕЙД ПРОДОЛЖАЕТСЯ');},5000);} else paintRaid();
    }).on('broadcast',{event:'raid_snapshot'},({payload})=>{
      if(Number.isFinite(Number(payload?.hp))) {raidHp=Math.max(0,Math.min(raidMax,Number(payload.hp)));paintRaid('СОСТОЯНИЕ БОССА СИНХРОНИЗИРОВАНО');}
    }).on('broadcast',{event:'raid_request'},async()=>{
      await raidChannel.send({type:'broadcast',event:'raid_snapshot',payload:{hp:raidHp}});
    }).on('presence',{event:'sync'},async()=>{
      const count=Object.keys(raidChannel.presenceState()).length;
      if(count>1) await raidChannel.send({type:'broadcast',event:'raid_snapshot',payload:{hp:raidHp}});
    }).subscribe(async status=>{
      if(status==='SUBSCRIBED'){
        const s=game();await raidChannel.track({pilot_code:s?.prof?.uid,display_name:s?.prof?.name});
        await raidChannel.send({type:'broadcast',event:'raid_request',payload:{}});
        paintRaid('ТЫ В РЕЙДЕ · ОЖИДАЕМ СОЮЗНИКОВ');
      } else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT') paintRaid('ОШИБКА ПОДКЛЮЧЕНИЯ К РЕЙДУ: '+status);
    });
  }
  async function attackRaid() {
    if(!raidChannel||!session||raidHp<=0)return;
    const s=game();const damage=Math.max(10,Math.min(500,20+(s?.level||1)*3+Math.floor((s?.wave||1)/2)));
    raidHp=Math.max(0,raidHp-damage);raidDamage+=damage;paintRaid();
    await raidChannel.send({type:'broadcast',event:'raid_hit',payload:{damage,pilot_code:s?.prof?.uid||'pilot'}});
    if(raidHp===0){paintRaid('БОСС ПОВЕРЖЕН! Новый противник прибудет через несколько секунд.');clearTimeout(raidResetTimer);raidResetTimer=setTimeout(()=>{raidHp=raidMax;paintRaid('НОВЫЙ БОСС · РЕЙД ПРОДОЛЖАЕТСЯ');},5000);}
  }
  async function connected() {
    const {data:{session:s}}=await db.auth.getSession(); session=s;
    updatePanels();
    if(!session){setStatus('НЕ ВОШЛИ В АККАУНТ');return;}
    const p=await makeProfile();
    if(p.error){setStatus('Ошибка профиля: '+p.error.message);return;}
    await startPresence(); await refreshBoard(); await loadFriends(); await submitScore();
    clearInterval(scoreTimer); scoreTimer=setInterval(()=>{makeProfile().then(submitScore)},60000);
  }
  async function authAction(kind) {
    const email=$('onlineEmail')?.value.trim(),password=$('onlinePassword')?.value||'';
    let res;
    if(kind==='guest') res=await db.auth.signInAnonymously();
    else if(!email||password.length<6){setStatus('Укажи email и пароль минимум 6 символов.');return;}
    else if(kind==='register') res=await db.auth.signUp({email,password});
    else res=await db.auth.signInWithPassword({email,password});
    if(res.error){setStatus(kind==='guest'?'Гостевой вход недоступен. В Supabase включи Authentication → Sign In / Providers → Anonymous sign-ins. '+res.error.message:res.error.message);return;}
    if(kind==='register'&&!res.data.session){setStatus('Аккаунт создан. Подтверди email по письму, затем войди.');return;}
    session=res.data.session; await connected(); updatePanels();
  }
  async function cloudSave() {
    if(!session)return; const s=game(); if(!s)return;
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
    const code=$('friendCode')?.value.trim().toUpperCase(); if(!session||!/^PO-[A-Z0-9]{6}$/.test(code||'')){setStatus('Введи корректный код PO-XXXXXX.');return;}
    const {data:profile,error}=await db.from('pilot_profiles').select('user_id').eq('pilot_code',code).maybeSingle();
    if(error||!profile){setStatus('Пилот с таким кодом не найден. Он должен хотя бы раз войти в сеть.');return;}
    if(profile.user_id===session.user.id){setStatus('Нельзя добавить самого себя.');return;}
    const {error:e}=await db.from('friend_requests').insert({sender_id:session.user.id,receiver_id:profile.user_id});
    if(e){setStatus(e.code==='23505'?'Запрос уже отправлен.':'Ошибка запроса: '+e.message);return;}
    setStatus('ЗАПРОС ДРУГУ ОТПРАВЛЕН',true); await loadFriends();
  }
  document.addEventListener('click',async e=>{
    const id=e.target?.id;
    try{
      if(id==='onlineGuest')await authAction('guest');
      if(id==='onlineRegister')await authAction('register');
      if(id==='onlineLogin')await authAction('login');
      if(id==='cloudSave')await cloudSave();
      if(id==='cloudLoad')await cloudLoad();
      if(id==='onlineLogout'){if(lobby)await db.removeChannel(lobby);lobby=null;if(raidChannel)await db.removeChannel(raidChannel);raidChannel=null;await db.auth.signOut();session=null;clearInterval(scoreTimer);updatePanels();setStatus('ВЫ ВЫШЛИ ИЗ АККАУНТА');}
      if(id==='friendAdd')await addFriend();
      if(id==='onlineRefresh')await refreshBoard();
      if(id==='raidJoin')await joinRaid();
      if(id==='raidAttack')await attackRaid();
      const accept=e.target.closest('[data-friend-accept]');
      if(accept&&session){const {error}=await db.rpc('respond_to_friend_request',{request_id:Number(accept.dataset.friendAccept),response:'accepted'});setStatus(error?'Не удалось принять запрос: '+error.message:'ДРУГ ДОБАВЛЕН',!error);await loadFriends();}
    }catch(err){setStatus('Ошибка сети: '+(err?.message||err));}
  });
  db.auth.onAuthStateChange((_event,s)=>{session=s;updatePanels();if(s) setTimeout(()=>connected(),0);else {if(lobby)db.removeChannel(lobby);lobby=null;if(raidChannel)db.removeChannel(raidChannel);raidChannel=null;setStatus('НЕ ВОШЛИ В АККАУНТ');paintRaid('Войди в сеть, чтобы присоединиться к рейду.');}});
  const profileRoot=$('profBody');
  if(profileRoot) new MutationObserver(()=>{updatePanels();setStatus(session?'ПОДКЛЮЧЕНО · СЕССИЯ АКТИВНА':'НЕ ВОШЛИ В АККАУНТ',!!session);if(session){refreshBoard();loadFriends();}}).observe(profileRoot,{childList:true});
  connected();
})();
