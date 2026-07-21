#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SharpSpringClient } from "./client.js";
import { registerFieldTools } from "./tools/fields.js";
import { registerLeadTools } from "./tools/leads.js";
import { registerGenericTool } from "./tools/generic.js";

async function main() {
  const client = new SharpSpringClient();

  const server = new McpServer({
    name: "sharpspring-mcp",
    version: "0.1.0",
  });

  registerFieldTools(server, client);
  registerLeadTools(server, client);
  registerGenericTool(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error starting sharpspring-mcp:", error);
  process.exit(1);
});
