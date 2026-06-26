import app from "../src/app";

export default async function handler(req: any, res: any) {
  // Vercel provides Request-like object; we can forward to Elysia
  const response = await app.handle(req as Request);
  // Vercel expects a Response object to be returned
  return response;
}
