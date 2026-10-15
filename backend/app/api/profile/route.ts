import { NextRequest,NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import { db } from '../../../lib/db';
import { playerProfile } from '../../../lib/schema';
import { eq } from 'drizzle-orm';
async function sessionFor(request:NextRequest){return auth.api.getSession({headers:request.headers});}
export function OPTIONS(){return new Response(null,{status:204});}
export async function GET(request:NextRequest){const session=await sessionFor(request);if(!session)return NextResponse.json({error:'Unauthorized'},{status:401});const rows=await db.select().from(playerProfile).where(eq(playerProfile.userId,session.user.id)).limit(1);return NextResponse.json({profile:rows[0]??null});}
export async function PUT(request:NextRequest){const session=await sessionFor(request);if(!session)return NextResponse.json({error:'Unauthorized'},{status:401});let body:unknown;try{body=await request.json()}catch{return NextResponse.json({error:'Invalid JSON'},{status:400})}if(!body||typeof body!=='object')return NextResponse.json({error:'Invalid input'},{status:400});const data=body as Record<string,unknown>;const playerId=String(data.playerId??'').trim(),serverId=String(data.serverId??'').trim(),nickname=String(data.nickname??'').trim();if(!/^\d{5,15}$/.test(playerId)||!/^\d{3,8}$/.test(serverId)||nickname.length>40)return NextResponse.json({error:'Invalid player identifiers'},{status:400});await db.insert(playerProfile).values({userId:session.user.id,playerId,serverId,nickname:nickname||null}).onConflictDoUpdate({target:playerProfile.userId,set:{playerId,serverId,nickname:nickname||null,updatedAt:new Date()}});return NextResponse.json({ok:true,verified:false});}
