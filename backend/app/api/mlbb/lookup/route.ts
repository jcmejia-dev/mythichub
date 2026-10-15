import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
export async function GET(request:NextRequest){
 const session=await auth.api.getSession({headers:request.headers});
 if(!session)return NextResponse.json({error:'Unauthorized'},{status:401});
 const playerId=request.nextUrl.searchParams.get('playerId')??'';
 const serverId=request.nextUrl.searchParams.get('serverId')??'';
 if(!/^\d{5,15}$/.test(playerId)||!/^\d{3,8}$/.test(serverId))return NextResponse.json({error:'Invalid player or server ID'},{status:400});
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
 }catch{return NextResponse.json({nickname:null,message:'Lookup service unavailable. Enter nickname manually.',available:false})}
}
