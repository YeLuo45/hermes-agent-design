# Platform Adapter

## Overview

The Platform Adapter is a **multi-platform message gateway** that provides unified communication between Hermes Agent and various messaging platforms. It handles **protocol conversion**, abstracting platform-specific details into a consistent interface for the core agent system.

---

## Supported Platforms

| Platform | Status | Adapter Module |
|----------|--------|----------------|
| **Telegram** | ✅ Stable | `adapters/telegram.py` |
| **Discord** | ✅ Stable | `adapters/discord.py` |
| **Feishu/Lark** | ✅ Stable | `adapters/feishu.py` |
| **QQ** | 🔄 Beta | `adapters/qq.py` |
| **WhatsApp** | 🔄 Beta | `adapters/whatsapp.py` |
| **LINE** | 🔄 Beta | `adapters/line.py` |
| **Slack** | 🔄 Beta | `adapters/slack.py` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Hermes Core Agent                     │
├─────────────────────────────────────────────────────────┤
│                   Unified Message Bus                    │
├─────────────────────────────────────────────────────────┤
│                   Platform Gateway                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │  Telegram   │ │  Discord    │ │   Feishu    │  ...   │
│  │  Adapter    │ │  Adapter    │ │  Adapter    │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
├─────────────────────────────────────────────────────────┤
│              Platform-Specific APIs / Webhooks           │
└─────────────────────────────────────────────────────────┘
```

### Gateway

The **Gateway** is the central coordinator that:
- Routes incoming events from platform adapters to the core agent
- Distributes outgoing messages to the appropriate platform adapter
- Manages adapter lifecycle (connect, disconnect, reconnect)
- Handles cross-platform message normalization

### Adapter Pattern

Each **Platform Adapter** is responsible for:
- Establishing and maintaining connections to its platform
- Converting platform-specific message formats to the unified format
- Converting outgoing unified messages to platform-specific formats
- Handling platform-specific authentication and rate limits

---

## Platform Adapter Interface

All platform adapters implement the following interface:

```python
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from dataclasses import dataclass

@dataclass
class AdapterConfig:
    """Base configuration for platform adapters."""
    api_key: str
    api_secret: str
    webhook_url: Optional[str] = None
    rate_limit_requests: int = 30  # requests per second
    rate_limit_messages: int = 20  # messages per second

class PlatformAdapter(ABC):
    """Abstract base class for all platform adapters."""

    @property
    @abstractmethod
    def platform_name(self) -> str:
        """Unique identifier for the platform."""
        pass

    @abstractmethod
    async def connect(self) -> None:
        """Establish connection to the platform."""
        pass

    @abstractmethod
    async def disconnect(self) -> None:
        """Close connection to the platform."""
        pass

    @abstractmethod
    async def send_message(self, message: 'UnifiedMessage') -> str:
        """Send a message to the platform. Returns message ID."""
        pass

    @abstractmethod
    async def send_reply(self, message_id: str, text: str) -> str:
        """Reply to a specific message."""
        pass

    @abstractmethod
    async def edit_message(self, message_id: str, text: str) -> bool:
        """Edit an existing message."""
        pass

    @abstractmethod
    async def delete_message(self, message_id: str) -> bool:
        """Delete a message."""
        pass

    @abstractmethod
    async def upload_media(self, file_path: str, media_type: str) -> str:
        """Upload media and return the file token/URL."""
        pass

    @abstractmethod
    async def register_webhook(self, webhook_url: str) -> bool:
        """Register the webhook endpoint with the platform."""
        pass

    @abstractmethod
    def parse_webhook_event(self, payload: Dict[str, Any]) -> 'UnifiedEvent':
        """Convert platform webhook payload to UnifiedEvent."""
        pass
```

---

## Unified Message Format

All messages are converted to a **Unified Message Format** before reaching the core agent:

```python
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class MessageType(Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    FILE = "file"
    LOCATION = "location"
    STICKER = "sticker"

class MessageRole(Enum):
    USER = "user"
    BOT = "bot"
    SYSTEM = "system"

@dataclass
class UnifiedMessage:
    """Platform-agnostic message format."""
    
    # Message identity
    message_id: str                    # Platform-specific message ID
    platform: str                      # Platform name (e.g., "telegram", "discord")
    chat_id: str                       # Chat/conversation ID
    thread_id: Optional[str] = None    # Thread/channel ID (platform-specific)
    
    # Content
    type: MessageType = MessageType.TEXT
    text: Optional[str] = None
    raw_text: Optional[str] = None     # Original text before parsing
    
    # Media
    media_url: Optional[str] = None
    media_file_id: Optional[str] = None
    media_mime_type: Optional[str] = None
    caption: Optional[str] = None
    
    # Sender
    sender_id: str                     # User ID
    sender_name: str                   # Display name
    sender_username: Optional[str] = None
    sender_role: MessageRole = MessageRole.USER
    sender_is_bot: bool = False
    
    # Reply context
    reply_to_message_id: Optional[str] = None
    
    # Metadata
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.utcnow)
    
    # Platform-specific extras
    platform_data: Dict[str, Any] = field(default_factory=dict)
```

---

## Event Types

The platform adapter recognizes the following event types:

### 1. Message Event

```python
@dataclass
class MessageEvent(UnifiedEvent):
    """User sent a message."""
    type: EventType = EventType.MESSAGE
    message: UnifiedMessage
```

### 2. Callback Query Event

```python
@dataclass
class CallbackQueryEvent(UnifiedEvent):
    """User clicked an inline button."""
    type: EventType = EventType.CALLBACK_QUERY
    callback_id: str
    data: str                           # Button payload
    message_id: str                     # Original message ID
    chat_id: str
    sender_id: str
    sender_name: str
```

### 3. Member Join Event

```python
@dataclass
class MemberJoinEvent(UnifiedEvent):
    """User joined a chat or channel."""
    type: EventType = EventType.MEMBER_JOIN
    chat_id: str
    chat_type: str                      # "group", "channel", "supergroup"
    user_id: str
    user_name: str
    inviter_id: Optional[str] = None   # Who invited them (if applicable)
    timestamp: datetime = field(default_factory=datetime.utcnow)
```

### Additional Event Types

| Event Type | Description |
|------------|-------------|
| `MEMBER_LEAVE` | User left a chat |
| `MESSAGE_EDIT` | Message was edited |
| `CHANNEL_POST` | New post in a channel |
| `INLINE_QUERY` | Inline query from user |
| `CHAT_MEMBER_UPDATE` | Chat membership changed |
| `ERROR` | Platform error occurred |

---

## Rate Limiting

Each adapter implements platform-specific rate limiting:

```python
@dataclass
class RateLimitConfig:
    """Rate limiting configuration."""
    
    # Requests per second
    requests_per_second: int = 30
    
    # Messages per second (send operations)
    messages_per_second: int = 20
    
    # Burst allowance
    burst_size: int = 10
    
    # Retry configuration
    max_retries: int = 3
    retry_delay: float = 1.0  # seconds
    backoff_factor: float = 2.0

class RateLimiter:
    """Token bucket rate limiter."""
    
    def __init__(self, config: RateLimitConfig):
        self.config = config
        self.tokens = config.burst_size
        self.last_update = time.time()
    
    async def acquire(self, tokens: int = 1) -> bool:
        """Acquire tokens, blocking if necessary."""
        while not self._can_acquire(tokens):
            await asyncio.sleep(0.1)
        self._consume(tokens)
        return True
    
    def _can_acquire(self, tokens: int) -> bool:
        self._refill()
        return self.tokens >= tokens
    
    def _consume(self, tokens: int) -> None:
        self.tokens -= tokens
    
    def _refill(self) -> None:
        now = time.time()
        elapsed = now - self.last_update
        self.tokens = min(
            self.config.burst_size,
            self.tokens + elapsed * self.config.requests_per_second
        )
        self.last_update = now
```

### Platform-Specific Limits

| Platform | Messages/sec | Requests/sec | Burst |
|----------|-------------|--------------|-------|
| Telegram | 30 | 30 | 10 |
| Discord | 5 | 5 | 2 |
| Feishu | 20 | 20 | 5 |
| QQ | 10 | 10 | 3 |
| WhatsApp | 5 | 5 | 2 |
| LINE | 15 | 15 | 5 |
| Slack | 10 | 10 | 3 |

---

## Error Handling

### Error Types

```python
class AdapterError(Exception):
    """Base exception for adapter errors."""
    def __init__(self, platform: str, message: str, code: str = "UNKNOWN"):
        self.platform = platform
        self.code = code
        super().__init__(f"[{platform}] {code}: {message}")

class AuthenticationError(AdapterError):
    """Authentication failed."""
    pass

class RateLimitError(AdapterError):
    """Rate limit exceeded."""
    pass

class MessageNotFoundError(AdapterError):
    """Message does not exist or was deleted."""
    pass

class ChatNotFoundError(AdapterError):
    """Chat does not exist or bot is not a member."""
    pass

class PermissionDeniedError(AdapterError):
    """Bot lacks permission to perform action."""
    pass

class NetworkError(AdapterError):
    """Network connectivity issue."""
    pass

class WebhookError(AdapterError):
    """Webhook processing failed."""
    pass
```

### Error Handling Flow

```
┌──────────────┐
│  Webhook     │
│  Received    │
└──────┬───────┘
       ▼
┌──────────────┐
│  Parse &     │
│  Validate    │
└──────┬───────┘
       ▼
┌──────────────┐     ┌──────────────┐
│  Success?    │────►│  Route to    │
└──────┬───────┘ No  │  Core Agent  │
       │ Yes         └──────────────┘
       ▼
┌──────────────┐
│  Handle      │
│  Error       │
└──────────────┘
```

### Retry Strategy

```python
async def with_retry(func: Callable, max_retries: int = 3) -> Any:
    """Execute function with exponential backoff retry."""
    last_exception = None
    
    for attempt in range(max_retries):
        try:
            return await func()
        except RateLimitError:
            raise  # Don't retry rate limits
        except (NetworkError, TemporaryError) as e:
            last_exception = e
            delay = (2 ** attempt) * 0.5  # 0.5s, 1s, 2s
            await asyncio.sleep(delay)
        except Exception as e:
            last_exception = e
            break
    
    raise last_exception
```

---

## Authentication Flow

### Bot Authentication (Per Platform)

```
┌─────────────────────────────────────────────────────────┐
│                    Authentication Flow                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐     │
│  │   Bot      │───►│  Platform  │───►│   OAuth    │     │
│  │  Token     │    │   Auth     │    │   Flow     │     │
│  │  Init      │    │   Server   │    │  (if req)  │     │
│  └────────────┘    └────────────┘    └────────────┘     │
│       │                                      │           │
│       ▼                                      ▼           │
│  ┌────────────┐                      ┌────────────┐      │
│  │  Store     │◄─────────────────────│  Receive   │      │
│  │  Credentials│   Access Token      │  Token     │      │
│  └────────────┘                      └────────────┘      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Platform-Specific Auth

| Platform | Auth Method | Token Type |
|----------|-------------|-------------|
| Telegram | Bot Token | `Bot <token>` |
| Discord | Bot Token | `Bot <token>` |
| Feishu | App ID + Secret | OAuth 2.0 |
| QQ | App ID + Secret | OAuth 2.0 |
| WhatsApp | Business API | OAuth 2.0 |
| LINE | Channel Access Token | Bearer Token |
| Slack | Bot Token | `xoxb-<token>` |

### Token Refresh Flow

```python
class TokenManager:
    """Manages OAuth tokens with automatic refresh."""
    
    def __init__(self, platform: str, credentials: Dict[str, str]):
        self.platform = platform
        self.credentials = credentials
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.expires_at: datetime = None
    
    async def get_valid_token(self) -> str:
        """Get a valid access token, refreshing if necessary."""
        if self._is_expired():
            await self._refresh()
        return self.access_token
    
    async def _refresh(self) -> None:
        """Refresh the access token."""
        response = await self._request_token(
            grant_type="refresh_token",
            refresh_token=self.refresh_token
        )
        self.access_token = response["access_token"]
        self.refresh_token = response.get("refresh_token", self.refresh_token)
        self.expires_at = datetime.utcnow() + timedelta(
            seconds=response["expires_in"]
        )
    
    def _is_expired(self) -> bool:
        return (
            self.expires_at is None or 
            datetime.utcnow() >= self.expires_at - timedelta(minutes=5)
        )
```

---

## Configuration Example

```yaml
# config/adapters.yaml
adapters:
  telegram:
    enabled: true
    bot_token: "${TELEGRAM_BOT_TOKEN}"
    rate_limit:
      requests_per_second: 30
      messages_per_second: 20
      burst_size: 10
  
  discord:
    enabled: true
    bot_token: "${DISCORD_BOT_TOKEN}"
    application_id: "${DISCORD_APP_ID}"
    rate_limit:
      requests_per_second: 5
      messages_per_second: 5
      burst_size: 2
  
  feishu:
    enabled: true
    app_id: "${FEISHU_APP_ID}"
    app_secret: "${FEISHU_APP_SECRET}"
    webhook_url: "${FEISHU_WEBHOOK_URL}"
    rate_limit:
      requests_per_second: 20
      messages_per_second: 20
      burst_size: 5
  
  qq:
    enabled: false
    app_id: "${QQ_APP_ID}"
    app_secret: "${QQ_APP_SECRET}"
  
  slack:
    enabled: false
    bot_token: "${SLACK_BOT_TOKEN}"
    signing_secret: "${SLACK_SIGNING_SECRET}"
```

---

## Health Monitoring

Each adapter exposes health metrics:

```python
@dataclass
class AdapterHealth:
    """Health status of a platform adapter."""
    platform: str
    status: str                          # "healthy", "degraded", "down"
    connected: bool
    latency_ms: float
    last_heartbeat: datetime
    rate_limit_remaining: int
    error_count: int = 0
    uptime_seconds: float = 0.0
```

---

*Document Version: 1.0.0*  
*Last Updated: 2026-05-13*
