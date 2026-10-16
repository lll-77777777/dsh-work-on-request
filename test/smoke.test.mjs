import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import {
  apply,
  inject,
  name,
  provider,
  CANDIDATE,
  SKILL_NAME,
  PROVIDER_NAME,
  BUNDLED_SKILL_RANK
} from '../index.js'

test('插件元数据是合法的 Cordis plugin', () => {
  assert.equal(name, 'work-on-request')
  assert.deepEqual(inject, ['skills'])
  assert.equal(typeof apply, 'function')
})

test('技能名符合 DSH 的 kebab-case 语法', () => {
  assert.match(SKILL_NAME, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  assert.equal(CANDIDATE.name, SKILL_NAME)
  assert.equal(CANDIDATE.provider, PROVIDER_NAME)
})

test('list() 给出目录条目，且不含正文', async () => {
  const list = await provider.list()
  assert.equal(list.length, 1)
  const [c] = list
  assert.equal(c.name, SKILL_NAME)
  assert.ok(c.description.length > 40, 'description 要足够长，模型才判断得准')
  assert.deepEqual(c.invocation, { modelInvocable: true, userInvocable: true })
  assert.equal(c.source, 'bundled')
  assert.equal(c.rank, BUNDLED_SKILL_RANK)
  assert.equal(typeof c.resourceBase.path, 'string')
  assert.equal(c.content, undefined, '目录条目不该带正文')
})

test('get() 按需读正文，内容与 assets 里的文件一致', async () => {
  const loaded = await provider.get(CANDIDATE, { signal: undefined })
  const onDisk = await readFile(new URL('../assets/work-on-request.md', import.meta.url), 'utf8')
  assert.equal(loaded.content, onDisk)
  assert.equal(loaded.name, SKILL_NAME)
  assert.equal(loaded.description, CANDIDATE.description)
  assert.ok(loaded.content.includes('提问就答，叫了才做'))
  assert.ok(loaded.content.length > 500)
})

test('apply(ctx) 会把提供方注册到 ctx.skills', () => {
  let registered = null
  const ctx = {
    skills: {
      registerProvider(factory) {
        registered = factory()
      }
    }
  }
  apply(ctx)
  assert.ok(registered, 'apply 必须注册一个提供方')
  assert.equal(registered.name, PROVIDER_NAME)
})

test('注册进去的提供方和导出的提供方是同一个能力（契约一致）', async () => {
  let registered = null
  apply({ skills: { registerProvider: (factory) => { registered = factory() } } })
  const list = await registered.list()
  assert.equal(list.length, 1)
  const loaded = await registered.get(list[0], { signal: undefined })
  assert.ok(loaded.content.includes('只回答'))
})
