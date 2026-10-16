#!/usr/bin/env node
'use strict';

// Read-only authenticated API diagnosis. No orders; never prints signing secrets.
const { createHmac } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { loadEnvConfig } = require('@next/env');

// Mirror Next.js development mode. The default (production) mode can load
// a different .env.* file than "npm run dev" and yield misleading results.
const inheritedMember = process.env.DISTRIBUTION_HUB_MEMBER_CODE?.trim();
loadEnvConfig(process.cwd(), true);

function auditMemberSources() {
  console.log('Environment audit (Member ID only, last 4 chars):');
  console.log('  inherited process variable: ' + (inheritedMember ? 'SET, ends in ' + inheritedMember.slice(-4) : 'absent'));
  let localMember;
  for (const filename of ['.env.development.local', '.env.local', '.env.development', '.env']) {
    const filepath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filepath)) continue;
    const raw = fs.readFileSync(filepath, 'utf8');
    const parsed = dotenv.parse(raw);
    const value = parsed.DISTRIBUTION_HUB_MEMBER_CODE?.trim();
    const activeLines = raw.split(/\r?\n/).flatMap((line, index) =>
      /^\s*(?:export\s+)?DISTRIBUTION_HUB_MEMBER_CODE\s*=/.test(line) ? [index + 1] : []);
    if (filename === '.env.local') localMember = value;
    console.log('  ' + filename + ': ' +
      (value ? 'ends in ' + value.slice(-4) : 'no Member ID') +
      ', active assignments=' + activeLines.length +
      (activeLines.length > 1 ? ' [duplicate lines ' + activeLines.join(',') + ']' : '') +
      (value?.toLowerCase().includes('liog-member-code') ? ' [PLACEHOLDER]' : ''));
  }
  const effective = process.env.DISTRIBUTION_HUB_MEMBER_CODE?.trim();
  console.log('  effective value: ' + (effective ? 'ends in ' + effective.slice(-4) : 'absent'));
  if (localMember && effective && localMember !== effective) {
    console.log('  WARNING: effective value differs from .env.local; check inherited vars and higher-priority .env.development.local.');
  }
}

const member = process.env.DISTRIBUTION_HUB_MEMBER_CODE?.trim();
const keyId = process.env.DISTRIBUTION_HUB_USERNAME_KEY_ID?.trim();
const secret = keyId
  ? process.env.DISTRIBUTION_HUB_USERNAME_KEY_SECRET?.trim()
  : process.env.DISTRIBUTION_HUB_SECRET?.trim();
const mode = keyId ? 'scoped' : 'account';
const playerId = process.argv[2];
const serverId = process.argv[3];

function safeCode(value) {
  const code = value?.code ?? value?.error_code ?? (typeof value?.error === 'string' ? value.error : null);
  return typeof code === 'string' && /^[\w-]{1,64}$/.test(code) ? code : 'not-provided';
}

async function probe(endpoint, payload) {
  const body = JSON.stringify(payload);
  const signature = createHmac('sha256', secret).update(body).digest('hex');
  const headers = {
    'Content-Type': 'application/json',
    'x-liog-sign': signature,
    ...(keyId ? { 'X-LIOG-KEY-ID': keyId } : {}),
  };
  try {
    const res = await fetch('https://distribution.liogames.com/api/v1/' + endpoint, {
      method: 'POST', headers, body, redirect: 'error', cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });
    const responseText = await res.text();
    let data = null;
    try { data = JSON.parse(responseText); } catch { /* never log raw responses */ }
    const result = { status: res.status, code: safeCode(data), ok: res.ok && data?.ok !== false };
    console.log(endpoint + ': HTTP ' + result.status + ', code=' + result.code + ', success=' + result.ok);
    if (result.ok && endpoint === 'username-check') {
      const nickname = data?.username ?? data?.nickname ?? data?.data?.username;
      if (typeof nickname === 'string') console.log('Nickname: ' + nickname.trim().slice(0, 80));
    }
    return result;
  } catch (e) {
    console.log(endpoint + ': network error (' + (e?.name || 'unknown') + ')');
    return { status: null, code: 'network_error', ok: false };
  }
}

async function main() {
  console.log('=== Distribution Hub diagnosis (read-only) ===');
  auditMemberSources();
  console.log('Auth mode: ' + mode);
  console.log('Member ID present: ' + Boolean(member) + (member ? ', ends in ' + member.slice(-4) : ''));
  console.log('Signing secret present: ' + Boolean(secret));
  if (!member || !secret) {
    console.log('STOP: missing Member ID or corresponding signing Secret in backend env.');
    process.exitCode = 1;
    return;
  }
  if (member === secret || member.toLowerCase().includes('liog-member-code')) {
    console.log('STOP: Member Code is a placeholder or incorrectly reused as the Secret.');
    process.exitCode = 1;
    return;
  }

  const balance = await probe('balance', { member_code: member });
  let lookup = null;
  if (playerId || serverId) {
    if (!/^\d{5,15}$/.test(playerId ?? '') || !/^\d{3,8}$/.test(serverId ?? '')) {
      console.log('Username check skipped: enter numeric player and zone IDs.');
    } else {
      lookup = await probe('username-check', {
        member_code: member,
        game: 'mobile-legends',
        user_id: playerId,
        server_id: serverId,
      });
    }
  } else {
    console.log('Username check skipped: no player and zone IDs provided.');
  }

  console.log('=== Interpretation ===');
  if (balance.status === 401 && balance.code.toLowerCase() === 'invalid_member') {
    console.log('Distribution Hub rejects the Member ID on BALANCE too: this is NOT a nickname-lookup implementation issue.');
    console.log('If the current Member ID and primary Secret match the dashboard, ask Distribution Hub support to investigate API member recognition.');
  } else if (balance.ok && lookup && !lookup.ok) {
    console.log('Account authentication works on BALANCE; the failure is specific to username-check/permissions/provider.');
  } else if (balance.ok) {
    console.log('Balance authenticated. If MythicHub fails, ensure its backend process uses these same updated env values.');
  } else if (balance.status === 401) {
    console.log('Provider rejected account authentication. Check matching primary credentials, or contact provider support.');
  } else {
    console.log('Inspect HTTP statuses above; network and permission errors are not necessarily credential errors.');
  }
  console.log('Safe to share this output. Never share keys, env files, signed headers, or raw provider responses.');
}
main().catch(() => {
  console.error('Unexpected diagnostic error. No credential values were printed.');
  process.exitCode = 1;
});
