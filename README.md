# EhTag Editor

[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=EhTagTranslation/Editor)](https://dependabot.com)
[![build](https://github.com/EhTagTranslation/Editor/workflows/build/badge.svg)](https://github.com/EhTagTranslation/Editor/actions?query=workflow%3Abuild)
[![vercel](https://img.shields.io/github/deployments/EhTagTranslation/Editor/Production?label=Vercel&logo=zeit)](https://github.com/EhTagTranslation/Editor/deployments)
[![frontend](https://img.shields.io/website?label=frontend&logo=angular&url=https://ehtt.now.sh)](https://ehtt.now.sh/)
[![backend](https://img.shields.io/website?label=backend&logo=nestjs&url=https://ehtt.azurewebsites.net/database)](https://ehtt.azurewebsites.net/)

[数据库](../../../Database)编辑工具。

## 项目架构

### 公共类

代码位于 [shared](./src/shared)，包含了对数据库内容进行处理的相关类型。

### 前端

代码位于 [browser](./src/browser)，使用 Angular 开发，使用 Vercel 部署于 <https://ehtt.now.sh>。

使用方法参见[使用说明](../../wiki)。

### 后端

代码位于 [server](./src/server)，使用 Nest.js 开发，使用 Azure App Service 部署于 <https://ehtt.azurewebsites.net>。

使用方法参见 [API 列表](https://ehtt.azurewebsites.net/static/index.html)。

### 工具

代码位于 [tool](./src/tool)，使用 GitHub Actions 发布于 [GitHub Release](https://github.com/EhTagTranslation/Editor/releases)。

使用说明可通过 `node tool --help` 命令获取。
