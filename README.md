# dsh-work-on-request

> **提问就答，叫了才做。**

一个 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 插件：**默认只回答问题，只有你明确让它干活时才动手。**

## 它解决的问题

模型很容易"顺手"多做事：你只是问个问题，它却顺手改了文件、补了测试、`git commit` 了、装了依赖、调了配置，甚至替你做决定。这个插件把这条边界写成一条常驻规则：

- **提问**（问句、求解释、求评价、闲聊）→ 只回答，不碰任何东西；
- **明确让干活**（"帮我写…"、"改一下"、"去跑一轮"、"修复"）→ 正常动手，干完简短汇报「做了什么 + 怎么验证的」；
- **分不清** → 先给答案，末尾用**一句话**问要不要做；
- **只读不算干活**：为了回答问题所需的读文件、搜索、查状态、算数照旧可以做。

规则全文（模型实际读到的那份）：[`assets/work-on-request.md`](./assets/work-on-request.md)。

## 为什么是插件，不是 skill 文件

插件只做一件事：把上面那份规则作为一个**内置技能**注册进 DSH 的技能注册表。

做法与 DSH 官方的 `@deepseek-ai/dsh-skill-badge` 完全一致 ——

```js
const inject = ['skills']
function apply(ctx) {
  ctx.skills.registerProvider(() => provider)
}
```

好处：规则随 **npm 包版本**一起走，不再需要在 `~/.dsh/skills/`、工作区里放散落的 `SKILL.md`；装一次，这台机器上所有工作区都生效。

## 安装

```bash
# 从 npm（发布后）
dsh plugin --profile desktop add dsh-work-on-request

# 本地开发（link 到本目录）
dsh plugin --profile desktop add link:/path/to/dsh-work-on-request
```

装完新开一个会话：

- **人肉触发**：在输入框打 `/`，菜单里会出现 `work-on-request`（或直接打 `/work-on-request` 回车）；
- **自动触发**：模型判断当前消息符合描述时，会自己加载它。

## 覆盖与优先级

本插件以 **rank 600**（打包型提供方的标准优先级）注册，低于本地 skill 根（100–500）。也就是说：

- 你自己在 `~/.dsh/skills/` 或项目的 `.dsh/skills/` 里放的**同名**技能会覆盖它；
- 想让规则**常驻**（不走"按需加载"），把 `assets/work-on-request.md` 的内容贴进 `~/.dsh/AGENTS.md` 即可。

## 开发与自测

```bash
node --check index.js
node test/smoke.test.mjs     # 6 项契约测试
```

> 注意：在 DSH 的受限沙箱里 `node --test test/` 会因为子进程管道被拒（`spawn EPERM`）失败，直接跑测试文件即可（`node:test` 在同一进程里也能出报告）。

## 状态

- ✅ `node --check`、`node test/smoke.test.mjs` 全部通过（提供方契约、技能名语法、正文一致性、`apply` 注册行为）。
- ⏳ 尚未在真实 harness 里挂载跑通（待补一条端到端验证记录）。

## English (short)

`dsh-work-on-request` is a tiny DSH plugin that registers one bundled skill: **answer questions, don't act unless explicitly asked.** It mirrors the official `@deepseek-ai/dsh-skill-badge` provider pattern and ships the rules in `assets/work-on-request.md`.

```bash
dsh plugin --profile desktop add dsh-work-on-request
```

## License

MIT
