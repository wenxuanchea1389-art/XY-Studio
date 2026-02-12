import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createOrder } from './actions/order' 
import { signOut } from './login/actions'

export default async function Home() {
  const supabase = await createClient()

  // 1. 检查用户是否登录
  const { data: { user } } = await supabase.auth.getUser()
  
  // 2. 如果没登录，强制踢去登录页
  if (!user) {
    redirect('/login')
  }

  // 3. 如果登录了，显示下单界面
  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 font-sans pb-10">
      
      {/* --- 顶部 Logo 区域 --- */}
      <div className="relative pt-10 pb-6 flex flex-col items-center">
        <div className="w-28 h-28 p-1 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 shadow-xl shadow-purple-900/40 mb-4">
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#0f111a] bg-gray-800">
            {/* ✅ 这里引用你的 Logo 图片 */}
            <img 
              src="/logo.png" 
              alt="俱乐部 Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-wide">
          星映俱乐部
        </h1>
        <p className="text-purple-400/80 text-xs mt-1 uppercase tracking-widest">
          XY Studio
        </p>
      </div>

      <div className="max-w-md mx-auto px-4">
        
        {/* --- 顶部状态栏 --- */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 mb-6 flex justify-between items-center border border-gray-700/50 shadow-lg">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Current User</span>
            <span className="text-sm font-mono text-purple-200">{user.phone}</span>
          </div>
          <form action={signOut}>
            <button className="text-xs bg-gray-700 hover:bg-red-500/20 hover:text-red-300 text-gray-300 px-3 py-1.5 rounded-lg transition-all border border-gray-600">
              退出登录
            </button>
          </form>
        </div>

        {/* --- ✅ 图片价目表 (可折叠) --- */}
        <details className="mb-6 bg-gray-800/80 rounded-xl border border-gray-700 overflow-hidden group shadow-lg">
            <summary className="cursor-pointer p-4 text-sm font-medium text-purple-300 flex justify-between items-center select-none hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-2">
                    <span>📄 点击查看详细价目表</span>
                    <span className="text-[10px] text-gray-500 bg-gray-900 px-2 py-0.5 rounded-full border border-gray-700">Recommended</span>
                </div>
                <span className="group-open:rotate-180 transition-transform duration-300 text-gray-500">▼</span>
            </summary>
            
            {/* 展开区域：显示你的价格表图片 */}
            <div className="border-t border-gray-700 bg-gray-900/50">
                <img 
                    src="/price.jpg" 
                    alt="详细价格表" 
                    className="w-full h-auto block" 
                />
            </div>
        </details>

        {/* --- 下单表单 --- */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700/50 relative overflow-hidden">
          {/* 背景装饰光效 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-[50px] rounded-full pointer-events-none"></div>

          <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-white">
            <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
            老板，开始点单吧
          </h2>

          <form action={createOrder} className="space-y-5">
            
            {/* 1. 游戏类型 */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">游戏平台</label>
              <select name="gameCategory" className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-3 h-11 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all">
                <option value="mobile">📱 手游 (Mobile)</option>
                <option value="pc">💻 端游 (PC)</option>
              </select>
            </div>

            {/* 2. 游戏名称 (手动输入) */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">游戏名称</label>
              <input 
                type="text" 
                name="gameName" 
                placeholder="例如：Valorant，王者荣耀，打字聊天" 
                required
                className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 h-11 text-sm placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              />
            </div>

            {/* 3. 时长与性别 (左右布局，高度严格对齐) */}
            <div className="grid grid-cols-2 gap-4">
              {/* 左侧：时长 */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">时长 / 局数</label>
                <div className="flex h-11">
                  {/* 数字输入：允许小数 */}
                  <input 
                    type="number" 
                    name="durationCount" 
                    defaultValue="1" 
                    min="0.5" 
                    step="0.5"
                    className="w-full bg-gray-900/50 border border-gray-600 border-r-0 rounded-l-xl px-3 text-center text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all z-10"
                  />
                  {/* 单位选择 */}
                  <select 
                    name="durationUnit" 
                    className="bg-gray-800 border border-gray-600 rounded-r-xl px-2 text-sm text-gray-300 focus:border-purple-500 outline-none transition-all"
                  >
                    <option value="hour">小时</option>
                    <option value="round">局</option>
                  </select>
                </div>
              </div>
              
              {/* 右侧：性别 */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">性别要求</label>
                <select name="gender" className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-3 h-11 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all">
                  <option value="female">👧 小姐姐</option>
                  <option value="male">👦 小哥哥</option>
                  <option value="any">🎲 不限</option>
                </select>
              </div>
            </div>

            {/* 4. 模式选择 */}
            <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-700/50">
              <label className="block text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">服务模式</label>
              
              <div className="flex gap-4 mb-4">
                 <label className="flex-1 cursor-pointer">
                    <input type="radio" name="mode" value="entertainment" defaultChecked className="peer hidden" />
                    <div className="h-10 flex items-center justify-center rounded-lg border border-gray-600 text-sm text-gray-400 peer-checked:bg-purple-600 peer-checked:text-white peer-checked:border-purple-500 transition-all">
                        🎮 娱乐单
                    </div>
                 </label>
                 <label className="flex-1 cursor-pointer">
                    <input type="radio" name="mode" value="skill" className="peer hidden" />
                    <div className="h-10 flex items-center justify-center rounded-lg border border-gray-600 text-sm text-gray-400 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-500 transition-all">
                        🏆 技术单
                    </div>
                 </label>
              </div>

              <div className="pt-3 border-t border-gray-700/50">
                 <label className="flex items-center space-x-3 cursor-pointer group select-none">
                    <div className="relative flex items-center">
                        <input type="checkbox" name="isSweet" className="peer sr-only" />
                        <div className="w-5 h-5 border-2 border-gray-500 rounded peer-checked:bg-pink-500 peer-checked:border-pink-500 transition-all"></div>
                        <svg className="w-3 h-3 text-white absolute left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div>
                        <span className="text-pink-300 font-bold text-sm block group-hover:text-pink-200 transition-colors">加甜蜜单 (+RM5)</span>
                        <span className="text-[10px] text-gray-500 block">声音甜美 · 全程撒娇</span>
                    </div>
                 </label>
              </div>
            </div>

            {/* 5. 时间安排 */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">开始时间</label>
              <div className="grid grid-cols-2 gap-3 mb-2">
                  <label className="cursor-pointer">
                      <input type="radio" name="orderType" value="immediate" defaultChecked className="peer hidden" />
                      <div className="h-10 flex items-center justify-center rounded-lg bg-gray-900/50 border border-gray-600 text-sm text-gray-400 peer-checked:border-purple-500 peer-checked:text-purple-400 peer-checked:bg-purple-500/10 transition-all">
                        🚀 现在开始
                      </div>
                  </label>
                  <label className="cursor-pointer">
                      <input type="radio" name="orderType" value="scheduled" className="peer hidden" />
                      <div className="h-10 flex items-center justify-center rounded-lg bg-gray-900/50 border border-gray-600 text-sm text-gray-400 peer-checked:border-purple-500 peer-checked:text-purple-400 peer-checked:bg-purple-500/10 transition-all">
                        📅 预约时间
                      </div>
                  </label>
              </div>
              <input 
                type="datetime-local" 
                name="scheduledTime" 
                className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 h-11 text-sm text-gray-300 focus:border-purple-500 outline-none transition-all" 
              />
            </div>

            {/* 6. 备注 */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">备注补充</label>
              <textarea 
                name="remarks" 
                placeholder="老板还有什么特殊要求吗？(选填)" 
                className="w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-sm focus:border-purple-500 outline-none transition-all min-h-[80px] resize-none"
              ></textarea>
            </div>

            {/* 提交按钮 */}
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/40 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-lg"
            >
              <span>📡</span> 发送订单
            </button>
            
          </form>
        </div>
        
        {/* 底部版权 */}
        <p className="text-center text-gray-600 text-xs mt-8 mb-4">
          © 2024 Star Reflection E-Sports Club. All rights reserved.
        </p>

      </div>
    </div>
  )
}
