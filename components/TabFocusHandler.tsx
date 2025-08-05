// components/TabFocusHandler.tsx
'use client'

import { useTabFocusEffect } from '@/lib/useTabFocusEffect'

/**
 * 这个组件不渲染任何内容，它的唯一作用是在客户端激活 useTabFocusEffect Hook。
 */
export default function TabFocusHandler() {
  useTabFocusEffect('咒珠"弃置渠"中的滓魂增加了1%。')

  return null
}
