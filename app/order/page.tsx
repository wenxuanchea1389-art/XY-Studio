'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
export default function OrderPage() {

  // --- 1. 表单状态 (老板填写的资料) ---
  const [platform, setPlatform] = useState('端游') // 端游 / 手游
  const [gameName, setGameName] = useState('')
  const [playMode, setPlayMode] = useState('娱乐') // 娱乐 / 技术
  const [unit, setUnit] = useState('1小时') // 1小时 / 半小时 / 1局
  const [quantity, setQuantity] = useState(1) // 数量 (几小时/几局)
  const [gender, setGender] = useState('不限')
  const [isSweet, setIsSweet] = useState(false) // 甜蜜单
  const [bookingTime, setBookingTime] = useState('')
  const [remarks, setRemarks] = useState('')
  
  // --- 2. 价格数据 (从数据库拉取) ---
  const [prices, setPrices] = useState<any[]>([])
  const [surcharges, setSurcharges] = useState<any[]>([])
  const [estimatedPrice, setEstimatedPrice] = useState(0)
  const [isNight, setIsNight] = useState(false) // 是否夜间

  // 游戏列表 (你可以随时在这里加游戏)
  const pcGames = ['PUBG', 'LOL', 'Valorant', 'Apex', '永劫无间']
  const mobileGames = ['王者荣耀', '和平精英', 'Mobile Legends', '金铲铲']

  // --- 3. 初始化：加载价格表 & 判断时间 ---
  useEffect(() => {
    fetchPrices()
    checkNightTime()
  }, [])

  // 自动计算当前是不是夜单 (17:00 - 04:00)
  const checkNightTime = () => {
    const hour = new Date().getHours()
    // 17点到24点，或者 0点到4点
    if (hour >= 17 || hour < 4) {
      setIsNight(true)
    }
  }

  const fetchPrices = async () => {
    const { data: priceData } = await supabase.from('game_prices').select('*')
    const { data: chargeData } = await supabase.from('surcharge_prices').select('*')
    if (priceData) setPrices(priceData)
    if (chargeData) setSurcharges(chargeData)
  }

  // --- 4. 核心：实时算价器 ---
  useEffect(() => {
    if (prices.length === 0) return

    // 1. 拼凑出 key，比如 "端游娱乐"
    const categoryKey = platform + playMode 
    
    // 2. 查找基础单价
    const matchedPrice = prices.find(p => p.category === categoryKey && p.unit === unit)
    let basePrice = matchedPrice ? matchedPrice.price : 0

    // 3. 加上甜蜜费 (如果选了)
    let sweetFee = 0
    if (isSweet) {
      const fee = surcharges.find(s => s.slug === 'sweet_fee')
      sweetFee = fee ? fee.price : 0
    }

    // 4. 加上夜单费 (如果是晚上)
    let nightFee = 0
    if (isNight) {
      const fee = surcharges.find(s => s.slug === 'night_fee')
      nightFee = fee ? fee.price : 0
    }

    // 5. 总公式：(基础价 + 甜蜜 + 夜单) * 数量
    // 注意：通常夜单费是按“单”算的，还是按“小时”算的？
    // 这里我假设是：每一小时都要加夜费。如果不想要这样，就把 nightFee 移到括号外面。
    const total = (basePrice + sweetFee + nightFee) * quantity
    
    setEstimatedPrice(total)

  }, [platform, playMode, unit, quantity, isSweet, isNight, prices, surcharges])


  // --- 5. 提交订单 ---
  const handleSubmit = async () => {
    // 简单的防呆检查
    if (!gameName) return alert('请选择游戏')
    if (!bookingTime) return alert('请填写时间')

    const { error } = await supabase.from('orders').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id, // 获取当前登录用户ID
      platform,
      game_name: gameName,
      play_mode: playMode + '单', // 存入数据库变成 "娱乐单"
      unit,
      quantity,
      gender_requirement: gender,
      is_sweet_order: isSweet,
      remarks,
      booking_time: bookingTime,
      total_price: estimatedPrice // 存入当前的预估价
    })

    if (error) {
      alert('下单失败: ' + error.message)
    } else {
      alert('下单成功！机器人正在为您派单...')
      // 这里可以跳转到订单列表页
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center">
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
        <h1 className="text-2xl font-bold text-center mb-6 text-pink-500">
          🎮 老板下单处
        </h1>

        {/* 1. 平台选择 */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2">选择平台</label>
          <div className="flex gap-4">
            {['端游', '手游'].map((p) => (
              <button
                key={p}
                onClick={() => { setPlatform(p); setGameName('') }} // 切换平台清空游戏名
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                  platform === p ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* 2. 游戏选择 (根据平台动态变化) */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2">选择游戏</label>
          <select 
            className="w-full bg-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-pink-500"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
          >
            <option value="">-- 请选择 --</option>
            {(platform === '端游' ? pcGames : mobileGames).map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* 3. 模式与甜蜜 */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2">模式选择</label>
          <div className="flex gap-2 mb-2">
            {['娱乐', '技术'].map((m) => (
              <button
                key={m}
                onClick={() => setPlayMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm ${
                  playMode === m ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {m}单
              </button>
            ))}
          </div>
          
          {/* 甜蜜单勾选 */}
          <label className="flex items-center space-x-3 bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600">
            <input 
              type="checkbox" 
              checked={isSweet}
              onChange={(e) => setIsSweet(e.target.checked)}
              className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500" 
            />
            <span className="text-pink-300 font-bold">💖 加甜蜜单 (+RM5)</span>
          </label>
        </div>

        {/* 4. 时长与单位 */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">单位</label>
            <select 
              className="w-full bg-gray-700 p-2 rounded-lg"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="半小时">半小时</option>
              <option value="1小时">1小时</option>
              <option value="1局">1局</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">数量</label>
            <div className="flex items-center bg-gray-700 rounded-lg">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-xl">-</button>
              <span className="flex-1 text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-xl">+</button>
            </div>
          </div>
        </div>

        {/* 5. 性别与时间 */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">性别要求</label>
            <select 
              className="w-full bg-gray-700 p-2 rounded-lg"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option>不限</option>
              <option>女生</option>
              <option>男生</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">预约时间</label>
            <input 
              type="text" 
              placeholder="例: 现在 / 21:00"
              className="w-full bg-gray-700 p-2 rounded-lg"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
            />
          </div>
        </div>

        {/* 6. 备注 */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">备注 (选填)</label>
          <textarea 
            className="w-full bg-gray-700 p-3 rounded-lg h-20 placeholder-gray-500"
            placeholder="例：要声音好听的，稍微凶一点也可以..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          ></textarea>
        </div>

        {/* 底部：价格与按钮 */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-sm">
              预计价格 
              {isNight && <span className="ml-2 text-yellow-400 text-xs">(已含夜单费)</span>}
            </span>
            <span className="text-3xl font-bold text-green-400">
              RM {estimatedPrice}
            </span>
          </div>
          
          <button 
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            立即下单
          </button>
          <p className="text-center text-gray-500 text-xs mt-2">
            *如有“人气/头牌”接单，将在接单后自动补差价
          </p>
        </div>

      </div>
    </div>
  )
}
