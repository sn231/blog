import { timingSafeEqual } from 'node:crypto'

export const hasAdminPassword = () => Boolean(process.env.BLOG_ADMIN_PASSWORD)

export function isAdminRequest(request: Request) {
  const expected = process.env.BLOG_ADMIN_PASSWORD
  if (!expected) return false

  const authorization = request.headers.get('authorization') || ''
  const supplied = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!supplied) return false

  const a = Buffer.from(supplied)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function authError() {
  if (!hasAdminPassword()) {
    return Response.json(
      { ok: false, error: '后台尚未配置 BLOG_ADMIN_PASSWORD。' },
      { status: 503 },
    )
  }

  return Response.json({ ok: false, error: '管理员密码不正确。' }, { status: 401 })
}
