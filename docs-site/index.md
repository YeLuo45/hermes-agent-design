---
layout: home

hero:
  name: "Hermes Agent Design"
  text: "Multi-Platform AI Agent Framework"
  tagline: "Python + TypeScript 开源架构设计文档站"
  actions:
    - theme: brand
      text: 架构分析
      link: /architecture
    - theme: alt
      text: API 文档
      link: /api
    - theme: alt
      text: 插件开发
      link: /plugin-development

features:
  - title: AIAgent Core
    details: 对话循环、工具编排、会话管理、预算跟踪。约12k行核心代码。
  - title: Provider Layer
    details: 多LLM后端抽象层：OpenAI、Anthropic、Gemini、MiniMax、GLM等。
  - title: Tool System
    details: 基于注册模式的工具自动发现机制，支持terminal/file/web/code等。
  - title: Memory System
    details: SQLite+FTS5全文搜索，会话轨迹压缩，上下文智能截断。
  - title: Gateway
    details: 多平台消息路由：Telegram、Discord、Feishu、QQ、Webhook等。
  - title: Plugin System
    details: 可扩展插件架构：memory、context_engine、model-providers等。
---

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Hermes Agent                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   CLI    │  │   TUI    │  │  Gateway │  │ Plugin   │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       └──────────────┼──────────────┘             │            │
│  ┌──────────────────▼─────────────────────────────────────┐ │
│  │                    AIAgent Core                         │ │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐    │ │
│  │  │ Provider│ │  Tool    │ │ Memory  │ │  Traj.  │    │ │
│  │  │ Manager │ │ Registry │ │ Manager │ │Compress │    │ │
│  │  └─────────┘ └──────────┘ └─────────┘ └─────────┘    │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 技术栈

| Component | Technology |
|-----------|------------|
| Documentation | VitePress (React-based) |
| Core Language | Python 3.11+ |
| Web UI | React + TypeScript + Vite |
| Deployment | GitHub Pages |
| Database | SQLite + FTS5 |

## 外部链接

- [View on GitHub](https://github.com/YeLuo45/hermes-agent-design)
- [Hermes Agent Source](https://github.com/YeLuo45/hermes-agent)
- [Proposal Manager](https://yeluo45.github.io/prj-proposals-manager/)
