'use server'
import { supabase } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';

// 这个函数专门负责处理表单提交
export async function addEvent(formData: FormData) {
  // 1. 获取表单里名字叫 'title' 的输入框里的内容
  const title = formData.get('title') as string;

  if (title) {
    // 2. 把内容插入到 Supabase 的 'events' 表中
    await supabase.from('events').insert({ title });

    // 3. 告诉 Next.js：“首页的数据变了，赶紧刷新一下缓存！”
    // 这样你添加完，页面不需要手动刷新就能看到新数据
    revalidatePath('/');
  }
}

export async function deleteEvent(formData: FormData) {
  const id = formData.get('id') as string;

  // 根据 id 删除对应的那条数据
  await supabase.from('events').delete().eq('id', id);

  revalidatePath('/');
}

