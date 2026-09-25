# 个人主页 + AI 小助手

这是我学习 Web 开发和 AI Native 开发过程中完成的一个小项目。
项目从一个简单的个人主页开始，逐步加入了留言板、Node.js 后端、SQLite 数据库以及 AI 小助手，用来练习前后端交互、HTTP API、数据库和 AI 应用开发。

## 项目功能

### 个人主页

* 个人信息展示，包括兴趣和学习计划、技能情况、GitHub 主页链接
* 响应式页面布局

### 留言板

* 用户可以提交名字和留言
* 后端对提交的数据进行基本验证
* 留言保存到 SQLite 数据库
* 前后端通过 HTTP API 进行交互

### AI 小助手

* 支持与 AI 进行对话
* 支持流式输出
* 支持 Markdown 和 LaTeX 数学公式
* 可以使用 Tool Calling 查询留言板中的内容。比如可以询问：留言板里有什么？此时 AI 就会调用 `get_messages` 工具，从 SQLite 中获取留言，再根据查询结果回答。

## 技术栈

* HTML
* CSS
* JavaScript
* Node.js
* SQLite
* better-sqlite3
* OpenRouter API
* dotenv
* Markdown / KaTeX
* Tool Calling
* Streaming

## 项目结构

```text
.
├── index.html
├── script.js
├── images/
├── .gitignore
├── README.md
└── server/
    ├── server.js
    ├── package.json
    └── package-lock.json
```

## 运行项目
后端进入 `server` 目录后安装依赖：
```bash
npm install
```
在项目根目录配置 `.env`：
```text
OPENROUTER_API_KEY=你的_API_Key
```
然后启动后端：
```bash
npm start
```
前端可以使用 VS Code Live Server 等本地 HTTP 服务器运行。

## 学习内容
通过这个项目我实践了：
* Git 和 GitHub
* HTML / CSS / JavaScript
* DOM 和事件处理
* Fetch 和 HTTP API
* Node.js 后端开发
* SQLite 数据库
* 前后端数据交互
* 输入验证和错误处理
* 环境变量和 API Key 管理
* AI API 调用
* Streaming
* Markdown / LaTeX
* Tool Calling

这个项目主要用于巩固 Web 开发基础，并作为后续学习更复杂 Web + AI 项目的实践基础。