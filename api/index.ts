import { handleVercel } from '../server/vercel.ts';
export default {
  fetch(request: Request): Promise<Response> { return handleVercel(request, process.env); },
};
