/**
 * @file app/[locale]/auth/callback/route.ts
 * @description 处理 OAuth 登录回调的路由。
 */

// 删除了 'createServerClient' 和 'cookies' 的直接导入
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// 新增：从我们创建的服务端工具中导入 createClient
import { createClient } from '@/lib/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    // 关键改动：使用新的、封装好的函数来创建客户端
    // 注意这里必须使用 await
    const supabase = await createClient()

    // 交换授权码以获取会话
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 成功后，重定向到用户最初所在的页面
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 如果失败，记录错误并重定向到错误页面
  console.error('Authentication failed: No code found or exchange failed.')
  return NextResponse.redirect(`${origin}/auth-error`)
}
