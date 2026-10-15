import { auth } from '../../../../lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
export const { GET, POST } = toNextJsHandler(auth);
export function OPTIONS(){return new Response(null,{status:204});}
