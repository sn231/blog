const owner = 'sn231'
const repo = 'blog'
const branch = 'main'
const apiBase = `https://api.github.com/repos/${owner}/${repo}`

function token() {
  const value = process.env.BLOG_GITHUB_TOKEN
  if (!value) throw new Error('BLOG_GITHUB_TOKEN_NOT_CONFIGURED')
  return value
}

export async function githubRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token()}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GITHUB_${response.status}:${text.slice(0, 500)}`)
  }

  return response
}

export function encodeBase64(value: string) {
  return Buffer.from(value, 'utf8').toString('base64')
}

export function decodeBase64(value: string) {
  return Buffer.from(value.replace(/\n/g, ''), 'base64').toString('utf8')
}

export const githubBranch = branch
