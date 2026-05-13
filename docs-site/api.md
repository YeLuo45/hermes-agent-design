# HTTP API Reference

Dark theme optimized for AstrBot API documentation.

## Authentication

All API endpoints require authentication using a Bearer token in the `Authorization` header.

```http
Authorization: Bearer <your_token>
```

| Header | Value | Description |
|--------|-------|-------------|
| `Authorization` | `Bearer <token>` | Bearer token for API authentication |
| `Content-Type` | `application/json` | Required for POST/PUT requests |

---

## Core Endpoints

### Endpoint Overview

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/chat` | Send chat message with SSE streaming support |
| `GET` | `/api/v1/chat/sessions` | List all chat sessions |
| `POST` | `/api/v1/chat/new_session` | Create a new chat session |
| `POST` | `/api/v1/chat/batch_delete_sessions` | Delete multiple sessions |
| `GET` | `/api/v1/configs` | Get provider configurations |
| `POST` | `/api/v1/file` | Upload a file |

---

### POST `/api/v1/chat`

Send a chat message and receive a response. Supports Server-Sent Events (SSE) for streaming responses.

**Request Body:**

```json
{
  "message": "Hello, how are you?",
  "session_id": "optional-session-id",
  "stream": true,
  "role": "user"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | The message content |
| `session_id` | string | No | Existing session ID to continue |
| `stream` | boolean | No | Enable SSE streaming (default: true) |
| `role` | string | No | Message role (default: "user") |

**SSE Response:**

```bash
curl -X POST http://localhost:6185/api/v1/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "stream": true}'
```

**Non-Streaming Response:**

```json
{
  "session_id": "sess_abc123",
  "message": "Hello! How can I help you?",
  "timestamp": "2026-05-13T10:30:00Z"
}
```

---

### GET `/api/v1/chat/sessions`

Retrieve all chat sessions for the authenticated user.

**Response:**

```json
{
  "sessions": [
    {
      "id": "sess_abc123",
      "title": "Conversation about Python",
      "created_at": "2026-05-13T09:00:00Z",
      "updated_at": "2026-05-13T10:30:00Z",
      "message_count": 15
    }
  ],
  "total": 1
}
```

---

### POST `/api/v1/chat/new_session`

Create a new chat session.

**Request Body:**

```json
{
  "title": "New Conversation",
  "metadata": {}
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | No | Session title |
| `metadata` | object | No | Additional metadata |

**Response:**

```json
{
  "id": "sess_new123",
  "title": "New Conversation",
  "created_at": "2026-05-13T10:27:00Z"
}
```

---

### POST `/api/v1/chat/batch_delete_sessions`

Delete multiple chat sessions in one request.

**Request Body:**

```json
{
  "session_ids": ["sess_abc123", "sess_def456"]
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_ids` | array[string] | Yes | Array of session IDs to delete |

**Response:**

```json
{
  "deleted": 2,
  "failed": []
}
```

---

### GET `/api/v1/configs`

Retrieve current provider configurations.

**Response:**

```json
{
  "providers": [
    {
      "name": "openai",
      "enabled": true,
      "models": ["gpt-4", "gpt-3.5-turbo"],
      "api_base": "https://api.openai.com/v1"
    }
  ],
  "active_provider": "openai"
}
```

---

### POST `/api/v1/file`

Upload a file for processing.

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | The file to upload |
| `purpose` | string | No | Intended use (e.g., "assistants", "retrieval") |

**Response:**

```json
{
  "file_id": "file_xyz789",
  "filename": "document.pdf",
  "size": 102400,
  "purpose": "assistants"
}
```

---

## Instant Messaging

### POST `/api/v1/im/message`

Send an instant message.

**Request Body:**

```json
{
  "receiver_id": "user_123",
  "content": "Hello!",
  "msg_type": "text",
  "client_msg_id": "optional-client-id"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `receiver_id` | string | Yes | Recipient user ID |
| `content` | string | Yes | Message content |
| `msg_type` | string | No | Message type (text, image, etc.) |
| `client_msg_id` | string | No | Client-generated message ID |

**Response:**

```json
{
  "msg_id": "msg_abc123",
  "status": "sent",
  "timestamp": "2026-05-13T10:30:00Z"
}
```

---

### GET `/api/v1/im/bots`

List available bots for IM.

**Response:**

```json
{
  "bots": [
    {
      "bot_id": "bot_123",
      "name": "Assistant Bot",
      "avatar": "https://example.com/avatar.png",
      "description": "AI assistant bot"
    }
  ]
}
```

---

## Plugin APIs

### Endpoint Overview

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/plugin/get` | Get installed plugin list |
| `GET` | `/plugin/detail` | Get plugin details |
| `GET` | `/plugin/market_list` | List available plugins from market |
| `POST` | `/plugin/install` | Install a plugin |
| `POST` | `/plugin/uninstall` | Uninstall a plugin |
| `POST` | `/plugin/update` | Update a plugin |

---

### GET `/plugin/get`

Retrieve all installed plugins.

**Response:**

```json
{
  "plugins": [
    {
      "id": "plugin_abc",
      "name": "Web Search",
      "version": "1.2.0",
      "enabled": true,
      "author": "AstrBot Team"
    }
  ]
}
```

---

### GET `/plugin/detail`

Get detailed information about a specific plugin.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `plugin_id` | string | Yes | The plugin ID |

**Response:**

```json
{
  "id": "plugin_abc",
  "name": "Web Search",
  "version": "1.2.0",
  "description": "Search the web from within conversations",
  "author": "AstrBot Team",
  "repository": "https://github.com/astrbot/plugin-web-search",
  "dependencies": ["requests"],
  "config_schema": {
    "api_key": {"type": "string", "required": true}
  }
}
```

---

### GET `/plugin/market_list`

Browse available plugins in the marketplace.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 20) |
| `category` | string | No | Filter by category |

**Response:**

```json
{
  "plugins": [
    {
      "id": "market_plugin_1",
      "name": "Image Generation",
      "version": "2.0.0",
      "rating": 4.8,
      "downloads": 15000,
      "category": "media"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

### POST `/plugin/install`

Install a plugin from marketplace or URL.

**Request Body:**

```json
{
  "plugin_id": "market_plugin_1",
  "source": "market"
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `plugin_id` | string | Yes | Plugin to install |
| `source` | string | No | "market" or "url" (default: "market") |
| `url` | string | No | Direct URL to plugin package |

**Response:**

```json
{
  "status": "installed",
  "plugin_id": "market_plugin_1",
  "version": "2.0.0"
}
```

---

### POST `/plugin/uninstall`

Uninstall a plugin.

**Request Body:**

```json
{
  "plugin_id": "plugin_abc"
}
```

**Response:**

```json
{
  "status": "uninstalled",
  "plugin_id": "plugin_abc"
}
```

---

### POST `/plugin/update`

Update a plugin to the latest version.

**Request Body:**

```json
{
  "plugin_id": "plugin_abc"
}
```

**Response:**

```json
{
  "status": "updated",
  "plugin_id": "plugin_abc",
  "old_version": "1.1.0",
  "new_version": "1.2.0"
}
```

---

## Tools

AstrBot provides four built-in tool categories for agent operations:

### Terminal Tool

Execute shell commands on the host system.

```json
{
  "tool": "terminal",
  "command": "ls -la",
  "cwd": "/home/user",
  "timeout": 30
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `command` | string | Shell command to execute |
| `cwd` | string | Working directory |
| `timeout` | integer | Execution timeout in seconds |

---

### File Tool

Perform file system operations.

```json
{
  "tool": "file",
  "operation": "read",
  "path": "/home/user/document.txt"
}
```

**Operations:**

| Operation | Description |
|-----------|-------------|
| `read` | Read file contents |
| `write` | Write content to file |
| `delete` | Delete a file |
| `list` | List directory contents |
| `exists` | Check if path exists |

---

### Web Tool

Search and fetch web content.

```json
{
  "tool": "web",
  "operation": "search",
  "query": "latest AI news",
  "limit": 5
}
```

| Operation | Description |
|-----------|-------------|
| `search` | Search the web |
| `fetch` | Fetch a specific URL |
| `scrape` | Extract data from a webpage |

---

### Code Tool

Execute code in a sandboxed environment.

```json
{
  "tool": "code",
  "language": "python",
  "code": "print('Hello, World!')"
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `language` | string | Programming language (python, javascript) |
| `code` | string | Code to execute |
| `timeout` | integer | Execution timeout |

---

## Session Management

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_id` | string | No | Specific session ID |
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 20) |
| `order_by` | string | No | Sort field (created_at, updated_at) |
| `order` | string | No | Sort order (asc, desc) |
| `search` | string | No | Search in session titles/messages |

### Session Object

```json
{
  "id": "sess_abc123",
  "title": "Python Helper",
  "created_at": "2026-05-13T09:00:00Z",
  "updated_at": "2026-05-13T10:30:00Z",
  "message_count": 42,
  "metadata": {
    "model": "gpt-4",
    "provider": "openai"
  }
}
```

---

## Provider Configuration

### JSON Schema

```json
{
  "providers": {
    "openai": {
      "enabled": true,
      "api_key": "sk-...",
      "api_base": "https://api.openai.com/v1",
      "models": {
        "default": "gpt-4",
        "vision": "gpt-4-turbo",
        "fast": "gpt-3.5-turbo"
      },
      "temperature": 0.7,
      "max_tokens": 4096
    },
    "claude": {
      "enabled": true,
      "api_key": "sk-ant-...",
      "api_base": "https://api.anthropic.com/v1",
      "models": {
        "default": "claude-3-opus-20240229",
        "fast": "claude-3-haiku-20240307"
      },
      "temperature": 0.7,
      "max_tokens": 4096
    },
    "gemini": {
      "enabled": false,
      "api_key": "AI...",
      "api_base": "https://generativelanguage.googleapis.com/v1",
      "models": {
        "default": "gemini-pro",
        "vision": "gemini-pro-vision"
      }
    }
  },
  "active_provider": "openai",
  "fallback_provider": "claude"
}
```

### Configuration Fields

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Whether the provider is active |
| `api_key` | string | Provider API key |
| `api_base` | string | API endpoint base URL |
| `models.default` | string | Default model for chat |
| `models.vision` | string | Model for image understanding |
| `models.fast` | string | Fast model for quick responses |
| `temperature` | float | Response creativity (0.0-2.0) |
| `max_tokens` | integer | Maximum response tokens |

---

## Code Examples

### Python

```python
import requests
import json

BASE_URL = "http://localhost:6185"
TOKEN = "your_bearer_token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Send a chat message
def send_chat(message, session_id=None, stream=True):
    data = {
        "message": message,
        "session_id": session_id,
        "stream": stream
    }
    response = requests.post(
        f"{BASE_URL}/api/v1/chat",
        headers=headers,
        json=data,
        stream=stream
    )
    return response

# List sessions
def list_sessions():
    response = requests.get(
        f"{BASE_URL}/api/v1/chat/sessions",
        headers=headers
    )
    return response.json()

# Get configs
def get_configs():
    response = requests.get(
        f"{BASE_URL}/api/v1/configs",
        headers=headers
    )
    return response.json()

# Example usage
if __name__ == "__main__":
    # Send message
    resp = send_chat("Hello, world!")
    print(resp.text)
    
    # List sessions
    sessions = list_sessions()
    print(json.dumps(sessions, indent=2))
```

### cURL

```bash
# Send chat message (streaming)
curl -X POST http://localhost:6185/api/v1/chat \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "stream": true}'

# List all sessions
curl -X GET http://localhost:6185/api/v1/chat/sessions \
  -H "Authorization: Bearer <your_token>"

# Create new session
curl -X POST http://localhost:6185/api/v1/chat/new_session \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "My New Session"}'

# Delete multiple sessions
curl -X POST http://localhost:6185/api/v1/chat/batch_delete_sessions \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"session_ids": ["sess_abc", "sess_def"]}'

# Get provider configs
curl -X GET http://localhost:6185/api/v1/configs \
  -H "Authorization: Bearer <your_token>"

# Upload file
curl -X POST http://localhost:6185/api/v1/file \
  -H "Authorization: Bearer <your_token>" \
  -F "file=@/path/to/file.txt" \
  -F "purpose=assistants"

# Get plugin list
curl -X GET http://localhost:6185/plugin/get \
  -H "Authorization: Bearer <your_token>"

# Install plugin
curl -X POST http://localhost:6185/plugin/install \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"plugin_id": "web_search", "source": "market"}'
```

### JavaScript

```javascript
const BASE_URL = 'http://localhost:6185';
const TOKEN = 'your_bearer_token';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

// Send chat message
async function sendChat(message, sessionId = null, stream = true) {
  const response = await fetch(`${BASE_URL}/api/v1/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, session_id: sessionId, stream })
  });
  
  if (stream) {
    // Handle SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log(decoder.decode(value));
    }
  } else {
    return response.json();
  }
}

// List sessions
async function listSessions() {
  const response = await fetch(`${BASE_URL}/api/v1/chat/sessions`, {
    method: 'GET',
    headers
  });
  return response.json();
}

// Create new session
async function createSession(title = 'New Session') {
  const response = await fetch(`${BASE_URL}/api/v1/chat/new_session`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title })
  });
  return response.json();
}

// Get configurations
async function getConfigs() {
  const response = await fetch(`${BASE_URL}/api/v1/configs`, {
    method: 'GET',
    headers
  });
  return response.json();
}

// Upload file
async function uploadFile(file, purpose = 'assistants') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);
  
  const response = await fetch(`${BASE_URL}/api/v1/file`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}` },
    body: formData
  });
  return response.json();
}

// Get installed plugins
async function getPlugins() {
  const response = await fetch(`${BASE_URL}/plugin/get`, {
    method: 'GET',
    headers
  });
  return response.json();
}

// Install plugin
async function installPlugin(pluginId, source = 'market') {
  const response = await fetch(`${BASE_URL}/plugin/install`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ plugin_id: pluginId, source })
  });
  return response.json();
}

// Example usage
(async () => {
  const sessions = await listSessions();
  console.log('Sessions:', sessions);
  
  const configs = await getConfigs();
  console.log('Configs:', configs);
  
  const plugins = await getPlugins();
  console.log('Plugins:', plugins);
})();
```

---

## ACP Protocol

AstrBot Communication Protocol (ACP) defines the message structure for agent-to-agent and client-to-agent communication.

### Message Structure

```json
{
  "acp_version": "1.0",
  "type": "message",
  "id": "msg_unique_id_123",
  "timestamp": "2026-05-13T10:30:00Z",
  "source": {
    "agent_id": "agent_abc",
    "platform": "feishu",
    "user_id": "user_123"
  },
  "target": {
    "agent_id": "agent_def",
    "platform": "*"
  },
  "payload": {
    "content_type": "text",
    "content": "Hello, how can I assist you today?",
    "metadata": {}
  },
  "session": {
    "id": "sess_abc123",
    "mode": "chat"
  },
  "attachments": [],
  "reply_to": null
}
```

### ACP Message Types

| Type | Description |
|------|-------------|
| `message` | Standard message exchange |
| `event` | System events (typing, online status) |
| `command` | Agent commands (execute tool, etc.) |
| `response` | Response to a previous command |
| `error` | Error notification |
| `ack` | Message acknowledgment |

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `acp_version` | string | Yes | ACP protocol version |
| `type` | string | Yes | Message type |
| `id` | string | Yes | Unique message identifier |
| `timestamp` | string | Yes | ISO 8601 timestamp |
| `source` | object | Yes | Message sender information |
| `target` | object | No | Intended recipient |
| `payload` | object | Yes | Message content |
| `session` | object | No | Session context |
| `attachments` | array | No | Attached files/media |
| `reply_to` | string | No | ID of message being replied to |

### Source Object

```json
"source": {
  "agent_id": "agent_abc",
  "platform": "feishu",
  "user_id": "user_123",
  "session_id": "sess_xyz"
}
```

### Payload Object

```json
"payload": {
  "content_type": "text",
  "content": "Message text or structured content",
  "metadata": {
    "model": "gpt-4",
    "tokens_used": 150
  }
}
```

### Supported Content Types

| Type | Description |
|------|-------------|
| `text` | Plain text message |
| `markdown` | Markdown formatted content |
| `image` | Image with URL or base64 |
| `audio` | Audio message |
| `file` | File attachment |
| `structured` | Structured JSON data |
| `tool_call` | Tool invocation request |
| `tool_result` | Tool execution result |

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "The provided authentication token is invalid or expired",
    "details": {}
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Invalid or missing token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource does not exist |
| `429` | Rate Limited - Too many requests |
| `500` | Internal Server Error |
| `503` | Service Unavailable |

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_TOKEN` | Authentication token is invalid |
| `TOKEN_EXPIRED` | Authentication token has expired |
| `INVALID_PARAMS` | Request parameters are invalid |
| `SESSION_NOT_FOUND` | Session does not exist |
| `PLUGIN_NOT_FOUND` | Plugin does not exist |
| `PLUGIN_INSTALL_FAILED` | Plugin installation failed |
| `RATE_LIMITED` | Too many requests |
| `INTERNAL_ERROR` | Server internal error |
