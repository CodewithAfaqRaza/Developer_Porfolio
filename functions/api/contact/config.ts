import { handleConfig, type ContactEnv } from "../../../server/contact";

interface Context {
  request: Request;
  env: ContactEnv;
}

/** The public widget key is safe to expose; private bindings stay server-side. */
export function onRequest(context: Context): Promise<Response> {
  return handleConfig(context.request, { ...context.env, LOCAL_DEVELOPMENT: false });
}
