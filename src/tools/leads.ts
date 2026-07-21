import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SharpSpringClient } from "../client.js";

const leadObject = z
  .record(z.string(), z.unknown())
  .describe(
    "A lead object keyed by SharpSpring field systemName (e.g. firstName, lastName, emailAddress, and any custom field systemName returned by sharpspring_get_fields)."
  );

export function registerLeadTools(server: McpServer, client: SharpSpringClient) {
  server.tool(
    "sharpspring_get_leads",
    "Retrieve leads matching a WHERE clause, or all leads if the clause is empty. Returns at most 500 results per call; use offset to page through more.",
    {
      where: z
        .object({
          id: z.union([z.number(), z.array(z.number())]).optional(),
          emailAddress: z.union([z.string(), z.array(z.string())]).optional(),
        })
        .optional(),
      limit: z.number().int().min(1).max(500).optional(),
      offset: z.number().int().min(0).optional(),
      fields: z
        .array(z.string())
        .optional()
        .describe("Restrict the response to these field systemNames."),
    },
    async ({ where, limit, offset, fields }) => {
      const result = await client.call("getLeads", { where: where ?? {}, limit, offset, fields });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "sharpspring_get_lead",
    "Retrieve a single lead by its numeric ID.",
    { id: z.number().int() },
    async ({ id }) => {
      const result = await client.call("getLead", { id });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "sharpspring_create_leads",
    "Create up to 500 leads in one call. Each lead must at minimum include emailAddress. Call sharpspring_get_fields first to discover valid custom field systemNames for this account.",
    { leads: z.array(leadObject).min(1).max(500) },
    async ({ leads }) => {
      const result = await client.call("createLeads", { objects: leads });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "sharpspring_update_leads",
    "Update up to 500 existing leads in one call. Each lead object must include an `id`. Set strict=true to use updateLeadsV2, which returns an error instead of silently no-op'ing when the id doesn't match an existing lead.",
    {
      leads: z.array(leadObject).min(1).max(500),
      strict: z.boolean().optional(),
    },
    async ({ leads, strict }) => {
      const method = strict ? "updateLeadsV2" : "updateLeads";
      const result = await client.call(method, { objects: leads });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "sharpspring_delete_leads",
    "Delete leads by ID.",
    { ids: z.array(z.number().int()).min(1) },
    async ({ ids }) => {
      const result = await client.call("deleteLeads", { objects: ids.map((id) => ({ id })) });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
