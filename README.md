# sharpspring-mcp-server

An open-source [MCP](https://modelcontextprotocol.io) (Model Context Protocol) server for the **SharpSpring API**, now branded **Constant Contact Lead Gen & CRM**. It lets any MCP-compatible AI client (Claude Desktop, Claude Code, Cursor, etc.) read and write Leads, discover custom fields, and call any other documented SharpSpring API method.

This is an independent, community project. It is not affiliated with, endorsed by, or supported by SharpSpring or Constant Contact.

## Design goals

- **No account-specific configuration baked in.** Every credential comes from environment variables at runtime. No hardcoded custom field names, account IDs, or other values belonging to any one SharpSpring account.
- **Generic by default.** Tools map to SharpSpring's standard, documented API methods and object shapes only — nothing bespoke.
- **Custom fields stay dynamic.** Since every SharpSpring account has its own custom fields, this server never assumes field names. Use `sharpspring_get_fields` to discover a given account's fields (system + custom) at runtime, then reference them by `systemName`.

## Setup

```bash
npm install
npm run build
```

Copy `.env.example` to `.env` and fill in your own credentials (generate them in SharpSpring under API Keys):

```bash
cp .env.example .env
```

```
SHARPSPRING_ACCOUNT_ID=your-account-id
SHARPSPRING_SECRET_KEY=your-secret-key
# Optional: v1 (timezone follows the account's Company Profile) or v1.2 (UTC, default)
SHARPSPRING_API_VERSION=v1.2
```

### Using with an MCP client

Add to your MCP client config (e.g. Claude Desktop's `claude_desktop_config.json`), pointing at the built server and passing credentials as environment variables — never commit these:

```json
{
  "mcpServers": {
    "sharpspring": {
      "command": "node",
      "args": ["/absolute/path/to/sharpspring-mcp-server/build/index.js"],
      "env": {
        "SHARPSPRING_ACCOUNT_ID": "your-account-id",
        "SHARPSPRING_SECRET_KEY": "your-secret-key"
      }
    }
  }
}
```

## Tools

| Tool | SharpSpring method | Description |
|---|---|---|
| `sharpspring_get_fields` | `getFields` | Discover lead/account/opportunity/campaign fields, including custom fields and their `systemName`. |
| `sharpspring_get_leads` | `getLeads` | List/filter leads (by id, emailAddress), up to 500 per call. |
| `sharpspring_get_lead` | `getLead` | Fetch a single lead by id. |
| `sharpspring_create_leads` | `createLeads` | Create up to 500 leads. |
| `sharpspring_update_leads` | `updateLeads` / `updateLeadsV2` | Update up to 500 leads by id. |
| `sharpspring_delete_leads` | `deleteLeads` | Delete leads by id. |
| `sharpspring_call` | any | Generic escape hatch: call any documented SharpSpring method (Accounts, Campaigns, Opportunities, Lists, Notes, Tasks, DealStages, Products, Emails, ...) by name with a raw `params` object. |

Only Leads have dedicated, ergonomic tools today. Every other standard SharpSpring object (Accounts, Campaigns, Opportunities, Lists/ListMembers, Notes, Tasks, ...) is already reachable through `sharpspring_call` and is a natural next PR — see [Contributing](#contributing).

## API notes

- Endpoint: `https://api.sharpspring.com/pubapi/{version}/`, JSON-RPC-style POST requests, auth via `accountID`/`secretKey` query params.
- Object-level errors (e.g. "Entry already exists") come back inside a successful response, nested under `result.creates[].error` / `result.updates[].error` / `result.deletes[].error` — always check these, not just the top-level `error` field.
- Rate limits: 50,000 requests/day, 10 requests/second, 500 objects per query. This server does not implement client-side throttling or retries — callers are responsible for respecting these limits.

## Contributing

Pull requests are welcome, especially dedicated tools for other standard objects (Accounts, Campaigns, Opportunities, Lists, Notes, Tasks). Keep additions generic and account-agnostic: no hardcoded field names, account IDs, or other environment-specific values.

## License

MIT — see [LICENSE](LICENSE).
