# Hermes Agent Architecture

## Overview

Hermes Agent is a multi-platform AI agent framework with modular architecture. It provides a unified interface for interacting with various LLM providers while supporting multiple messaging platforms.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Hermes Agent                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   CLI    │  │   TUI    │  │  Gateway │  │ Plugin   │     │
│  │          │  │          │  │          │  │ System   │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │             │             │            │
│  ┌────▼─────────────▼─────────────▼─────────────▼────┐     │
│  │                    AIAgent Core                     │     │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │     │
│  │  │Provider │  │  Tool   │  │ Memory  │  │ Traj.  │ │     │
│  │  │ Manager │  │ Registry│  │ Manager │  │ Compress│ │     │
│  │  └─────────┘  └─────────┘  └─────────┘  └────────┘ │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. AIAgent (run_agent.py)

The central agent class that orchestrates the conversation loop.

**Key responsibilities:**
- Message processing and response generation
- Tool call orchestration
- Session management
- Budget tracking

### 2. Provider Layer (providers/)

Abstraction layer for multiple LLM backends:

| Provider | Status | Features |
|----------|--------|----------|
| OpenAI | ✅ | Chat, Embeddings |
| Anthropic | ✅ | Claude models |
| Gemini | ✅ | Google AI |
| MiniMax | ✅ | Chinese LLM |
| GLM | ✅ | Chinese LLM |
| Xunfei | ✅ | Chinese LLM |
| Ollama | ✅ | Local models |

### 3. Tool System (tools/)

Auto-discovered tools via registry pattern:

- `tools/registry.py` — Central tool registration
- `tools/*.py` — Individual tool implementations
- Tool categories: terminal, file, web, code, etc.

### 4. Memory System (agent/memory/)

- **SessionDB** — SQLite with FTS5 for full-text search
- **Trajectory** — Conversation history compression
- **Context** — Sliding window with smart truncation

### 5. Gateway (gateway/)

Multi-platform message routing:

| Platform | Adapter |
|----------|---------|
| Telegram | gateway/platforms/telegram.py |
| Discord | gateway/platforms/discord.py |
| Feishu | gateway/platforms/feishu.py |
| QQ | gateway/platforms/qq.py |
| Webhook | gateway/platforms/webhook.py |

### 6. CLI (cli.py)

Command-line interface with:
- Rich banner and panels
- Prompt_toolkit input with autocomplete
- Skill slash commands
- Skin engine for theming

### 7. TUI (ui-tui/)

Terminal UI built with Ink (React):
- Animated faces during API calls
- Activity feed for tool results
- Session management

### 8. Plugin System (plugins/)

Extensible plugin architecture:

| Category | Description |
|----------|-------------|
| memory | Memory provider plugins |
| context_engine | Context compression engines |
| model-providers | Inference backend plugins |
| kanban | Multi-agent board dispatcher |
| observability | Metrics and tracing |

## Data Flow

```
User Input → Gateway → AIAgent → Provider → LLM
                ↓                      ↓
            Platform              Tool Execution
                ↓                      ↓
            Response ← AIAgent ← Result
```

## Key Design Patterns

1. **Registry Pattern** — Tools and plugins self-register
2. **Adapter Pattern** — Platform-specific adapters with common interface
3. **Strategy Pattern** — Multiple provider implementations
4. **Observer Pattern** — Event bus for component communication

## Configuration

- `~/.hermes/config.yaml` — Main configuration
- `~/.hermes/.env` — API keys and secrets
- Profile-aware path resolution via `hermes_constants.py`

## Documentation Structure

```
docs/
├── index.md           # Documentation home
├── core/              # Core module docs
│   ├── agent.md       # AIAgent class
│   ├── provider.md    # Provider abstraction
│   └── tool.md        # Tool system
├── platform/          # Platform integration docs
├── development/       # Developer guides
└── deployment/        # Deployment guides
```

## Deployment

- **GitHub Pages**: https://yeluo45.github.io/hermes-agent-design/
- **Source**: https://github.com/YeLuo45/hermes-agent-design