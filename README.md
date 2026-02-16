# AI Code Forge

AI Code Forge 是一个基于 AI 的智能 API 代码生成器 Web 应用。用户只需用自然语言描述想要的 API 功能，AI 就能自动生成生产级代码，并通过模拟测试和自动修复机制确保代码质量。

## 演示

https://github.com/user-attachments/assets/example.mp4

## 核心功能

**自然语言驱动的代码生成：** 用户输入一段需求描述（比如"创建一个用户注册 API，支持邮箱验证和密码加密"），AI 会自动生成完整、可运行的 API 代码，包含类型定义、输入验证、错误处理等。

**多语言支持：** 支持 TypeScript、Python、Go、Java、Rust 五种主流后端语言。

**AI 驱动的自动测试：** 生成代码后，AI 会以"测试员"的角色对代码进行全方位审查，涵盖输入验证、边界情况、安全漏洞（SQL 注入、XSS 等）、类型安全、性能等维度，输出结构化的测试报告。

**自我修复机制：** 如果测试发现问题，系统会自动进入"修复-重测"循环——AI 根据失败的测试项修复代码，再重新测试，最多迭代 3 轮，直到所有测试通过。整个过程无需人工干预。

**在线代码编辑器：** 内置 Monaco Editor（VS Code 同款编辑器），用户可以在浏览器中直接查看和编辑生成的代码，修改后一键重新触发测试和修复流程。

## 亮点

这个项目的核心亮点在于将"生成 → 测试 → 修复"串成了一个**全自动化的闭环流程**。它展示了 AI 不仅能写代码，还能审查代码、发现问题、并自主修复的完整能力链。用户从输入需求到拿到通过测试的可用代码，全程只需要一次点击。

## 技术栈

- **前端框架**: Next.js 14 (App Router) + React 18 + TypeScript
- **样式/动画**: Tailwind CSS + Framer Motion
- **代码编辑器**: Monaco Editor (VS Code 同款)
- **AI 模型**: Google Gemini（通过 OpenAI 兼容接口，也可切换为 OpenAI、OpenRouter 等）
- **图标**: Lucide React

## 快速开始

### 前提条件

- Node.js 18+
- 一个 AI 模型 API Key（支持 Gemini / OpenAI / OpenRouter 等）

### 安装

```bash
cd ai-code-forge
npm install
```

### 配置

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 填入你的配置：

```bash
# API Key
OPENAI_API_KEY=你的API Key

# 基础 URL（按使用的模型服务填写）
# Gemini:     https://generativelanguage.googleapis.com/v1beta/openai/
# OpenRouter:  https://openrouter.ai/api/v1
# OpenAI:     留空即可
OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/

# 模型名称
OPENAI_MODEL=gemini-2.5-flash

# 代理（国内访问 Google API 需要）
HTTPS_PROXY=http://127.0.0.1:7890
```

### 启动

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

## 工作原理

```
用户描述需求 → AI 生成代码 → AI 模拟测试 → 失败？→ AI 修复代码 → AI 再测 → 循环...
```

1. **输入** — 用户用自然语言描述想要的 API
2. **生成** — AI 生成完整的、可直接运行的 API 代码
3. **测试** — AI 以测试员角色对代码进行全方位审查，输出结构化测试报告
4. **修复** — 如果测试失败，AI 自动根据错误信息修复代码并重新测试
5. **完成** — 所有测试通过，代码就绪

最多自动修复 3 轮，超出后用户可手动编辑代码再触发新一轮测试和修复。

> **注意：** "测试"是 AI 对代码的静态分析和模拟审查，并非真正编译运行代码。优点是无需搭建任何语言的运行环境即可支持多语言，缺点是测试结果依赖 AI 的判断准确性。

## 项目结构

```
ai-code-forge/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/route.ts   # 代码生成 API
│   │   │   ├── test/route.ts       # 测试执行 API
│   │   │   └── fix/route.ts        # 自动修复 API
│   │   ├── globals.css             # 全局样式
│   │   ├── layout.tsx              # 根布局
│   │   └── page.tsx                # 主页面（流程编排）
│   ├── components/
│   │   ├── Header.tsx              # 顶部导航
│   │   ├── RequirementInput.tsx    # 需求输入表单
│   │   ├── CodeEditor.tsx          # Monaco 编辑器封装
│   │   ├── TestResults.tsx         # 测试结果展示
│   │   ├── WorkflowStatus.tsx      # 流程步骤指示器
│   │   └── FixHistory.tsx          # 修复历史记录
│   ├── lib/
│   │   └── openai.ts              # AI API 集成（含重试/代理/JSON解析）
│   └── types/
│       └── index.ts               # TypeScript 类型定义
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## License

MIT
