import { createServer } from "node:http";
import { handleApiRequest } from "./apiHandler";

const port = Number(process.env.API_PORT ?? 3002);

createServer(handleApiRequest).listen(port, "127.0.0.1", () => {
  console.log(`Dictionary API proxy listening on http://127.0.0.1:${port}`);
});
