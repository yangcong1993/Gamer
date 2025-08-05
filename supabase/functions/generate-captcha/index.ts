import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const ENCRYPTION_KEY_SECRET = Deno.env.get('CAPTCHA_SECRET_KEY')
if (!ENCRYPTION_KEY_SECRET) {
  throw new Error('CAPTCHA_SECRET_KEY environment variable is not set!')
}
async function getDerivedKey(secret) {
  const encodedSecret = new TextEncoder().encode(secret)
  const hash = await crypto.subtle.digest('SHA-256', encodedSecret)
  return hash
}
async function encrypt(text) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(text)
  const derivedKey = await getDerivedKey(ENCRYPTION_KEY_SECRET)
  const key = await crypto.subtle.importKey(
    'raw',
    derivedKey,
    {
      name: 'AES-GCM',
    },
    false,
    ['encrypt']
  )
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoded
  )
  const ivB64 = btoa(String.fromCharCode.apply(null, iv))
  const ciphertextB64 = btoa(String.fromCharCode.apply(null, new Uint8Array(ciphertext)))
  return `${ivB64}.${ciphertextB64}`
}
function generateArithmeticProblem() {
  const operator = Math.random() > 0.5 ? '+' : '-'
  let num1 = Math.floor(Math.random() * 10) + 1 // 1-10
  let num2 = Math.floor(Math.random() * 10) + 1 // 1-10
  if (operator === '-') {
    if (num1 < num2) {
      ;[num1, num2] = [num2, num1]
    }
  }
  const problem = `${num1} ${operator} ${num2}`
  const answer = operator === '+' ? num1 + num2 : num1 - num2
  return {
    problem,
    answer,
  }
}
function generateIntegralProblem() {
  const n = Math.floor(Math.random() * 2) // n 将是 0 或 1
  const a = Math.floor(Math.random() * 5) + 1 // 系数 a: 1-5
  const c = Math.floor(Math.random() * 4) + 1 // 积分上限 c: 1-4
  const b = 0 // 积分下限 b 固定为 0 以简化计算
  let func, problem, answer
  if (n === 0) {
    func = `${a}`
    answer = a * (c - b)
  } else {
    func = a === 1 ? 'x' : `${a}x`
    answer = (a / 2) * (c * c - b * b)
  }
  problem = `\\int_{${b}}^{${c}} ${func} \\,dx`
  return {
    problem,
    answer,
  }
}
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }
  try {
    let captcha
    if (Math.random() > 0.5) {
      captcha = generateArithmeticProblem()
    } else {
      captcha = generateIntegralProblem()
    }
    const validationToken = await encrypt(captcha.answer.toString())
    const data = {
      problem: captcha.problem,
      validation: validationToken,
    }
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    })
  } catch (err) {
    console.error('Error in generate-captcha:', err)
    return new Response(
      JSON.stringify({
        error: err.message,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    )
  }
})
