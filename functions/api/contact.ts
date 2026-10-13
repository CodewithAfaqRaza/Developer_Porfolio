import { handleContact, type ContactEnv } from "../../server/contact";

interface Context {
  request: Request;
  env: ContactEnv;
}

/** Pages routing: /api/contact. Every method goes through the strict handler. */
export function onRequest(context: Context): Promise<Response> {
  return handleContact(context.request, { ...context.env, LOCAL_DEVELOPMENT: false });
}
