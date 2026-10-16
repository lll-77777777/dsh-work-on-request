/**
 * dsh-work-on-request —— 「提问就答，叫了才做」
 *
 * 一个标准的 DSH 插件（Cordis plugin）：不拦工具、不改模型，只把这条行为规则
 * 作为一个**内置技能**注册进 `ctx.skills`。
 *
 * 做法与 DSH 官方的 `@deepseek-ai/dsh-skill-badge` 完全一致：
 *   const inject = ['skills']
 *   function apply(ctx) { ctx.skills.registerProvider(() => provider) }
 *
 * 也就是说：规则不再是散落在磁盘上的 SKILL.md，而是这个 npm 包自带的内容
 * （`assets/work-on-request.md`），跟着包的版本一起走。
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

/** 注册到 `ctx.skills` 的提供方名字。 */
const PROVIDER_NAME = 'work-on-request'

/** 技能名（kebab-case，DSH 的技能名语法要求）。 */
const SKILL_NAME = 'work-on-request'

/** 规则正文：包内的 markdown 文件。 */
const SKILL_BODY_URL = new URL('./assets/work-on-request.md', import.meta.url)

/** 资源根：技能正文里引用的相对路径都以它为准。 */
const RESOURCE_BASE = {
  kind: 'directory',
  path: fileURLToPath(new URL('./assets/', import.meta.url))
}

/**
 * 打包型提供方的标准优先级。
 * 取自 `@deepseek-ai/dsh-skill` 的 `BUNDLED_SKILL_RANK = 600`：
 * 本地 skill 根（100-500）排在它前面，所以用户自己的技能可以覆盖本插件。
 */
const BUNDLED_SKILL_RANK = 600

/**
 * 面向模型的描述：这是模型判断「要不要加载本技能」的唯一依据。
 * （`whenToUse` 在文件型提供方里是单独的 frontmatter 字段，插件候选里没有这个字段，
 *   所以把「什么时候用」直接写进描述。）
 */
const DESCRIPTION =
  '默认只回答问题、不动手：只有用户明确要求时才动手；收到提问式消息（问句、求解释、求评价、闲聊）时不得写文件、改配置、跑有副作用的命令或对外发内容，可在结尾用一句话建议是否值得动手。当用户的消息看起来是在提问、求解释、求看法或闲聊，而没有被明确要求「做点什么」，或者你在回答之外想顺手扩大范围之前，加载本技能。'

/** 目录条目（不需要读正文就能给出）。 */
const CANDIDATE = {
  name: SKILL_NAME,
  description: DESCRIPTION,
  invocation: { modelInvocable: true, userInvocable: true },
  provider: PROVIDER_NAME,
  source: 'bundled',
  resourceBase: RESOURCE_BASE,
  rank: BUNDLED_SKILL_RANK,
  locator: SKILL_BODY_URL
}

/** 技能提供方：`list` 给目录，`get` 按需读正文。 */
const provider = {
  name: PROVIDER_NAME,
  list: () => Promise.resolve([CANDIDATE]),
  async get() {
    return {
      name: CANDIDATE.name,
      description: CANDIDATE.description,
      invocation: CANDIDATE.invocation,
      provider: CANDIDATE.provider,
      source: CANDIDATE.source,
      resourceBase: RESOURCE_BASE,
      content: await readFile(SKILL_BODY_URL, 'utf8')
    }
  }
}

/** Cordis 插件名。 */
const name = 'work-on-request'

/** 需要的服务：技能注册表。 */
const inject = ['skills']

/** 把内置技能注册进技能注册表。 */
function apply(ctx) {
  ctx.skills.registerProvider(() => provider)
}

export { apply, inject, name, provider, CANDIDATE, SKILL_NAME, PROVIDER_NAME, BUNDLED_SKILL_RANK }
