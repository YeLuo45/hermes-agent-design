# Dashboard Architecture

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Vue 3 | Frontend framework (Composition API) |
| Vuetify 3 | UI component library (Material Design) |
| TypeScript | Type-safe JavaScript |
| Vite | Build tool and dev server |
| Pinia | State management |
| Vue Router | Client-side routing |
| Axios | HTTP client (REST API) |
| WebSocket + REST | Real-time & traditional communication |

---

## Console Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Dashboard Console                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         FullLayout                                   │    │
│  │  ┌───────────────┬───────────────────────────────────────────────┐  │    │
│  │  │   Sidebar     │              Main Content Area                │  │    │
│  │  │               │                                               │  │    │
│  │  │  • Settings   │   ┌─────────────────────────────────────┐    │  │    │
│  │  │  • Provider   │   │                                     │    │  │    │
│  │  │  • Platform   │   │          Router View                 │    │  │    │
│  │  │  • Extension  │   │                                     │    │  │    │
│  │  │  • Persona    │   │   Settings | Provider | Platform     │    │  │    │
│  │  │  • Session    │   │   Extension | Persona | Session       │    │  │    │
│  │  │  • Knowledge  │   │   Knowledge Base                     │    │  │    │
│  │  │               │   │                                     │    │  │    │
│  │  │               │   └─────────────────────────────────────┘    │  │    │
│  │  │               │                                               │  │    │
│  │  └───────────────┴───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Components: ChatInput | MessageList | ModelPicker | ConfigForm     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Stores: sessionStore | configStore | modelStore | pluginStore      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Services: Axios (REST) | WebSocket (Real-time)                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Console Pages

| Page | Description |
|------|-------------|
| **Settings** | Application settings and preferences |
| **Provider** | LLM provider configuration (OpenAI, Anthropic, local, etc.) |
| **Platform** | Platform integration settings |
| **Extension** | Plugin/extension management |
| **Persona** | Chat persona and behavior customization |
| **Session** | Conversation session management |
| **Knowledge Base** | RAG knowledge base configuration |

---

## Source Structure

```
dashboard/src/
├── layouts/
│   ├── FullLayout.vue       # Full sidebar + content layout
│   ├── FloatingLayout.vue   # Floating/overlay layout
│   └── BlankLayout.vue      # Minimal blank layout
│
├── views/
│   ├── SettingsView.vue     # Settings page
│   ├── ProviderView.vue     # Provider configuration
│   ├── PlatformView.vue     # Platform settings
│   ├── ExtensionView.vue    # Plugin management
│   ├── PersonaView.vue      # Persona configuration
│   ├── SessionView.vue      # Session management
│   └── KnowledgeBaseView.vue # Knowledge base settings
│
├── components/
│   ├── ChatInput.vue        # Message input component
│   ├── MessageList.vue      # Chat message display
│   ├── ModelPicker.vue      # LLM model selector
│   └── ConfigForm.vue       # Configuration form
│
└── stores/
    ├── sessionStore.ts      # Session state management
    ├── configStore.ts       # Configuration state
    ├── modelStore.ts        # Model state management
    └── pluginStore.ts       # Plugin state management
```

---

## Console Routes

| Route | Component | Layout | Description |
|-------|-----------|--------|-------------|
| `/` | SessionView | FullLayout | Default chat session |
| `/settings` | SettingsView | FullLayout | App settings |
| `/provider` | ProviderView | FullLayout | LLM provider config |
| `/platform` | PlatformView | FullLayout | Platform settings |
| `/extension` | ExtensionView | FullLayout | Plugin management |
| `/persona` | PersonaView | FullLayout | Persona settings |
| `/session` | SessionView | FullLayout | Session management |
| `/knowledge` | KnowledgeBaseView | FullLayout | Knowledge base |

---

## Running the Console

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

---

## Theme

Dark theme color palette used in the dashboard:

| Element | Color |
|---------|-------|
| Background | `#0f0f23` |
| Card | `#1a1a2e` |
| Accent | `#00d4ff` |
