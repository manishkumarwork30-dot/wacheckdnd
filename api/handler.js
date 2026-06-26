import app from "../src/app.js";

export default async function handler(request) {
  // Vercel passes a Request‑like object; forward it directly to Elysia
  const response = await app.handle(request);
  return response;
}
