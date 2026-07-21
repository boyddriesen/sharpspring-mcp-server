import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SharpSpringClient } from "../client.js";

export function registerGenericTool(server: McpServer, client: SharpSpringClient) {
  server.tool(
    "sharpspring_call",
    "Call any documented SharpSpring API v1 method directly by name (e.g. getAccounts, createOpportunities, getActiveLists, addListMembers, createNotes, getTasks, getDealStages). Use this for any standard SharpSpring object or action not covered by a dedicated tool. Consult the official SharpSpring API method reference for exact method names and parameter shapes.",
    {
      method: z.string().describe('The exact SharpSpring API method name, e.g. "getAccounts".'),
      params: z
        .record(z.string(), z.unknown())
        .optional()
        .describe("The params object to send for this method."),
    },
    async ({ method, params }) => {
      const result = await client.call(method, params ?? {});
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
