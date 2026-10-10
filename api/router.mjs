import { handleVercelRequest } from '../backend/vercel-handler.mjs';

export const config = { api: { bodyParser: { sizeLimit: '7mb' } } };

export default async function handler(request, response) {
  const url = new URL(request.url ?? '/', `https://${request.headers.host ?? 'localhost'}`);
  const apiPath = url.searchParams.get('path');
  if (apiPath) {
    url.pathname = `/api/${apiPath.replace(/^\/+/, '')}`;
    url.searchParams.delete('path');
    request.url = `${url.pathname}${url.search}`;
  }
  await handleVercelRequest(request, response);
}