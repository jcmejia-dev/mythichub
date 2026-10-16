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
 const scopedKeyId=process.env.DISTRIBUTION_HUB_USERNAME_KEY_ID?.trim();
 const scopedSecret=process.env.DISTRIBUTION_HUB_USERNAME_KEY_SECRET?.trim();
 const secret=scopedKeyId?scopedSecret:process.env.DISTRIBUTION_HUB_SECRET?.trim();
 // Reject template credentials locally rather than sending them to Distribution Hub.
 if(memberCode?.toLowerCase().includes('liog-member-code')){
  return NextResponse.json({nickname:null,available:false,providerCode:'placeholder_member',authMode:scopedKeyId?'scoped':'account',message:'The running backend is loading the example Member Code rather than your active Distribution Hub credentials. Check backend environment-file precedence and restart.'},{status:503});
 }
 if(scopedKeyId&&!scopedSecret)return NextResponse.json({nickname:null,available:false,message:'Scoped username key is configured without its Secret. Set DISTRIBUTION_HUB_USERNAME_KEY_SECRET on the backend.'});
 if(memberCode&&secret){
  try{
   const raw=JSON.stringify({member_code:memberCode,game:'mobile-legends',user_id:playerId,server_id:serverId});
   const signature=createHmac('sha256',secret).update(raw).digest('hex');
   const response=await fetch('https://distribution.liogames.com/api/v1/username-check',{
    method:'POST',headers:{'Content-Type':'application/json','x-liog-sign':signature,...(scopedKeyId?{'X-LIOG-KEY-ID':scopedKeyId}:{})},
    body:raw,signal:AbortSignal.timeout(8000),cache:'no-store'
   });
   if(!response.ok){
    // Do not forward raw provider responses: they may contain credentials or sensitive data.
    const providerText=await response.text();
    let providerCode:string|undefined;
    try {
      const error=JSON.parse(providerText);
      const candidate=error?.code??error?.error_code??(typeof error?.error==='string'?error.error:undefined);
      if(typeof candidate==='string' && /^[a-zA-Z0-9_-]{1,64}$/.test(candidate))providerCode=candidate;
    }catch{}
    const reason=providerCode?.toLowerCase()==='invalid_member'?'Distribution Hub does not recognize the configured Member ID. Run the backend API diagnostic to distinguish account authentication from nickname access.':providerCode?.toLowerCase()==='invalid_signature'?'Distribution Hub rejected the HMAC signature. Verify the matching secret and exact request body.':response.status===401?'Distribution Hub rejected the API signature or credentials (401).':response.status===403?'Distribution Hub denied API permission (403).':response.status===429?'Nickname lookup rate limit reached. Try again later.':response.status>=500?'Distribution Hub service is temporarily unavailable.':'Distribution Hub rejected the lookup request.';
    console.error('[mlbb-lookup] Provider rejected request', {status:response.status,providerCode:providerCode??'not-provided',authMode:scopedKeyId?'scoped':'account',hasMemberCode:Boolean(memberCode)});
    return NextResponse.json({nickname:null,available:false,message:reason,providerStatus:response.status,providerCode:providerCode??null,authMode:scopedKeyId?'scoped':'account'},{status:response.status});
   }
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
