import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = async () => {
  // 1. 获取真正的 cookieStore 对象
  const cookieStore = await cookies()

  return createServerActionClient({
    // 2. 这里加一行注释，强制忽略类型报错，把真正的对象传进去
    // @ts-expect-error: Next.js 15 类型定义冲突，强制传入对象以修复运行时错误
    cookies: () => cookieStore,
  })
}
