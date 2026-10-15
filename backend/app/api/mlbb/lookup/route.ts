import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { auth } from '../../../../lib/auth';

export const runtime='nodejs';
export async function GET(request:NextRequest){
 const session=await auth.api.getSession({headers:request.headers});
 if(!session)return NextResponse.json({error:'Unauthorized'},{status:401});
 const playerId=request.nextUrl.searchParams.get('playerId')??'';
 const serverId=request.nextUrl.searchParams.get('serverId')??'';
 if(!/^\d{5,15}$/.test(playerId)||!/^\d{3,8}$/.test(serverId))return NextResponse.json({error:'Invalid player or server ID'},{status:400});
 const memberCode=process.env.DISTRIBUTION_HUB_MEMBER_CODE?.trim();
 const secret=process.env.DISTRIBUTION_HUB_SECRET?.trim();
 if(memberCode&&secret){
  try{
   const raw=JSON.stringify({member_code:memberCode,game:'mobile-legends',user_id:playerId,server_id:serverId});
   const signature=createHmac('sha256',secret).update(raw).digest('hex');
   const response=await fetch('https://distribution.liogames.com/api/v1/username-check',{
    method:'POST',headers:{'Content-Type':'application/json','x-liog-sign':signature},
    body:raw,signal:AbortSignal.timeout(8000),cache:'no-store'
   });
   if(!response.ok){const reason=response.status===401||response.status===403?'API access denied. Confirm the member code, secret, seller verification and IP allowlist.':response.status===429?'Nickname lookup rate limit reached. Try again later.':response.status>=500?'Distribution Hub service is temporarily unavailable.':'Distribution Hub rejected the lookup request. Check the provider API documentation and account permissions.';return NextResponse.json({nickname:null,available:false,message:reason,providerStatus:response.status});}
   const data=await response.json();
   const nickname=typeof data?.username==='string'?data.username.trim():typeof data?.nickname==='string'?data.nickname.trim():'';
   if((data?.ok||data?.success)&&data?.found!==false&&nickname&&nickname.length<=80)
    return NextResponse.json({nickname,available:true,ownershipVerified:false,provider:'distribution-hub'});
   return NextResponse.json({nickname:null,available:false,message:'Provider did not return a confirmed nickname. Check IDs and the documented response format.',providerStatus:response.status});
  }catch{return NextResponse.json({nickname:null,available:false,message:'Nickname service temporarily unavailable. Enter nickname manually.'});}
 }
 const key=process.env.MLBB_LOOKUP_API_KEY;
 if(!key)return NextResponse.json({nickname:null,message:'Automatic lookup is not configured. Enter the nickname manually.',available:false});
 try{
  const url=new URL('https://www.aluu.in/api/check/mlbb-check');
  url.searchParams.set('user_id',playerId);url.searchParams.set('server_id',serverId);
  const response=await fetch(url,{headers:{'x-api-key':key},signal:AbortSignal.timeout(7000),cache:'no-store'});
  if(!response.ok)return NextResponse.json({nickname:null,message:'Nickname lookup unavailable. Enter it manually.',available:false});
  const data=await response.json();
  const nickname=typeof data?.username==='string'?data.username.trim():'';
  if(!data?.success||!nickname||nickname.length>80)return NextResponse.json({nickname:null,message:'No nickname found. Check IDs or enter manually.',available:true});
  return NextResponse.json({nickname,available:true,ownershipVerified:false});
 }catch{return NextResponse.json({nickname:null,message:'Lookup service unavailable. Enter nickname manually.',available:false});}
}
