import { createClient } from 'npm:@supabase/supabase-js@2'
const ENCRYPTION_KEY_SECRET = Deno.env.get('CAPTCHA_SECRET_KEY')
if (!ENCRYPTION_KEY_SECRET) {
  throw new Error('CAPTCHA_SECRET_KEY 环境变量未设置！')
}
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
async function getDerivedKey(secret) {
  const encodedSecret = new TextEncoder().encode(secret)
  const hash = await crypto.subtle.digest('SHA-256', encodedSecret)
  return hash
}
async function decrypt(token) {
  const parts = token.split('.')
  if (parts.length !== 2) throw new Error('无效的令牌格式')
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }
  try {
    const { guess, captchaAnswer, validation, userId } = await req.json()
    if (!captchaAnswer || !validation) throw new Error('验证码信息不完整')
    const correctAnswer = await decrypt(validation)
    if (captchaAnswer.toString() !== correctAnswer) {
      throw new Error('验证码错误')
    }
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const ip_address = req.headers.get('x-forwarded-for')
    const { data: games, error: queryError } = await supabaseAdmin.rpc('search_games_normalized', {
      search_term: guess,
    })
    if (queryError) {
      console.error('Supabase RPC error:', queryError)
      throw new Error('查询数据库时发生错误。')
    }
    if (!games || games.length === 0) {
      await supabaseAdmin.from('user_guesses').insert({
        user_identifier: userId,
        game_id: null,
        submitted_text: guess,
        ip_address: ip_address,
        is_correct: false,
      })
      throw new Error('并没有这个游戏哦，换一个试试？')
    }
    if (games.length > 1) {
      throw new Error(
        `找到了多个游戏，请说得更具体一点！例如：${games
          .slice(0, 2)
          .map((g) => g.name)
          .join(' 或 ')}`
      )
    }
    const game = games[0]
    const { data: existingGuess } = await supabaseAdmin
      .from('user_guesses')
      .select('id')
      .eq('user_identifier', userId)
      .eq('game_id', game.id)
      .single()
    if (existingGuess) {
      throw new Error('你已经找到这个游戏啦！')
    }
    const { error: insertError } = await supabaseAdmin.from('user_guesses').insert({
      user_identifier: userId,
      game_id: game.id,
      submitted_text: guess,
      ip_address: ip_address,
      is_correct: true,
    })
    if (insertError) {
      throw new Error('记录出错，请重试。')
    }
    return new Response(
      JSON.stringify({
        data: game,
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
    console.error('Error in guess-game function:', err.message)
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
