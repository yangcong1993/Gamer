import { createClient } from 'npm:@supabase/supabase-js@2'
import { UAParser } from 'npm:ua-parser-js@1.0.37'
import nodemailer from 'npm:nodemailer@6.9.14'
const ENCRYPTION_KEY_SECRET = Deno.env.get('CAPTCHA_SECRET_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: Deno.env.get('ZOHO_EMAIL'),
    pass: Deno.env.get('ZOHO_PASSWORD'),
  },
})
async function getDerivedKey(secret) {
  const encodedSecret = new TextEncoder().encode(secret)
  const hash = await crypto.subtle.digest('SHA-256', encodedSecret)
  return hash
}

async function decrypt(token) {
  const parts = token.split('.')
  if (parts.length !== 2) throw new Error('Invalid token format')
  const [iv_b64, ciphertext_b64] = parts
  const iv = new Uint8Array(
    atob(iv_b64)
      .split('')
      .map((c) => c.charCodeAt(0))
  )
  const ciphertext = new Uint8Array(
    atob(ciphertext_b64)
      .split('')
      .map((c) => c.charCodeAt(0))
  )
  const derivedKey = await getDerivedKey(ENCRYPTION_KEY_SECRET)
  const key = await crypto.subtle.importKey(
    'raw',
    derivedKey,
    {
      name: 'AES-GCM',
    },
    false,
    ['decrypt']
  )
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    ciphertext
  )
  return new TextDecoder().decode(decrypted)
}
Deno.serve(async (req) => {
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }
  try {
    const { commentData, captchaAnswer, validation } = await req.json()
    const { parent_id, post_slug, author_name, content, author_email } = commentData
    if (!commentData.user_id) {
      if (!captchaAnswer || !validation) throw new Error('验证码信息不完整')
      const correctAnswer = await decrypt(validation)
      if (captchaAnswer.toString() !== correctAnswer) {
        throw new Error('验证码错误')
      }
    }
    const ua = new UAParser(req.headers.get('User-Agent') || undefined).getResult()
    const ip_address = req.headers.get('x-forwarded-for')
    const newComment = {
      ...commentData,
      os: ua.os.name,
      browser: ua.browser.name,
      ip_address: ip_address,
      status: 'pending',
    }
    const { data: insertedComment, error: insertError } = await supabaseClient
      .from('comments')
      .insert(newComment)
      .select()
      .single()
    if (insertError) {
      throw insertError
    }
    if (parent_id) {
      console.log(`This is a reply to comment ${parent_id}. Preparing notification...`)
      const { data: parentComment, error: parentError } = await supabaseClient
        .from('comments')
        .select('author_email, author_name')
        .eq('id', parent_id)
        .single()
      if (parentError || !parentComment) {
        console.error(
          `Could not fetch parent comment (ID: ${parent_id}) for notification.`,
          parentError
        )
      } else if (parentComment.author_email === author_email) {
        console.log('User is replying to themselves. No notification will be sent.')
      } else {
        console.log(`Sending reply notification to ${parentComment.author_email}`)
        const postUrl = `https://hiripple.com/blog/${post_slug}` // 请确保你的博客 URL
        await transporter
          .sendMail({
            from: '"Ripple - 博客评论回复" <me@hiripple.com>',
            to: parentComment.author_email,
            subject: `您在[${post_slug}]上的评论收到了新回复！`,
            html: `
            <p>Hi ${parentComment.author_name || '你好'},</p>
            <p>您在文章 <strong>"${post_slug}"</strong> 上的评论收到了来自 <strong>${author_name}</strong> 的新回复：</p>
            <blockquote style="border-left: 2px solid #ccc; padding-left: 1em; margin-left: 1em; color: #555;">
              ${content}
            </blockquote>
            <p>
              <a href="${postUrl}#comment-${insertedComment.id}">点击这里查看回复</a>
            </p>
            <p>-- Ripple Blog</p>
          `,
          })
          .catch((err) => {
            console.error('Failed to send reply notification email:', err)
          })
      }
    }
    await transporter
      .sendMail({
        from: '"Ripp - hiRipple.com" <me@hiripple.com>',
        to: 'me@hiripple.com',
        subject: `博客有新评论待审核: ${insertedComment.post_slug}`,
        html: `
        <p>文章 "${insertedComment.post_slug}" 下有新评论：</p>
        <p><b>${insertedComment.author_name}:</b></p>
        <p>${insertedComment.content}</p>
        <hr>
        <p>请前往 Supabase 后台审核。</p>
      `,
      })
      .catch((err) => {
        console.error('Failed to send admin notification email:', err)
      })
    return new Response(
      JSON.stringify({
        data: insertedComment,
        error: null,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (err) {
    console.error('Error submitting comment:', err)
    return new Response(
      JSON.stringify({
        data: null,
        error: {
          message: err.message,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  }
})
