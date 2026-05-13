# Agent Runner

The Agent Runner is the core execution engine in AstrBot that orchestrates multi-turn agent interactions, tool calling, and LLM routing.

## Overview

### Provider Abstraction Layer

The Agent Runner uses a provider abstraction layer to support multiple LLM backends through a unified interface:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Agent Runner (ToolLoopAgentRunner)          │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │  BaseAdapter  │  │ BaseAgentRunner│  │ ContextManager │       │
│  │  (abstract)   │  │  (abstract)    │  │               │       │
│  └───────┬───────┘  └───────────────┘  └───────────────┘       │
│          │                                                        │
│  ┌───────┴───────────────────────────────────────────┐           │
│  │                  Provider Adapters                 │           │
│  ├──────────┬──────────┬──────────┬──────────┬──────┤           │
│  │ OpenAI   │ Anthropic│ Gemini   │ MiniMax  │ GLM  │           │
│  │ Adapter  │ Adapter  │ Adapter  │ Adapter  │Adapter│ Ollama │
│  └──────────┴──────────┴──────────┴──────────┴──────┘           │
│          │            │            │            │                │
│          ▼            ▼            ▼            ▼                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Provider (LLM Backend)                      │    │
│  │  OpenAI │ Anthropic │ Gemini │ MiniMax │ GLM │ Ollama   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Session Loop Management

The Agent Runner implements a ReAct-style (Reason + Act) loop:

```
User Input → Context Assembly → LLM Request → Response Parsing
                                                      │
                         ┌────────────────────────────┴────────────────────────────┐
                         │                      Decision                         │
                         │                                                         │
                         ▼                                                         ▼
                  ┌──────────────┐                                    ┌──────────────────┐
                  │  Tool Calls  │                                    │  Final Response  │
                  │   Detected   │                                    │   (text/image)   │
                  └──────┬───────┘                                    └──────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  Tool Orchestration │
              │  Executor           │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  Result → Context  │
              │  (loop back)       │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   Next LLM Call    │
              └─────────────────────┘
```

### Tool Orchestration

Tools are managed through a `ToolSet` abstraction and executed via `BaseFunctionToolExecutor`:

```
┌──────────────────────────────────────────────────────────────────┐
│                     Tool Orchestration Flow                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. LLM Response contains tool_call → parse_response()           │
│                    │                                             │
│                    ▼                                             │
│  2. ToolCallMessageSegment → extract tool name + arguments       │
│                    │                                             │
│                    ▼                                             │
│  3. FunctionTool lookup via ToolSet                              │
│                    │                                             │
│                    ▼                                             │
│  4. BaseFunctionToolExecutor.execute(tool, args)                 │
│                    │                                             │
│          ┌─────────┴─────────┐                                   │
│          ▼                   ▼                                    │
│  ┌──────────────┐    ┌──────────────────┐                        │
│  │  Sync Tool   │    │   Async Tool     │                        │
│  │  Execution   │    │   Execution       │                        │
│  └──────────────┘    └──────────────────┘                        │
│          │                   │                                    │
│          └─────────┬─────────┘                                   │
│                    ▼                                             │
│  5. ToolResult → MessageChain → Context                          │
│                    │                                             │
│                    ▼                                             │
│  6. Continue session loop                                         │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### LLM Routing Logic

LLM routing determines which provider adapter is used based on:

```
┌──────────────────────────────────────────────────────────────────┐
│                     LLM Routing Logic                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Request Model String ──► Model Prefix Detection                 │
│                                    │                             │
│         ┌──────────────────────────┼──────────────────────────┐  │
│         │                          ▼                          │  │
│         │              ┌────────────────────────┐            │  │
│         │              │   Parse Model Prefix    │            │  │
│         │              │   (e.g., "gpt-4o",      │            │  │
│         │              │    "claude-3-5-sonnet", │            │  │
│         │              │    "gemini-1.5-pro")    │            │  │
│         │              └────────────────────────┘            │  │
│         │                          │                          │  │
│         │                          ▼                          │  │
│         │              ┌────────────────────────┐            │  │
│         │              │   Capability Matching  │            │  │
│         │              │   - vision support     │            │  │
│         │              │   - audio support      │            │  │
│         │              │   - tool calling       │            │  │
│         │              │   - context length     │            │  │
│         │              └────────────────────────┘            │  │
│         │                          │                          │  │
│         │                          ▼                          │  │
│         │              ┌────────────────────────┐            │  │
│         │              │   Cost Optimization   │            │  │
│         │              │   (if enabled)        │            │  │
│         │              │   - token cost         │            │  │
│         │              │   - latency priority   │            │  │
│         │              └────────────────────────┘            │  │
│         │                          │                          │  │
│         └──────────────────────────┼──────────────────────────┘  │
│                                    │                             │
│                                    ▼                             │
│                         ┌────────────────────────┐               │
│                         │  Select Provider       │               │
│                         │  Adapter Instance      │               │
│                         └────────────────────────┘               │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Supported Providers

AstrBot supports the following LLM providers through adapter files:

| Provider | Model Examples | Adapter File | Capabilities |
|----------|---------------|--------------|--------------|
| **OpenAI** | GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo | `openai_adapter` | Vision, Function Calling, Streaming |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus | `anthropic_adapter` | Vision, Extended Context, Function Calling |
| **Google Gemini** | Gemini 1.5 Pro, Gemini 1.5 Flash | `gemini_native_adapter` | Vision, Audio, Long Context, Function Calling |
| **MiniMax** | MiniMax Text-01, MiniMax VL | `minimax_adapter` | Vision, Cost-effective |
| **GLM** | GLM-4, GLM-4V, GLM-3 | `glm_adapter` | Vision, Function Calling |
| **Ollama** | Llama 3, Mistral, Qwen2 | `ollama_adapter` | Local Models, Privacy-focused |

## Adapter Files

Each provider has a dedicated adapter file implementing the `BaseAdapter` interface:

```
astrbot/core/provider/adapters/
├── __init__.py
├── base_adapter.py          # BaseAdapter abstract class
├── openai_adapter.py        # OpenAI GPT-4 series
├── anthropic_adapter.py     # Anthropic Claude 3.5 series
├── gemini_native_adapter.py # Google Gemini 1.5 series
├── minimax_adapter.py       # MiniMax Text/VL series
├── glm_adapter.py           # Zhipu GLM series
└── ollama_adapter.py        # Ollama local models
```

## Base Adapter Interface

```python
# astrbot/core/provider/adapters/base_adapter.py

from abc import ABC, abstractmethod
from typing import Any, AsyncGenerator

class BaseAdapter(ABC):
    """Abstract base class for all LLM provider adapters."""

    @abstractmethod
    async def chat(
        self,
        messages: list[dict],
        model: str,
        temperature: float = 0.7,
        max_tokens: int | None = None,
        **kwargs
    ) -> dict[str, Any]:
        """Send a chat request to the LLM provider.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model identifier string
            temperature: Sampling temperature (0.0-2.0)
            max_tokens: Maximum tokens to generate
            
        Returns:
            Response dict containing at minimum:
            - 'content': Generated text response
            - 'tool_calls': List of tool call requests (if any)
            - 'finish_reason': Why generation stopped
        """

    @abstractmethod
    async def vision(
        self,
        messages: list[dict],
        model: str,
        **kwargs
    ) -> dict[str, Any]:
        """Send a vision/multimodal request to the LLM provider.
        
        Args:
            messages: List of message dicts with text and image content
            model: Model identifier string
            
        Returns:
            Response dict with vision understanding results
        """

    @abstractmethod
    async def count_tokens(
        self,
        text: str | list[dict],
        model: str | None = None
    ) -> int:
        """Count tokens for a given text or messages.
        
        Args:
            text: String or message dict list
            model: Model for tokenization (uses adapter default if None)
            
        Returns:
            Estimated token count
        """

    @abstractmethod
    def parse_response(self, raw_response: Any) -> dict[str, Any]:
        """Parse provider-specific response format into normalized format.
        
        Args:
            raw_response: Raw response from the provider
            
        Returns:
            Normalized response dict with standardized fields:
            - 'content': str
            - 'tool_calls': list[dict] | None
            - 'reasoning_content': str | None
            - 'finish_reason': str
        """
```

## Session Loop Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Session Loop Execution Flow                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Initialization Phase                         │    │
│  │  1. reset() → Setup Provider, ContextManager, ToolExecutor      │    │
│  │  2. Assemble user request into Message                           │    │
│  │  3. Apply system prompts, bind checkpoint messages               │    │
│  │  4. Initialize AgentState = IDLE                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                  │                                     │
│                                  ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Main Loop (while not done)                  │    │
│  │                                                                   │    │
│  │  ┌───────────────┐                                             │    │
│  │  │ 1. Context     │ → Sanitize contexts by provider modalities │    │
│  │  │    Sanitization│ → Compress if exceeds max_context_tokens    │    │
│  │  └───────┬───────┘                                             │    │
│  │          │                                                     │    │
│  │          ▼                                                     │    │
│  │  ┌───────────────┐                                             │    │
│  │  │ 2. LLM Request │ → Call provider.text_chat() or             │    │
│  │  │                │   provider.text_chat_stream()             │    │
│  │  └───────┬───────┘                                             │    │
│  │          │                                                     │    │
│  │          ▼                                                     │    │
│  │  ┌───────────────┐                                             │    │
│  │  │ 3. Response    │ → parse_response() normalizes output       │    │
│  │  │    Parsing    │ → Extract tool_calls, content, reasoning    │    │
│  │  └───────┬───────┘                                             │    │
│  │          │                                                     │    │
│  │          ├─────────────────────────────┐                       │    │
│  │          │                             │                       │    │
│  │          ▼                             ▼                       │    │
│  │  ┌──────────────────┐      ┌─────────────────────┐              │    │
│  │  │ No Tool Calls    │      │ Has Tool Calls     │              │    │
│  │  │ → Final Response │      │ → Tool Orchestration│              │    │
│  │  │ → AgentState.DONE│      └──────────┬──────────┘              │    │
│  │  └──────────────────┘                 │                         │    │
│  │                                     ▼                            │    │
│  │                      ┌────────────────────────────────┐          │    │
│  │                      │ 3a. Handle Function Tools:     │          │    │
│  │                      │   - Validate tool names        │          │    │
│  │                      │   - Execute via ToolExecutor   │          │    │
│  │                      │   - Handle tool result overflow│          │    │
│  │                      │   - Materialize large results  │          │    │
│  │                      │   - Append results to context │          │    │
│  │                      └────────────────┬───────────────┘          │    │
│  │                                       │                           │    │
│  │                      ┌────────────────┴───────────────┐            │    │
│  │                      │                                │            │    │
│  │                      ▼                                ▼            │    │
│  │           ┌──────────────────────┐    ┌─────────────────────┐       │    │
│  │           │ Continue Loop        │    │ Max Steps Reached  │       │    │
│  │           │ (AgentState.RUNNING) │    │ → Finalize + DONE  │       │    │
│  │           └──────────────────────┘    └─────────────────────┘       │    │
│  │                                                                   │    │
│  └───────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Cleanup Phase                               │    │
│  │  - Finalize AgentResponse with stats                           │    │
│  │  - Call agent_hooks.on_agent_done()                            │    │
│  │  - Resolve any unconsumed follow-up tickets                    │    │
│  │  - Return final LLMResponse                                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Code Example: Tool Loop Agent Runner

```python
# Example usage of ToolLoopAgentRunner
from astrbot.core.agent.runners.tool_loop_agent_runner import ToolLoopAgentRunner
from astrbot.core.provider.provider import Provider
from astrbot.core.agent.tool_executor import BaseFunctionToolExecutor
from astrbot.core.agent.hooks import BaseAgentRunHooks
from astrbot.core.provider.entities import ProviderRequest

class MyToolExecutor(BaseFunctionToolExecutor):
    async def execute(self, tool_call_id: str, tool: FunctionTool, args: dict) -> Any:
        # Execute the tool and return result
        return await tool.func(**args)

runner = ToolLoopAgentRunner()

# Initialize
await runner.reset(
    provider=my_provider,
    request=ProviderRequest(prompt="Explain quantum computing"),
    run_context=context_wrapper,
    tool_executor=MyToolExecutor(),
    agent_hooks=MyHooks(),
    streaming=False,
    enforce_max_turns=10,
)

# Execute until done
async for response in runner.step_until_done(max_step=10):
    if isinstance(response, AgentResponse):
        print(f"Step {response.step}: {response.content}")

# Get final result
final_resp = runner.get_final_llm_resp()
```

## Tool Schema Modes

The Agent Runner supports two tool schema modes for optimizing token usage:

| Mode | Description | Use Case |
|------|-------------|----------|
| `full` (default) | Complete tool schema with all parameters sent to LLM | Standard tool calling |
| `skills_like` | Light schema without parameters; re-query with param-only schema when needed | Tools with large descriptions |

```python
# skills_like mode reduces token usage for complex tools
await runner.reset(
    tool_schema_mode="skills_like",  # Enable light schema mode
    ...
)
```

## Error Handling & Fallback

The Agent Runner implements provider fallback:

```python
# Fallback providers are tried in order if primary provider fails
await runner.reset(
    provider=primary_gpt4_provider,
    fallback_providers=[
        anthropic_provider,  # First fallback
        local_ollama,        # Second fallback (offline support)
    ],
    ...
)
```
