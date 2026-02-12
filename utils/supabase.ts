import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// --- 侦探代码开始 ---
console.log("正在检查环境变量...")
console.log("URL:", supabaseUrl ? "读取到了 (以 " + supabaseUrl.slice(0, 10) + "... 开头)" : "🔴 空的！没读到！")
console.log("KEY:", supabaseKey ? "读取到了" : "🔴 空的！没读到！")
// --- 侦探代码结束 ---

if (!supabaseUrl || !supabaseKey) {
  throw new Error("环境变量缺失！请检查 .env.local 文件")
}

export const supabase = createClient(supabaseUrl, supabaseKey)
