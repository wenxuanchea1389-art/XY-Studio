'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'

// ✅ 辅助函数：格式化手机号
function formatFullPhone(countryCode: string, rawPhone: string) {
  const cleanPhone = rawPhone.replace(/^0+/, '')
  const cleanCountry = countryCode.replace(/^\+/, '')
  return `+${cleanCountry}${cleanPhone}`
}

// 🟢 1. 登录
export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const countryCode = formData.get('countryCode') as string
  const rawPhone = formData.get('phone') as string
  const password = formData.get('password') as string
  const phone = formatFullPhone(countryCode, rawPhone)

  console.log('正在登录:', phone)

  const { error } = await supabase.auth.signInWithPassword({
    phone,
    password,
  })

  if (error) {
    console.error('登录失败:', error.message)
    return { error: '账号或密码错误' }
  }
  
  revalidatePath('/', 'layout')
  return { success: true }
}

// 🟢 2. 注册
export async function signupStart(formData: FormData) {
  const supabase = await createClient()

  const countryCode = formData.get('countryCode') as string
  const rawPhone = formData.get('phone') as string
  const password = formData.get('password') as string
  const phone = formatFullPhone(countryCode, rawPhone)

  console.log('正在注册:', phone)

  const { data, error } = await supabase.auth.signUp({
    phone,
    password,
  })

  if (error) {
    console.error('🔴 注册失败:', error.message)
    return { error: error.message }
  }

  if (data.session) {
    console.log('🟢 注册并自动登录成功')
  }

  return { success: true }
}

// 🟢 3. OTP 验证登录 (如果有用到)
export async function verifyAndLogin(formData: FormData) {
  const supabase = await createClient()

  const countryCode = formData.get('countryCode') as string
  const rawPhone = formData.get('phone') as string
  const token = formData.get('otp') as string
  const phone = formatFullPhone(countryCode, rawPhone)

  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })

  if (error) {
    console.error('验证失败:', error)
    return { error: '验证码错误或已过期' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

// 🟢 4. 重置密码 - 发送验证码
export async function resetPasswordStart(formData: FormData) {
  const supabase = await createClient()
  
  const countryCode = formData.get('countryCode') as string
  const rawPhone = formData.get('phone') as string
  const phone = formatFullPhone(countryCode, rawPhone)

  const { error } = await supabase.auth.signInWithOtp({
    phone,
  })

  if (error) {
    return { error: '发送失败，请检查手机号' }
  }

  return { success: true }
}

// 🟢 5. 重置密码 - 验证并修改
export async function resetPasswordFinish(formData: FormData) {
  const supabase = await createClient()

  const countryCode = formData.get('countryCode') as string
  const rawPhone = formData.get('phone') as string
  const token = formData.get('otp') as string
  const newPassword = formData.get('password') as string
  const phone = formatFullPhone(countryCode, rawPhone)

  const { data, error: verifyError } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })

  if (verifyError) {
    return { error: '验证码错误或过期' }
  }

  if (data.session) {
    await supabase.auth.updateUser({ password: newPassword })
  }

  revalidatePath('/', 'layout')
  return { success: true }
} 

// 🟢 6. 登出 (现在它独立在外面了，这是正确的写法)
export async function signOut() {
  'use server'
  const supabase = await createClient()
  
  await supabase.auth.signOut()
  
  redirect('/login')
}
