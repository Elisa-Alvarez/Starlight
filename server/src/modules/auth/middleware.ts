import { supabaseAdmin } from '../../lib/supabase.js';

export async function requireAuth(
  request: any,
  reply: any,
) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' },
    });
  }

  const token = authHeader.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return reply.status(401).send({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    });
  }

  request.user = { id: data.user.id, email: data.user.email };
}

export async function optionalAuth(
  request: any,
  _reply: any,
) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    request.user = null;
    return;
  }

  const token = authHeader.slice(7);
  const { data } = await supabaseAdmin.auth.getUser(token);

  request.user = data.user ? { id: data.user.id, email: data.user.email } : null;
}
