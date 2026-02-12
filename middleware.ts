import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // 创建 Supabase 客户端，专门用于在中间件里刷新 Session
  const supabase = createMiddlewareClient({ req, res })

  // 这一步非常重要：它会检查并刷新用户的 Session Cookie
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 如果用户已登录，且访问的是 /login，这行代码会把他踢到首页（可选）
  // if (session && req.nextUrl.pathname === '/login') {
  //   return NextResponse.redirect(new URL('/', req.url))
  // }

  return res
}

// 匹配所有路径，除了静态资源
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
