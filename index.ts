import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 try{
  const url=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const auth=req.headers.get('Authorization')||'';const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:authErr}=await userClient.auth.getUser();if(authErr||!user)return new Response(JSON.stringify({error:'authentication_required'}),{status:401,headers:{...cors,'Content-Type':'application/json'}});
  const admin=createClient(url,service);const body=await req.json();let targets:string[]=[];
  if(body.type==='friend_request'){
   const target=String(body.target_user_id||'');if(!target)return new Response(JSON.stringify({error:'target_required'}),{status:400,headers:{...cors,'Content-Type':'application/json'}});
   const {data:reqRow,error}=await admin.from('friend_requests').select('id').eq('sender_id',user.id).eq('receiver_id',target).eq('status','pending').maybeSingle();
   if(error||!reqRow)return new Response(JSON.stringify({error:'friend_request_not_found'}),{status:403,headers:{...cors,'Content-Type':'application/json'}});targets=[target];
  }else if(body.type==='raid_boss_defeated'){
   const {data:state}=await admin.from('coop_raid_state').select('phase,defeated_at').eq('id','global').maybeSingle();
   if(!state?.defeated_at)return new Response(JSON.stringify({error:'raid_not_defeated'}),{status:409,headers:{...cors,'Content-Type':'application/json'}});
   const {data:members}=await admin.from('coop_raid_contributions').select('user_id').eq('phase',state.phase).gt('damage',0);targets=[...new Set((members||[]).map(x=>x.user_id).filter(x=>x!==user.id))];
  }else return new Response(JSON.stringify({error:'unsupported_event'}),{status:400,headers:{...cors,'Content-Type':'application/json'}});
  const pub=Deno.env.get('VAPID_PUBLIC_KEY'),priv=Deno.env.get('VAPID_PRIVATE_KEY'),subject=Deno.env.get('VAPID_SUBJECT')||'mailto:admin@pixelorbit.invalid';
  if(!pub||!priv)return new Response(JSON.stringify({error:'vapid_secrets_missing',targets:targets.length}),{status:503,headers:{...cors,'Content-Type':'application/json'}});
  webpush.setVapidDetails(subject,pub,priv);if(!targets.length)return new Response(JSON.stringify({sent:0}),{headers:{...cors,'Content-Type':'application/json'}});
  const {data:subs}=await admin.from('push_subscriptions').select('id,user_id,subscription').in('user_id',targets);let sent=0,failed=0;
  for(const sub of subs||[]){try{await webpush.sendNotification(sub.subscription,JSON.stringify({title:String(body.title||'PIXEL ORBIT'),body:String(body.body||'Новое событие в секторе.'),url:'./',tag:body.type||'pixel-orbit'}));sent++;}catch(e){failed++;if([404,410].includes(e.statusCode))await admin.from('push_subscriptions').delete().eq('id',sub.id);}}
  return new Response(JSON.stringify({sent,failed}),{headers:{...cors,'Content-Type':'application/json'}});
 }catch(e){return new Response(JSON.stringify({error:String(e?.message||e)}),{status:500,headers:{...cors,'Content-Type':'application/json'}})}
});
