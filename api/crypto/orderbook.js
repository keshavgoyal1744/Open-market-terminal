import { handleRequest } from "../../server.mjs";

export default async function handler(request, response) {
  return handleRequest(request, response, { serveStatic: false });
}
