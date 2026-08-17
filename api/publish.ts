import { authError, isAdminRequest } from '../lib/admin-auth'
import { decodeBase64, encodeBase64, githubBranch, githubRequest } from '../lib/github-content'

type PublishBody = {
  title?: string
  date?: string
  tags?: string[]
  pinned?: boolean
  content?: string
  path?: string
}

function encodePath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/')
}

function safeExistingPath(path: string) {
  return path.startsWith('posts/') && path.endsWith('.md') && !path.includes('..')
}

function safeFileName(title: string) {
  const clean = title
    .trim()
    .replace(/[\\/:*?"<>|%#]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
  return clean || 'post'
}

function yamlString(value: string) {
  return JSON.stringify(value)
}

function buildFrontmatter(title: string, date: string, tags: string[], pinned: boolean) {
  return [
    '---',
    `title: ${yamlString(title)}`,
    `date: ${yamlString(date)}`,
    `tags: [${tags.map(yamlString).join(', ')}]`,
    `pinned: ${pinned ? 'true' : 'false'}`,
    '---',
  ].join('\n')
}

function mergeKnownFrontmatter(
  existing: string,
  title: string,
  date: string,
  tags: string[],
  pinned: boolean,
) {
  const match = existing.match(/^---\s*\n([\s\S]*?)\n---\s*\n?[\s\S]*$/)
  if (!match) return buildFrontmatter(title, date, tags, pinned)

  let frontmatter = match[1]
  const replacements: Record<string, string> = {
    title: `title: ${yamlString(title)}`,
    date: `date: ${yamlString(date)}`,
    tags: `tags: [${tags.map(yamlString).join(', ')}]`,
    pinned: `pinned: ${pinned ? 'true' : 'false'}`,
  }

  for (const [key, line] of Object.entries(replacements)) {
    const pattern = new RegExp(`^${key}:.*$`, 'm')
    if (pattern.test(frontmatter)) frontmatter = frontmatter.replace(pattern, line)
    else frontmatter += `\n${line}`
  }

  return `---\n${frontmatter}\n---`
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return authError()

  if (!process.env.BLOG_GITHUB_TOKEN) {
    return Response.json({ ok: false, error: '后台尚未配置 BLOG_GITHUB_TOKEN。' }, { status: 503 })
  }

  let input: PublishBody
  try {
    input = await request.json() as PublishBody
  } catch {
    return Response.json({ ok: false, error: '请求格式不正确。' }, { status: 400 })
  }

  const title = (input.title || '').trim()
  const content = input.content || ''
  const date = (input.date || new Date().toISOString().slice(0, 10)).trim()
  const tags = Array.isArray(input.tags)
    ? input.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 12)
    : []
  const pinned = Boolean(input.pinned)

  if (!title) return Response.json({ ok: false, error: '标题不能为空。' }, { status: 400 })
  if (title.length > 120) return Response.json({ ok: false, error: '标题太长。' }, { status: 400 })
  if (!content.trim()) return Response.json({ ok: false, error: '正文不能为空。' }, { status: 400 })
  if (content.length > 900_000) return Response.json({ ok: false, error: '正文太大。' }, { status: 413 })

  try {
    let path = input.path || ''
    let sha: string | undefined
    let frontmatter: string

    if (path) {
      if (!safeExistingPath(path)) {
        return Response.json({ ok: false, error: '文章路径不合法。' }, { status: 400 })
      }
      const currentResponse = await githubRequest(`/contents/${encodePath(path)}?ref=${encodeURIComponent(githubBranch)}`)
      const current = await currentResponse.json() as { sha: string; content?: string }
      sha = current.sha
      const existing = decodeBase64(current.content || '')
      frontmatter = mergeKnownFrontmatter(existing, title, date, tags, pinned)
    } else {
      path = `posts/${safeFileName(title)}-${Date.now()}.md`
      frontmatter = buildFrontmatter(title, date, tags, pinned)
    }

    const markdown = `${frontmatter}\n\n${content.trim()}\n`
    const body: Record<string, unknown> = {
      message: `${input.path ? 'Update' : 'Publish'}: ${title}`,
      content: encodeBase64(markdown),
      branch: githubBranch,
    }
    if (sha) body.sha = sha

    const response = await githubRequest(`/contents/${encodePath(path)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
    const result = await response.json() as { commit?: { sha?: string } }

    return Response.json({
      ok: true,
      path,
      commitSha: result.commit?.sha || '',
      articlePath: `/${path.replace(/\.md$/, '.html')}`,
      message: '文章已经提交，Vercel 会自动发布最新版本。',
    })
  } catch (error) {
    console.error(error)
    return Response.json({ ok: false, error: '发布失败，请检查服务端 GitHub 权限。' }, { status: 502 })
  }
}
