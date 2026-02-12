'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation' // 👈 新增：引入路由
import { login, signupStart, verifyAndLogin, resetPasswordStart, resetPasswordFinish } from './actions'

export default function LoginPage() {
  const router = useRouter() // 👈 使用路由
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [showOtpInput, setShowOtpInput] = useState(false)
  
  const [countryCode, setCountryCode] = useState('+60')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const switchMode = (newMode: 'login' | 'signup' | 'reset') => {
    setMode(newMode)
    setShowOtpInput(false)
    setMsg('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    const formData = new FormData()
    formData.append('countryCode', countryCode)
    formData.append('phone', phone)
    formData.append('password', password)

    try {
      if (mode === 'login') {
        const res = await login(formData)
        if (res?.error) {
          setMsg(res.error)
        } else if (res?.success) {
          // 👈 登录成功，前端手动跳转
          router.push('/')
        }
      
      } else if (mode === 'signup') {
        if (!showOtpInput) {
          const res = await signupStart(formData)
          if (res?.error) setMsg(res.error)
          else {
            setShowOtpInput(true)
            setMsg('验证码已发送')
          }
        } else {
          const otpInput = (e.currentTarget.elements.namedItem('otp') as HTMLInputElement).value
          formData.append('otp', otpInput)
          const res = await verifyAndLogin(formData)
          if (res?.error) setMsg(res.error)
          else if (res?.success) router.push('/') // 👈 跳转
        }

      } else if (mode === 'reset') {
        if (!showOtpInput) {
          const res = await resetPasswordStart(formData)
          if (res?.error) setMsg(res.error)
          else {
            setShowOtpInput(true)
            setMsg('验证码已发送，请设置新密码')
          }
        } else {
          const otpInput = (e.currentTarget.elements.namedItem('otp') as HTMLInputElement).value
          formData.append('otp', otpInput)
          const res = await resetPasswordFinish(formData)
          if (res?.error) setMsg(res.error)
          else if (res?.success) router.push('/') // 👈 跳转
        }
      }

    } catch (err) {
      console.error(err)
      setMsg('系统繁忙，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    if (mode === 'login') return '陪玩俱乐部登录'
    if (mode === 'signup') return '加入俱乐部'
    return '重置密码'
  }

  const getBtnText = () => {
    if (loading) return '处理中...'
    if (mode === 'login') return '登录'
    if (!showOtpInput) return '获取验证码'
    return mode === 'reset' ? '确认修改并登录' : '完成注册'
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            {getTitle()}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {mode === 'reset' ? '验证手机即可重置' : '马来西亚/新加坡/中国用户通用'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            
            <div className="flex rounded-t-md bg-gray-800 border border-gray-700">
              {/* 👇 这里的 w-24 改成了 w-32，加宽显示区号 */}
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-32 rounded-tl-md border-0 bg-gray-800 py-3 pl-3 pr-8 text-white focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="+60">🇲🇾 +60</option>
                <option value="+65">🇸🇬 +65</option>
                <option value="+86">🇨🇳 +86</option>
              </select>
              
              <input
                name="phone"
                type="tel"
                required
                className="relative block w-full rounded-tr-md border-0 bg-gray-800 py-3 px-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                placeholder="手机号码 (无需加0)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={showOtpInput}
              />
            </div>
            
            <div>
              <input
                name="password"
                type="password"
                required
                className="relative block w-full border-0 bg-gray-800 py-3 px-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 sm:text-sm border-t border-gray-700"
                placeholder={mode === 'reset' ? "请设置您的新密码" : "密码"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {showOtpInput && (
              <div className="mt-4">
                <input
                  name="otp"
                  type="text"
                  required
                  className="relative block w-full rounded-b-md border-0 bg-gray-700 py-3 px-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 sm:text-sm"
                  placeholder="请输入短信验证码"
                />
              </div>
            )}
          </div>

          {msg && <div className="text-red-400 text-sm text-center">{msg}</div>}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                忘记密码？
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {getBtnText()}
          </button>
        </form>

        <div className="text-center space-x-4">
          {mode !== 'login' && (
            <button onClick={() => switchMode('login')} className="text-sm text-gray-400 hover:text-white">
              返回登录
            </button>
          )}
          {mode === 'login' && (
            <button onClick={() => switchMode('signup')} className="text-sm text-gray-400 hover:text-white">
              新用户注册
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
