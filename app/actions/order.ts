'use server'

import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createOrder(formData: FormData) {
  const supabase = await createClient()

  // 1. 获取当前登录用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. 提取表单数据
  const gameCategory = formData.get('gameCategory') as string
  const gameName = formData.get('gameName') as string
  const duration = formData.get('duration') as string
  const gender = formData.get('gender') as string
  const mode = formData.get('mode') as string
  const isSweet = formData.get('isSweet') === 'on' // Checkbox 返回 'on'
  const remarks = formData.get('remarks') as string
  const orderType = formData.get('orderType') as string // 'immediate' or 'scheduled'
  const scheduledTimeStr = formData.get('scheduledTime') as string

  // 3. 逻辑判定：夜间单 (21:00 - 04:00)
  // 如果是"现在"，用当前时间；如果是"预约"，用预约时间
  let checkTime = new Date()
  if (orderType === 'scheduled' && scheduledTimeStr) {
    checkTime = new Date(scheduledTimeStr)
  }

  const hour = checkTime.getHours()
  // 21点(含)之后，或者 4点(不含)之前 为夜间
  const isNight = hour >= 21 || hour < 4

  // 4. 逻辑判定：超时时间
  // 立即单 = 10分钟，预约单 = 60分钟
  const timeoutMinutes = orderType === 'immediate' ? 10 : 60

  // 5. 写入数据库
  const { error } = await supabase.from('orders').insert({
    user_id: user.id,
    game_category: gameCategory,
    game_name: gameName,
    duration: duration,
    gender: gender,
    mode: mode,
    is_sweet: isSweet,
    is_night: isNight, // 系统自动标记
    order_type: orderType,
    scheduled_time: scheduledTimeStr || null,
    timeout_minutes: timeoutMinutes,
    remarks: remarks,
    status: 'pending' // 初始状态：等待接单
  })

  if (error) {
    console.error('下单失败:', error)
    // 暂时先抛出错误，或者直接不管它（因为Next.js会捕捉错误）
    throw new Error('下单失败，请稍后重试') 
  }

  // 6. 成功后跳转到“雷达扫描页”
  redirect('/radar')
}
