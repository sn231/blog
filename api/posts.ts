import { authError, isAdminRequest } from '../lib/admin-auth'
import { decodeBase64, githubBranch, githubRequest } from '../lib/github-content'

function safePostPath(path: string) {
  return path.startsWith('posts/') && path.endsWith('.md') && !path.includes('..')
}

function encodePath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/')
}

function unquote(value: string) {
  const trimmed = value.trim()
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return trimmed.slice(1, -1)
    }
  }
  return trimmed
}

function parsePost(markdown: string) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!match) return { title: '', date: '', tags: [], pinned: false, body: markdown }

  const frontmatter = match[1]
  const body = match[2]
  const title = unquote(frontmatter.match(/^title:\s*(.+)$/m)?.[1] || '')
  const date = unquote(frontmatter.match(/^date:\s*(.+)$/m)?.[1] || '')
  const pinnedRaw = unquote(frontmatter.match(/^pinned:\s*(.+)$/m)?.[1] || 'false')
  const tagsRaw = frontmatter.match(/^tags:\s*\[(.*)\]\s*$/m)?.[1] || ''
  const tags = tagsRaw
    ? tagsRaw.split(',').map((tag) => unquote(tag)).filter(Boolean)
    : []

  return { title, date, tags, pinned: pinnedRaw === 'true', body }
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return authError()

  if (!process.env.BLOG_GITHUB_TOKEN) {
    return Response.json({ ok: false, error: '后台尚未配置 BLOG_GITHUB_TOKEN。' }, { status: 503 })
  }

  const url = new URL(request.url)
  const path = url.searchParams.get('path')

  try {
    if (path) {
      if (!safePostPath(path)) {
        return Response.json({ ok: false, error: '文章路径不合法。' }, { status: 400 })
      }

      const response = await githubRequest(`/contents/${encodePath(path)}?ref=${encodeURIComponent(githubBranch)}`)
      const file = await response.json() as { content?: string; sha: string; path: string }
      const markdown = decodeBase64(file.content || '')
      return Response.json({ ok: true, path: file.path, sha: file.sha, ...parsePost(markdown) })
    }

    const response = await githubRequest(`/contents/posts?ref=${encodeURIComponent(githubBranch)}`)
    const files = await response.json() as Array<{ name: string; path: string; sha: string; type: string }>
    const posts = files
      .filter((file) => file.type === 'file' && file.name.endsWith('.md'))
      .map((file) => ({ name: file.name.replace(/\.md$/, ''), path: file.path, sha: file.sha }))
      .reverse()

    return Response.json({ ok: true, posts })
  } catch (error) {
    console.error(error)
    return Response.json({ ok: false, error: '读取文章失败，请检查 GitHub 写入权限。' }, { status: 502 })
  }
}
