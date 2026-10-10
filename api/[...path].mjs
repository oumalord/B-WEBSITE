import { ensureSchema, handleApi } from '../backend/neon.mjs';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(request, response) {
  try {
    await ensureSchema();
    const url = new URL(request.url ?? '/', `https://${request.headers.host ?? 'localhost'}`);
    await handleApi(request, response, url);
  } catch (error) {
    const status = Number(error.status) || 500;
    if (status >= 500) console.error(error);
    if (!response.headersSent) {
      response.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      response.end(JSON.stringify({ message: error instanceof Error ? error.message : 'Unexpected server error' }));
    } else {
      response.destroy();
    }
  }
}