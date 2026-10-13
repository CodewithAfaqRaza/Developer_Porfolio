import { handleAdmin, type AdminEnv } from '../../../server/admin';
export function onRequest(context: { request: Request; env: AdminEnv }): Promise<Response> {
  return handleAdmin(context.request, { ...context.env, LOCAL_DEVELOPMENT: false });
}
