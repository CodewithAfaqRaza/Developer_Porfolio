import { secureResponse } from "../server/site-security";
export async function onRequest(context: { request: Request; next: () => Promise<Response> }): Promise<Response> {
  const path = new URL(context.request.url).pathname;
  if (path.startsWith("/api/") && !["/api/contact", "/api/contact/config", "/api/admin/session", "/api/admin/login", "/api/admin/logout", "/api/admin/inquiries"].includes(path)) {
    return secureResponse(new Response(JSON.stringify({ok:false,error:"Not found."}), {status:404,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}}));
  }
  return secureResponse(await context.next());
}
