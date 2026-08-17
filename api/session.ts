import { authError, isAdminRequest } from '../lib/admin-auth'

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return authError()

  return Response.json({
    ok: true,
    githubConfigured: Boolean(process.env.BLOG_GITHUB_TOKEN),
  })
}
