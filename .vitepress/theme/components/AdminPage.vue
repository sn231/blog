<template>
  <div class="admin-shell">
    <header class="admin-topbar">
      <a class="admin-brand" href="/">
        <span class="brand-mark">SL</span>
        <span>Snow Love 后台</span>
      </a>
      <a class="back-link" href="/">返回博客 ↗</a>
    </header>

    <main v-if="!authenticated" class="login-wrap">
      <section class="login-card">
        <span class="eyebrow">PRIVATE EDITOR</span>
        <h1>写文章，不用再打开 GitHub</h1>
        <p>输入管理员密码后，就可以在这里新建、修改并发布文章。</p>
        <form @submit.prevent="login">
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="管理员密码"
            autofocus
          />
          <button type="submit" :disabled="loggingIn">
            {{ loggingIn ? '正在验证…' : '进入后台' }}
          </button>
        </form>
        <p v-if="loginError" class="error-text">{{ loginError }}</p>
      </section>
    </main>

    <main v-else class="workspace">
      <aside class="post-sidebar">
        <div class="sidebar-head">
          <div>
            <span class="eyebrow">ARTICLES</span>
            <strong>文章</strong>
          </div>
          <button class="new-button" type="button" @click="newPost">＋ 新建</button>
        </div>

        <input v-model="postFilter" class="filter-input" placeholder="搜索文件名" />

        <div v-if="loadingPosts" class="empty-state">正在读取文章…</div>
        <div v-else-if="!filteredPosts.length" class="empty-state">没有找到文章</div>
        <button
          v-for="post in filteredPosts"
          :key="post.path"
          type="button"
          class="post-item"
          :class="{ active: selectedPath === post.path }"
          @click="loadPost(post.path)"
        >
          <span>{{ post.name }}</span>
        </button>
      </aside>

      <section class="editor-area">
        <div class="editor-header">
          <div>
            <span class="eyebrow">{{ selectedPath ? 'EDIT ARTICLE' : 'NEW ARTICLE' }}</span>
            <h1>{{ selectedPath ? '编辑文章' : '新建文章' }}</h1>
          </div>
          <div class="publish-actions">
            <span v-if="saveMessage" class="save-message" :class="{ error: saveError }">
              {{ saveMessage }}
            </span>
            <button class="publish-button" type="button" :disabled="publishing" @click="publishPost">
              {{ publishing ? '正在发布…' : '发布文章' }}
            </button>
          </div>
        </div>

        <div v-if="!githubConfigured" class="config-warning">
          后台界面已经可用，但服务端还没有配置 GitHub 写入凭据；配置后才能真正发布。
        </div>

        <div class="meta-grid">
          <label class="field title-field">
            <span>标题</span>
            <input v-model="title" placeholder="文章标题" />
          </label>
          <label class="field">
            <span>日期</span>
            <input v-model="date" type="date" />
          </label>
          <label class="field tags-field">
            <span>标签</span>
            <input v-model="tagsText" placeholder="例如：技术, VitePress, 随笔" />
          </label>
          <label class="pin-field">
            <input v-model="pinned" type="checkbox" />
            <span>置顶文章</span>
          </label>
        </div>

        <div class="toolbar">
          <button type="button" @click="insertText('## ', '')">H2</button>
          <button type="button" @click="wrapText('**', '**')"><b>B</b></button>
          <button type="button" @click="wrapText('`', '`')">Code</button>
          <button type="button" @click="insertText('> ', '')">引用</button>
          <button type="button" @click="insertText('- ', '')">列表</button>
          <button type="button" @click="wrapText('[', '](https://)')">链接</button>
          <button type="button" @click="insertText('![图片说明](https://)', '')">图片</button>
        </div>

        <div class="writing-grid">
          <div class="pane editor-pane">
            <div class="pane-title">Markdown</div>
            <textarea
              ref="editorRef"
              v-model="content"
              spellcheck="false"
              placeholder="从这里开始写正文……"
            ></textarea>
          </div>
          <div class="pane preview-pane">
            <div class="pane-title">预览</div>
            <article class="markdown-preview" v-html="previewHtml"></article>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type PostListItem = { name: string; path: string; sha: string }

const password = ref('')
const authenticated = ref(false)
const loggingIn = ref(false)
const loginError = ref('')
const githubConfigured = ref(true)
const posts = ref<PostListItem[]>([])
const loadingPosts = ref(false)
const postFilter = ref('')
const selectedPath = ref('')
const title = ref('')
const date = ref(today())
const tagsText = ref('')
const pinned = ref(false)
const content = ref('')
const publishing = ref(false)
const saveMessage = ref('')
const saveError = ref(false)
const editorRef = ref<HTMLTextAreaElement | null>(null)

function today() {
  return new Date().toISOString().slice(0, 10)
}

function authHeaders(json = false) {
  const headers: Record<string, string> = { Authorization: `Bearer ${password.value}` }
  if (json) headers['Content-Type'] = 'application/json'
  return headers
}

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({ ok: false, error: '服务器返回了无法识别的内容。' }))
  if (!response.ok || !data.ok) throw new Error(data.error || '请求失败。')
  return data
}

async function login() {
  loggingIn.value = true
  loginError.value = ''
  try {
    const response = await fetch('/api/session', { method: 'POST', headers: authHeaders() })
    const data = await readJson(response)
    githubConfigured.value = Boolean(data.githubConfigured)
    authenticated.value = true
    sessionStorage.setItem('snowlove-admin-password', password.value)
    await loadPosts()
  } catch (error) {
    loginError.value = error instanceof Error ? error.message : '登录失败。'
    authenticated.value = false
  } finally {
    loggingIn.value = false
  }
}

async function loadPosts() {
  loadingPosts.value = true
  try {
    const response = await fetch('/api/posts', { headers: authHeaders() })
    const data = await readJson(response)
    posts.value = data.posts || []
  } catch (error) {
    saveError.value = true
    saveMessage.value = error instanceof Error ? error.message : '读取文章失败。'
  } finally {
    loadingPosts.value = false
  }
}

async function loadPost(path: string) {
  saveMessage.value = ''
  saveError.value = false
  try {
    const response = await fetch(`/api/posts?path=${encodeURIComponent(path)}`, { headers: authHeaders() })
    const data = await readJson(response)
    selectedPath.value = data.path
    title.value = data.title || data.path.replace(/^posts\//, '').replace(/\.md$/, '')
    date.value = data.date || today()
    tagsText.value = Array.isArray(data.tags) ? data.tags.join(', ') : ''
    pinned.value = Boolean(data.pinned)
    content.value = data.body || ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    saveError.value = true
    saveMessage.value = error instanceof Error ? error.message : '读取文章失败。'
  }
}

function newPost() {
  selectedPath.value = ''
  title.value = ''
  date.value = today()
  tagsText.value = ''
  pinned.value = false
  content.value = ''
  saveMessage.value = ''
  saveError.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function publishPost() {
  saveMessage.value = ''
  saveError.value = false

  if (!title.value.trim()) {
    saveError.value = true
    saveMessage.value = '先写标题。'
    return
  }
  if (!content.value.trim()) {
    saveError.value = true
    saveMessage.value = '正文还是空的。'
    return
  }

  publishing.value = true
  try {
    const response = await fetch('/api/publish', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({
        title: title.value.trim(),
        date: date.value || today(),
        tags: tagsText.value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
        pinned: pinned.value,
        content: content.value,
        path: selectedPath.value || undefined,
      }),
    })
    const data = await readJson(response)
    selectedPath.value = data.path
    saveMessage.value = '已提交发布，Vercel 正在自动更新博客。'
    saveError.value = false
    await loadPosts()
  } catch (error) {
    saveError.value = true
    saveMessage.value = error instanceof Error ? error.message : '发布失败。'
  } finally {
    publishing.value = false
  }
}

function replaceSelection(before: string, after: string) {
  const textarea = editorRef.value
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = content.value.slice(start, end)
  content.value = `${content.value.slice(0, start)}${before}${selected}${after}${content.value.slice(end)}`
  requestAnimationFrame(() => {
    textarea.focus()
    textarea.selectionStart = start + before.length
    textarea.selectionEnd = end + before.length
  })
}

function wrapText(before: string, after: string) {
  replaceSelection(before, after)
}

function insertText(before: string, after: string) {
  replaceSelection(before, after)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function inlineMarkdown(value: string) {
  return value
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, '<img alt="$1" src="$2" loading="lazy">')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
}

const previewHtml = computed(() => {
  const source = escapeHtml(content.value || '正文预览会显示在这里。')
  const lines = source.split('\n')
  const html: string[] = []
  let inCode = false
  let inList = false

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push(inCode ? '</code></pre>' : '<pre><code>')
      inCode = !inCode
      continue
    }
    if (inCode) {
      html.push(`${line}\n`)
      continue
    }

    const listMatch = line.match(/^\s*-\s+(.+)/)
    if (listMatch) {
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${inlineMarkdown(listMatch[1])}</li>`)
      continue
    }
    if (inList) {
      html.push('</ul>')
      inList = false
    }

    const heading = line.match(/^(#{1,4})\s+(.+)/)
    if (heading) {
      const level = heading[1].length
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`)
    } else if (/^&gt;\s?/.test(line)) {
      html.push(`<blockquote>${inlineMarkdown(line.replace(/^&gt;\s?/, ''))}</blockquote>`)
    } else if (!line.trim()) {
      html.push('<div class="preview-gap"></div>')
    } else {
      html.push(`<p>${inlineMarkdown(line)}</p>`)
    }
  }

  if (inList) html.push('</ul>')
  if (inCode) html.push('</code></pre>')
  return html.join('')
})

const filteredPosts = computed(() => {
  const query = postFilter.value.trim().toLowerCase()
  if (!query) return posts.value
  return posts.value.filter((post) => post.name.toLowerCase().includes(query))
})

onMounted(async () => {
  const stored = sessionStorage.getItem('snowlove-admin-password')
  if (!stored) return
  password.value = stored
  await login()
})
</script>

<style scoped lang="less">
.admin-shell {
  min-height: 100vh;
  padding: 22px;
  box-sizing: border-box;
  color: var(--font-color-grey);
}

.admin-topbar {
  max-width: 1440px;
  height: 64px;
  margin: 0 auto 22px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  border: 1px solid var(--foreground-color);
  border-radius: 22px;
  background: rgb(var(--blue-shadow-color), 0.08);
  backdrop-filter: blur(18px);
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--font-color-grey);
  font-weight: 700;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  color: var(--foreground-color);
  background: var(--color-blue);
  box-shadow: 0 0 12px rgb(var(--blue-shadow-color), 0.6);
}

.back-link {
  color: var(--color-blue);
  font-size: 14px;
}

.login-wrap {
  min-height: calc(100vh - 130px);
  display: grid;
  place-items: center;
}

.login-card {
  width: min(480px, calc(100vw - 44px));
  padding: 36px;
  box-sizing: border-box;
  border: 1px solid var(--foreground-color);
  border-radius: 28px;
  background: var(--general-background-color);
  box-shadow: 0 20px 80px rgb(var(--blue-shadow-color), 0.18);

  h1 {
    margin: 8px 0 12px;
    font-size: 30px;
  }

  p {
    line-height: 1.7;
  }

  form {
    display: flex;
    gap: 10px;
    margin-top: 24px;
  }

  input {
    flex: 1;
  }
}

.workspace {
  max-width: 1440px;
  min-height: calc(100vh - 110px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 18px;
}

.post-sidebar,
.editor-area {
  border: 1px solid var(--foreground-color);
  border-radius: 24px;
  background: color-mix(in srgb, var(--general-background-color) 88%, transparent);
  backdrop-filter: blur(16px);
  box-shadow: 0 14px 60px rgb(var(--blue-shadow-color), 0.1);
}

.post-sidebar {
  padding: 18px;
  max-height: calc(100vh - 110px);
  overflow: auto;
  box-sizing: border-box;
}

.sidebar-head,
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.sidebar-head strong {
  display: block;
  margin-top: 4px;
  font-size: 21px;
}

.eyebrow {
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--color-blue);
}

button,
input,
textarea {
  font: inherit;
}

input,
textarea {
  border: 1px solid color-mix(in srgb, var(--font-color-grey) 18%, transparent);
  border-radius: 12px;
  outline: none;
  color: var(--font-color-grey);
  background: color-mix(in srgb, var(--foreground-color) 76%, transparent);
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: var(--color-blue);
    box-shadow: 0 0 0 3px rgb(var(--blue-shadow-color), 0.12);
  }
}

button {
  border: 0;
  cursor: pointer;
}

.new-button,
.publish-button,
.login-card button {
  padding: 10px 15px;
  border-radius: 12px;
  color: white;
  background: var(--color-blue);
  font-weight: 700;
}

button:disabled {
  cursor: progress;
  opacity: 0.6;
}

.login-card input,
.filter-input {
  padding: 11px 13px;
}

.filter-input {
  width: 100%;
  margin: 16px 0 10px;
  box-sizing: border-box;
}

.post-item {
  width: 100%;
  padding: 11px 12px;
  margin-top: 4px;
  border-radius: 10px;
  text-align: left;
  color: var(--font-color-grey);
  background: transparent;

  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover,
  &.active {
    background: rgb(var(--blue-shadow-color), 0.12);
    color: var(--color-blue);
  }
}

.empty-state {
  padding: 24px 8px;
  text-align: center;
  opacity: 0.65;
}

.editor-area {
  min-width: 0;
  padding: 24px;
  box-sizing: border-box;
}

.editor-header {
  margin-bottom: 20px;

  h1 {
    margin: 4px 0 0;
    font-size: 28px;
  }
}

.publish-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.save-message {
  max-width: 360px;
  font-size: 13px;
  color: #3aa76d;

  &.error {
    color: #d85a66;
  }
}

.config-warning {
  padding: 12px 14px;
  margin-bottom: 18px;
  border: 1px solid #d9a441;
  border-radius: 12px;
  background: rgb(217, 164, 65, 0.1);
  font-size: 13px;
}

.meta-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) 160px;
  gap: 12px;
  margin-bottom: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;

  span {
    font-size: 12px;
    opacity: 0.7;
  }

  input {
    min-width: 0;
    padding: 11px 12px;
  }
}

.tags-field {
  grid-column: 1 / 2;
}

.pin-field {
  display: flex;
  align-items: center;
  align-self: end;
  gap: 8px;
  min-height: 42px;
  font-size: 13px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 12px;
  background: rgb(var(--blue-shadow-color), 0.08);

  button {
    padding: 7px 10px;
    border-radius: 8px;
    color: var(--font-color-grey);
    background: var(--foreground-color);
  }
}

.writing-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  min-height: 600px;
}

.pane {
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--font-color-grey) 14%, transparent);
  border-radius: 16px;
  background: color-mix(in srgb, var(--foreground-color) 78%, transparent);
}

.pane-title {
  padding: 10px 13px;
  border-bottom: 1px solid color-mix(in srgb, var(--font-color-grey) 12%, transparent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  opacity: 0.68;
}

.editor-pane textarea {
  flex: 1;
  min-height: 560px;
  padding: 18px;
  border: 0;
  border-radius: 0;
  resize: vertical;
  box-shadow: none;
  line-height: 1.75;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 14px;
  background: transparent;
}

.markdown-preview {
  flex: 1;
  min-height: 560px;
  padding: 18px 22px;
  overflow: auto;
  line-height: 1.8;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    margin: 1.25em 0 0.55em;
    line-height: 1.35;
  }

  :deep(p) {
    margin: 0.65em 0;
  }

  :deep(blockquote) {
    margin: 1em 0;
    padding: 8px 14px;
    border-left: 3px solid var(--color-blue);
    background: rgb(var(--blue-shadow-color), 0.07);
  }

  :deep(code) {
    padding: 2px 5px;
    border-radius: 5px;
    background: rgb(var(--blue-shadow-color), 0.1);
  }

  :deep(pre) {
    overflow: auto;
    padding: 14px;
    border-radius: 12px;
    background: #16202a;
    color: #e8edf2;
  }

  :deep(pre code) {
    padding: 0;
    background: transparent;
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 12px;
  }

  :deep(a) {
    color: var(--color-blue);
  }

  :deep(ul) {
    list-style: disc;
    padding-left: 1.5em;
  }

  :deep(.preview-gap) {
    height: 0.35em;
  }
}

.error-text {
  color: #d85a66;
}

@media (max-width: 900px) {
  .admin-shell {
    padding: 12px;
  }

  .admin-topbar {
    margin-bottom: 12px;
  }

  .workspace {
    grid-template-columns: 1fr;
  }

  .post-sidebar {
    max-height: 280px;
  }

  .writing-grid {
    grid-template-columns: 1fr;
  }

  .editor-header,
  .publish-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .meta-grid {
    grid-template-columns: 1fr;
  }

  .tags-field {
    grid-column: auto;
  }

  .pin-field {
    align-self: start;
  }
}
</style>
