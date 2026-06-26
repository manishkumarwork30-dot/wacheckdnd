import app from "./app";
import { initializeMongo } from "./lib/mongodb";

export default async function handler(request: Request): Promise<Response> {
  await initializeMongo();
  return app.handle(request);
}
