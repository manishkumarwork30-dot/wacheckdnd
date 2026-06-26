import app from "./app";

export default async function handler(request: Request): Promise<Response> {
  return app.handle(request);
}


