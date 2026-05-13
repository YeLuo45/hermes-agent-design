import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Hermes Agent Design",
  description: "Hermes Agent 架构设计文档站",
  lang: "zh-CN",
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#0f0f23' }],
    ['meta', { name: 'description', content: 'Hermes Agent 架构设计文档站 - Multi-Platform AI Agent Framework' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '首页', link: '/' },
      { text: 'API', link: '/api' },
      { text: 'Dashboard', link: '/dashboard' },
      { text: 'MCP', link: '/mcp' },
      { text: 'Agent Runner', link: '/agent-runner' },
      { text: '平台适配器', link: '/platform-adapter' },
      { text: '插件开发', link: '/plugin-development' },
    ],

    sidebar: [
      {
        text: '文档',
        items: [
          { text: '首页', link: '/' },
          { text: 'API', link: '/api' },
          { text: 'Dashboard', link: '/dashboard' },
          { text: 'MCP', link: '/mcp' },
          { text: 'Agent Runner', link: '/agent-runner' },
          { text: '平台适配器', link: '/platform-adapter' },
          { text: '插件开发', link: '/plugin-development' },
        ],
      },
    ],

    editLink: {
      pattern: 'https://github.com/YeLuo45/hermes-agent-design/edit/master/docs-site/:path',
      text: '在 GitHub 上编辑此页',
    },

    footer: {
      message: 'Hermes Agent Design Documentation',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/YeLuo45/hermes-agent-design' },
    ],
  },

  rewrites: {},
});
