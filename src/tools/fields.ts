import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SharpSpringClient } from "../client.js";

export function registerFieldTools(server: McpServer, client: SharpSpringClient) {
  server.tool(
    "sharpspring_get_fields",
    "Discover lead, account, opportunity, and campaign fields available in this SharpSpring account, including custom fields. Each result's `systemName` is the key to use when creating/updating that field's object type; `relationship` tells you which object type (lead, account, opportunity, campaign) the field belongs to. Always call this before creating/updating custom fields, since custom field systemNames differ per SharpSpring account.",
    {
      where: z
        .object({
          id: z.number().optional(),
          label: z.string().optional(),
          systemName: z.string().optional(),
          isCustom: z.boolean().optional(),
        })
        .optional(),
      limit: z.number().int().min(1).max(500).optional(),
      offset: z.number().int().min(0).optional(),
    },
    async ({ where, limit, offset }) => {
      const result = await client.call("getFields", { where: where ?? {}, limit, offset });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
