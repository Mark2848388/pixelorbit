/* Pixel Orbit v4.5 — Web Push subscription UI. Requires HTTPS + VAPID config. */
(()=>{'use strict';const $=id=>document.getElementById(id);const decode=s=>{const p='='.repeat((4-s.length%4)%4),b=(s+p).replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from(atob(b),c=>c.charCodeAt(0))};
 async function enable(){if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)){alert('Этот браузер не поддерживает Web Push. Установи Pixel Orbit как PWA или APK.');return}
 const key=window.PO_PUSH_VAPID_PUBLIC_KEY;if(!key||key.includes('PASTE_')){alert('Сначала настрой VAPID_PUBLIC_KEY по инструкции PUSH_SETUP_RU.txt и опубликуй обновление.');return}
 const permission=await Notification.requestPermission();if(permission!=='granted'){alert('Разрешение на уведомления не выдано. Разреши уведомления для Pixel Orbit в настройках Android.');return}
 try{const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decode(key)});
 const client=window.PO_SUPABASE_CLIENT;if(!client){alert('Сначала войди в Pixel Orbit Online.');return}const {data:{user}}=await client.auth.getUser();if(!user){alert('Для синхронизации уведомлений войди в аккаунт.');return}
 const {error}=await client.from('push_subscriptions').upsert({user_id:user.id,endpoint:sub.endpoint,subscription:sub.toJSON(),updated_at:new Date().toISOString()},{onConflict:'user_id,endpoint'});if(error)throw error;alert('Уведомления включены! Теперь Pixel Orbit сможет присылать важные события.');
 }catch(e){console.error(e);alert('Не удалось включить уведомления: '+(e.message||e));}}
 window.POPush={enable};document.addEventListener('click',e=>{if(e.target.closest('#enablePush'))enable()});})();
