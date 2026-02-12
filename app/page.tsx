import { supabase } from '@/utils/supabase';
import { addEvent, deleteEvent } from './actions';

export const revalidate = 0;

export default async function Home() {
  // 修改点：加了 order，让最新的活动显示在最上面 (descending)
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>✨ XY Studio 活动中心 ✨</h1>

      {/* --- 新增部分：添加活动的表单 --- */}
      <div style={{ marginBottom: '30px', padding: '20px', background: '#f0f4f8', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>添加新活动</h3>
        {/* form 的 action 属性绑定了我们的 addEvent 函数 */}
        <form action={addEvent} style={{ display: 'flex', gap: '10px' }}>
          <input 
            name="title" 
            placeholder="输入活动名称..." 
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
          />
          <button 
            type="submit"
            style={{ padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            发布
          </button>
        </form>
      </div>
      {/* ------------------------------- */}

      <p style={{ color: '#666', fontSize: '0.9em' }}>
        数据来源：Supabase 云端数据库
      </p>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {events?.map((event) => (
          <li key={event.id} style={{ 
            background: 'white', 
            margin: '10px 0', 
            padding: '15px', 
            borderRadius: '8px',
            border: '1px solid #eee',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'flex',            // 让内容和按钮横向排列
            justifyContent: 'space-between', // 一左一右
            alignItems: 'center'
          }}>
            <div>
              <strong style={{ fontSize: '1.2em', display: 'block' }}>{event.title}</strong>
              <small style={{ color: '#999' }}>
                {new Date(event.created_at).toLocaleString()}
              </small>
            </div>

            {/* 删除按钮表单 */}
            <form action={deleteEvent}>
              {/* 这是一个隐藏的输入框，专门用来告诉后台我们要删哪一个 ID */}
              <input type="hidden" name="id" value={event.id} />
              <button 
                type="submit" 
                style={{
                  background: '#ff4d4f', // 红色警告色
                  color: 'white',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9em'
                }}
              >
                删除
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
