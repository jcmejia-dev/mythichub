import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import { db } from '../../../lib/db';
import { playerTracker } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export function OPTIONS() {
  return new Response(null, { status: 204 });
}

async function currentSession(request: NextRequest) {
  return auth.api.getSession({ headers: request.headers });
}

export async function GET(request: NextRequest) {
  const session = await currentSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const rows = await db.select().from(playerTracker).where(eq(playerTracker.userId, session.user.id)).limit(1);
    return NextResponse.json({ tracker: rows[0]?.data ?? null, updatedAt: rows[0]?.updatedAt ?? null });
  } catch {
    // Existing installations may not have run the additive migration yet.
    return NextResponse.json({ error: 'Cloud tracker unavailable. Run the additive player_tracker migration.' }, { status: 503 });
  }
}

function validateTracker(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const data = input as Record<string, unknown>;
  if (!Array.isArray(data.skins) || data.skins.length > 250 ||
      !data.skins.every((s) => typeof s === 'string' && s.length <= 100)) return null;
  if (new Set(data.skins.map((s) => String(s).toLowerCase())).size !== data.skins.length) return null;
  const numeric = ['ownedDiamonds', 'targetDiamonds', 'magicPoints'] as const;
  for (const key of numeric) {
    if (typeof data[key] !== 'string' || !/^\d{1,9}$/.test(data[key] as string)) return null;
  }
  if (Number(data.magicPoints) > 100) return null;
  if (typeof data.notes !== 'string' || data.notes.length > 500) return null;
  return {
    skins: data.skins.map((s) => s.trim()),
    ownedDiamonds: data.ownedDiamonds as string,
    targetDiamonds: data.targetDiamonds as string,
    magicPoints: data.magicPoints as string,
    notes: data.notes as string,
  };
}

export async function PUT(request: NextRequest) {
  const session = await currentSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const tracker = validateTracker(body);
  if (!tracker) return NextResponse.json({ error: 'Invalid tracker values' }, { status: 400 });
  try {
    await db.insert(playerTracker)
      .values({ userId: session.user.id, data: tracker })
      .onConflictDoUpdate({ target: playerTracker.userId, set: { data: tracker, updatedAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Cloud sync temporarily unavailable' }, { status: 503 });
  }
}
