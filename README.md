# 个人主页留言板

这是我学习 Web 开发过程中完成的一个小项目。

## 项目简介

这是一个简单的个人主页 + 留言板，前端使用 HTML、CSS 和 JavaScript，后端使用 Node.js，数据使用 SQLite 保存。

通过这个项目练习了前后端交互、HTTP 请求、API、数据库等 Web 开发基础。

## 技术栈

* HTML
* CSS
* JavaScript
* Node.js
* SQLite
* better-sqlite3

## 项目结构

```text
.
├── index.html
├── script.js
├── images/
└── server/
    ├── server.js
    ├── package.json
    └── package-lock.json
```

## 运行项目

### 1. 安装后端依赖

进入 `server` 目录：

```bash
npm install
```

### 2. 启动后端服务器

```bash
node server.js
```

服务器运行在：

```text
http://localhost:3001
```

### 3. 启动前端

使用本地 HTTP 服务器打开项目，例如 VS Code 的 Live Server。

前端运行在：

```text
http://127.0.0.1:3000
```

## 目前实现的功能

* 个人主页
* 留言提交
* 留言数据保存到 SQLite
* 留言列表读取
* 前后端 API 交互
* 基本的输入验证和错误处理

## 学习记录

这个项目主要用于学习 Web 开发基础，后续会继续学习并开发更完整的 Web + AI 项目。
