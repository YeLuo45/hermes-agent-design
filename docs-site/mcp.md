# Model Context Protocol (MCP)

> Open standard for AI models to communicate with external tools and data sources.

## What is MCP?

The **Model Context Protocol (MCP)** is an open standard that enables AI models to interact with external tools, data repositories, and services in a standardized way. MCP provides a consistent interface for AI assistants to discover and invoke functionality beyond their base capabilities.

MCP bridges the gap between AI reasoning and real-world actions by defining a universal protocol for:

- **Tool invocation** — AI models can call external functions and receive structured results
- **Data retrieval** — Fetching information from external sources (filesystems, APIs, databases)
- **Stateful interactions** — Maintaining context across multiple operations
- **Server discovery** — Dynamic enumeration of available capabilities

## Key Features

### stdio-Based Transport

MCP uses **standard input/output (stdio)** as its transport layer, making it:

- Simple to implement and debug
- Language-agnostic (works with any programming language)
- Process-based for isolation and security
- Easy to pipe and chain in shell workflows

### JSON-RPC 2.0 Messages

All MCP communication follows the **JSON-RPC 2.0 specification**:

```json
// Request
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "filesystem_read",
    "arguments": { "path": "/example/file.txt" }
  }
}

// Response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": "Hello, World!"
  }
}

// Error
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32600,
    "message": "File not found"
  }
}
```

## Architecture

```
┌─────────────┐     stdio      ┌──────────────────┐
│   Client    │ ◄─────────────►│  MCP Server      │
│  (AI Model) │                │                  │
└─────────────┘                │  - Tool Registry │
                               │  - JSON-RPC 2.0  │
                               │  - Transport     │
                               └────────┬─────────┘
                                        │
                               ┌────────▼─────────┐
                               │  External APIs  │
                               │  Filesystem     │
                               │  Databases      │
                               │  Services       │
                               └─────────────────┘
```

### Components

| Component | Description |
|-----------|-------------|
| **Client** | Initiates connections, sends requests, handles responses |
| **Server** | Hosts tools, processes requests, returns results |
| **Transport** | stdio pipes for message delivery |
| **Tool Registry** | Central directory of available tools and their schemas |
| **JSON-RPC 2.0** | Message protocol for requests, responses, and notifications |

## Quick Start

### Installation

Install the MCP CLI client:

```bash
npm install -g @modelcontextprotocol/sdk
```

Or use Python:

```bash
pip install mcp
```

### Adding Servers

1. **Install server packages:**

```bash
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-fetch
```

2. **Verify installation:**

```bash
mcp list-servers
```

### Configuration

Create a `servers.json` file in your configuration directory:

```bash
# Typically at ~/.config/mcp/servers.json
```

## Server Configuration

### servers.json Format

```json
{
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/directory"],
      "env": {}
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-personal-access-token"
      }
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

### Configuration Options

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `command` | string | Yes | Executable to run (npx, python, node, etc.) |
| `args` | array | Yes | Command-line arguments |
| `env` | object | No | Environment variables |
| `scope` | string | No | `user` or `workspace` |

## Tool Schema Format

Tools exposed via MCP follow a standardized schema:

```json
{
  "name": "string",
  "description": "string",
  "inputSchema": {
    "type": "object",
    "properties": {
      "paramName": {
        "type": "string",
        "description": "Parameter description"
      }
    },
    "required": ["paramName"]
  }
}
```

### Example Tool Definition

```json
{
  "name": "database_query",
  "description": "Execute a read-only SQL query against the analytics database",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "SQL SELECT query to execute"
      },
      "limit": {
        "type": "number",
        "description": "Maximum rows to return",
        "default": 100
      }
    },
    "required": ["query"]
  }
}
```

## Demo Servers

### Filesystem Server

Provides file system operations with configurable access control.

```bash
npx -y @modelcontextprotocol/server-filesystem /home/user/projects
```

**Available Tools:**
- `read_file` — Read file contents
- `write_file` — Create or overwrite files
- `list_directory` — List directory contents
- `create_directory` — Create directories
- `move_file` — Move/rename files
- `delete_file` — Remove files

### GitHub Server

Integrates with GitHub API for repository operations.

```bash
npx -y @modelcontextprotocol/server-github
# Requires GITHUB_TOKEN environment variable
```

**Available Tools:**
- `get_repo` — Fetch repository metadata
- `list_issues` — List repository issues
- `create_issue` — Create a new issue
- `get_file_contents` — Read file from repository
- `push_file` — Create or update file

### Puppeteer Server

Browser automation for web scraping and testing.

```bash
npx -y @modelcontextprotocol/server-puppeteer
```

**Available Tools:**
- `navigate` — Open a URL in browser
- `screenshot` — Capture page screenshot
- `click` — Click element by selector
- `type` — Input text into fields
- `extract` — Extract data using selectors

### Fetch Server

HTTP requests for external API integration.

```bash
npx -y @modelcontextprotocol/server-fetch
```

**Available Tools:**
- `fetch` — Perform HTTP requests with full control over method, headers, and body

## Best Practices

### Security

1. **Principle of Least Privilege** — Only grant necessary permissions
   ```json
   {
     "command": "npx",
     "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/dir1", "/allowed/dir2"]
   }
   ```

2. **Token Management** — Use environment variables, never hardcode credentials
   ```bash
   export GITHUB_TOKEN=$(security get-generic-password -a "github")
   ```

3. **Sandboxing** — Run servers in isolated environments when possible

4. **Input Validation** — Always validate and sanitize tool inputs on the server side

### Error Handling

1. **Graceful Degradation** — Return informative errors when tools fail
   ```json
   {
     "error": {
       "code": -32603,
       "message": "Internal error: Database connection timeout"
     }
   }
   ```

2. **Timeout Configuration** — Set reasonable timeouts for long-running operations

3. **Retry Logic** — Implement exponential backoff for transient failures

### Performance

1. **Connection Pooling** — Reuse connections where applicable
2. **Batching** — Group multiple operations when possible
3. **Caching** — Cache frequent, immutable responses
4. **Streaming** — Use streaming responses for large data

### Development

1. **Schema-First Design** — Define tool schemas before implementation
2. **Versioning** — Version your MCP servers for compatibility
3. **Logging** — Log requests and errors for debugging
4. **Testing** — Write integration tests for tool implementations

---

*For more information, visit the [MCP Documentation](https://modelcontextprotocol.io).*
