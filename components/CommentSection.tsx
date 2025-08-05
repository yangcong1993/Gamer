// components/CommentSection.tsx
'use client'
import type { ReactElement } from 'react'
import type { User } from '@supabase/supabase-js'
import { useState, useEffect, useCallback, useRef } from 'react'
import { FaGithub, FaGoogle } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useClickOutside } from '@/lib/useClickOutside'
import ReactMarkdown from 'react-markdown'
import { getAvatarFromEmail } from '@/lib/getAvatarFromEmail'
import Image from 'next/image'
import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'

import {
  FaWindows,
  FaApple,
  FaLinux,
  FaAndroid,
  FaChrome,
  FaFirefox,
  FaSafari,
  FaEdge,
  FaSignOutAlt,
} from 'react-icons/fa'
import dynamic from 'next/dynamic'
const DynamicInlineMath = dynamic(() => import('./DynamicKatex'), {
  loading: () => <span style={{ fontFamily: 'monospace' }}>...</span>,
  ssr: false,
})
interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
}

interface Comment {
  id: string
  content: string
  created_at: string
  author_name: string
  author_email: string
  author_website?: string
  author_avatar_url?: string | null
  os?: string | null
  browser?: string | null
  user?: Profile
  parent_id?: string | null
}

interface SessionUser {
  id: string
  email: string
  user_metadata: {
    name?: string
    avatar_url?: string
  }
}

const osIconMap: Record<string, ReactElement> = {
  Windows: <FaWindows className="inline-block" />,
  Linux: <FaLinux className="inline-block" />,
  macOS: <FaApple className="inline-block" />,
  'Mac OS': <FaApple className="inline-block" />,
  'Mac OS X': <FaApple className="inline-block" />,
  iOS: <FaApple className="inline-block" />,
  Android: <FaAndroid className="inline-block" />,
}

const browserIconMap: Record<string, ReactElement> = {
  Chrome: <FaChrome className="inline-block" />,
  Firefox: <FaFirefox className="inline-block" />,
  Safari: <FaSafari className="inline-block" />,
  Edge: <FaEdge className="inline-block" />,
}

const structureComments = (comments: Comment[]): Comment[] => {
  const commentMap: { [key: string]: Comment & { replies: Comment[] } } = {}

  comments.forEach((comment) => {
    commentMap[comment.id] = { ...comment, replies: [] }
  })

  const rootComments: Comment[] = []
  Object.values(commentMap).forEach((comment) => {
    if (comment.parent_id) {
      commentMap[comment.parent_id]?.replies.push(comment)
    } else {
      rootComments.push(comment)
    }
  })

  return rootComments
}

const CommentItem = ({
  comment,
  onReply,
  postSlug,
}: {
  comment: Comment & { replies?: Comment[] }
  onReply: (id: string) => void
  postSlug: string
}) => {
  const avatar = comment.user?.avatar_url || getAvatarFromEmail(comment.author_email)

  const AuthorName = () => {
    const nameElement = (
      <span className="font-semibold text-gray-800 dark:text-gray-200">
        {comment.user?.display_name || comment.author_name}
      </span>
    )

    if (comment.author_website) {
      return (
        <a
          href={comment.author_website}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary-600 dark:hover:text-primary-400"
        >
          {nameElement}
        </a>
      )
    }
    return nameElement
  }

  const AuthorAvatar = () => {
    const avatarElement = (
      <Image
        src={avatar}
        alt={comment.user?.display_name || comment.author_name}
        className="h-10 w-10 shrink-0 rounded-full transition-transform duration-300 group-hover:scale-110"
        width={40}
        height={40}
      />
    )

    if (comment.author_website) {
      return (
        <a
          href={comment.author_website}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          {avatarElement}
        </a>
      )
    }
    return avatarElement
  }

  return (
    <li id={`comment-${comment.id}`} className="flex scroll-mt-20 gap-3">
      {/* 1. 头像现在会根据是否有网址来决定是否带链接 */}
      <AuthorAvatar />

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {/* 2. 用户名现在也会根据是否有网址来决定是否带链接 */}
          <AuthorName />

          <span className="text-xs text-gray-500">
            {new Date(comment.created_at).toLocaleString()}
          </span>

          {(comment.os || comment.browser) && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              {osIconMap[comment.os as string] ?? null}
              <span className="hidden sm:inline">{comment.os ?? 'Unknown OS'}</span>
              <span className="mx-0.5">·</span>
              {browserIconMap[comment.browser as string] ?? null}
              <span className="hidden sm:inline">{comment.browser ?? 'Unknown Browser'}</span>
            </span>
          )}
        </div>
        <div className="prose dark:prose-invert max-w-none rounded-lg border border-gray-200/60 bg-gray-50/60 px-4 py-3 dark:border-white/10 dark:bg-white/5">
          <ReactMarkdown>{comment.content}</ReactMarkdown>
        </div>
        <button
          onClick={() => onReply(comment.id)}
          className="text-xs font-semibold text-gray-600 hover:text-[#793EC3] dark:text-gray-400 dark:hover:text-[#793EC3]"
        >
          回复
        </button>

        {/* 递归渲染回复 */}
        {comment.replies && comment.replies.length > 0 && (
          <ul className="mt-4 space-y-4 border-l-2 border-gray-200 pl-4 dark:border-gray-700">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} onReply={onReply} postSlug={postSlug} />
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

export default function CommentSection({ postSlug }: { postSlug: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingComments, setLoadingComments] = useState(true)
  const [structuredComments, setStructuredComments] = useState<Comment[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)
  const [content, setContent] = useState('')
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 验证码状态
  const [captchaProblem, setCaptchaProblem] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaValidation, setCaptchaValidation] = useState('')
  const [isCaptchaVisible, setIsCaptchaVisible] = useState(false)
  const [captchaError, setCaptchaError] = useState<string | null>(null)
  const captchaContainerRef = useRef<HTMLDivElement | null>(null)

  useClickOutside<HTMLDivElement>(captchaContainerRef as React.RefObject<HTMLDivElement>, () => {
    setIsCaptchaVisible(false)
  })

  const fetchComments = useCallback(async () => {
    setLoadingComments(true)
    const { data, error } = await supabase
      .from('comments')
      .select('*, user:profiles(id, display_name, avatar_url)')
      .eq('post_slug', postSlug)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })

    if (data) {
      const nestedComments = structureComments(data as Comment[])
      setStructuredComments(nestedComments)
    }
    setLoadingComments(false)
  }, [supabase, postSlug])
  useEffect(() => {
    if (replyingTo) {
      formRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      })
    }
  }, [replyingTo])

  useEffect(() => {
    const getInitialData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
      fetchComments()
    }
    getInitialData()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null)
        setLoading(false)
        if (window.location.search.includes('code=')) {
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchComments, supabase.auth, router])

  const fetchCaptcha = useCallback(async () => {
    if (captchaProblem) return
    const { data, error } = await supabase.functions.invoke('generate-captcha')
    if (data) {
      setCaptchaProblem(data.problem)
      setCaptchaValidation(data.validation)
    }
  }, [supabase, captchaProblem])

  const handleCaptchaFocus = () => {
    setIsCaptchaVisible(true)
    fetchCaptcha()
  }

  const handleLogin = async (provider: 'github' | 'google') => {
    try {
      const currentPath = window.location.pathname + window.location.search

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('OAuth login error:', error)
        alert(`登录失败: ${error.message}`)
      }
    } catch (error) {
      console.error('OAuth login error:', error)
      alert('登录失败，请重试')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault()
    setIsSubmitting(true)
    setCaptchaError(null)

    const { data: functionResponse, error: invokeError } = await supabase.functions.invoke(
      'submit-comment',
      {
        body: {
          commentData: {
            post_slug: postSlug,
            content,
            author_name: user ? user.user_metadata.name : nickname,
            author_email: user ? user.email : email,
            author_website: website,
            author_avatar_url: user ? user.user_metadata.avatar_url : null,
            user_id: user ? user.id : null,
            parent_id: parentId,
          },
          captchaAnswer: user ? null : captchaAnswer,
          validation: user ? null : captchaValidation,
        },
      }
    )

    setIsSubmitting(false)

    if (invokeError) {
      alert(`调用函数失败: ${invokeError.message}`)
      return
    }

    if (functionResponse.error) {
      const errorMessage = functionResponse.error.message

      if (errorMessage.includes('验证码错误')) {
        setCaptchaError('算错了哦，请再试一次。')
        setCaptchaAnswer('')
        setCaptchaProblem('')
        fetchCaptcha()
      } else {
        alert(`评论提交失败: ${errorMessage}`)
      }
    } else {
      alert('评论提交成功！Ripp会在审核后将其展示出来。')
      setContent('')
      setReplyingTo(null)
      fetchComments()
      if (!user) {
        setNickname('')
        setEmail('')
        setWebsite('')
        setCaptchaAnswer('')
        setCaptchaProblem('')
        setCaptchaValidation('')
        setIsCaptchaVisible(false)
      }
    }
  }

  return (
    <div className="comment-section-wrapper mx-auto w-full max-w-2xl space-y-8 rounded-lg p-4 sm:p-6">
      {/* === 评论列表 === */}
      {loadingComments ? (
        <div className="py-4 text-center text-gray-500">加载评论中…</div>
      ) : structuredComments.length === 0 ? (
        <div className="py-4 text-center text-gray-500">「 Objection！ 」</div>
      ) : (
        <ul className="space-y-6">
          {structuredComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={setReplyingTo}
              postSlug={postSlug}
            />
          ))}
        </ul>
      )}

      {/* === 评论表单 === */}
      <form
        ref={formRef}
        onSubmit={(e) => handleSubmit(e, replyingTo)}
        className="space-y-6 border-t border-gray-200 pt-6 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {replyingTo ? '回复评论' : '发表评论'}
          {replyingTo && (
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="ml-4 text-sm font-normal text-red-500 transition-colors hover:text-red-600 hover:underline"
            >
              取消回复
            </button>
          )}
        </h3>
        {loading ? (
          <div className="py-4 text-center text-gray-500">检查登录状态...</div>
        ) : user ? (
          <div className="rounded-lg border border-gray-200/60 bg-gray-50/60 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-4">
              <Image
                src={user.user_metadata.avatar_url || getAvatarFromEmail(user.email || '')}
                alt={user.user_metadata.name || user.email || ''}
                className="h-12 w-12 rounded-full"
                width={48}
                height={48}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Welcome,</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {user.user_metadata.name || user.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-red-500"
                >
                  <FaSignOutAlt className="h-3 w-3" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleLogin('github')}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
              >
                <FaGithub /> GitHub 登录
              </button>
              <button
                type="button"
                onClick={() => handleLogin('google')}
                className="focus:ring-primary-500 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                <FaGoogle /> Google 登录
              </button>
            </div>

            <div className="relative text-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-sm text-gray-500 dark:bg-gray-950">
                  或作为访客评论
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="昵称 *"
                required
                className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="邮箱 (保密) *"
                required
                className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="（可选）https://..."
              className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />

            {/* 验证码区域 */}
            <div ref={captchaContainerRef} className="relative">
              <AnimatePresence>
                {isCaptchaVisible && (
                  <motion.div
                    key="captcha-pop"
                    className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 items-center overflow-visible rounded-lg bg-gray-800 py-1 pr-4 pl-14 leading-none text-white shadow-lg dark:bg-gray-200 dark:text-gray-800"
                    initial={{ opacity: 0, y: 40, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.8 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 5,
                      mass: 0.6,
                    }}
                  >
                    <motion.img
                      src="/static/images/captcha-mascot.avif"
                      alt="captcha mascot"
                      className="pointer-events-none absolute top-0 left-0 h-15 w-auto -translate-y-1/2 select-none"
                      initial={{ rotate: 10 }}
                      animate={{ rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                    <DynamicInlineMath math={captchaProblem || 'Loading...'} />
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                type="text"
                value={captchaAnswer}
                onFocus={handleCaptchaFocus}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="请计算 *"
                required
                className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              {captchaError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">{captchaError}</p>
              )}
            </div>
          </>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={replyingTo ? '输入你的回复...' : '留下你的评论... 支持 Markdown'}
          required
          rows={5}
          className="focus:ring-primary-500 focus:border-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md border border-transparent bg-[#52288C] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#793EC3] focus:ring-2 focus:ring-[#793EC3] focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? '提交中...' : replyingTo ? '提交回复' : '提交评论'}
          </button>
        </div>
      </form>
    </div>
  )
}
