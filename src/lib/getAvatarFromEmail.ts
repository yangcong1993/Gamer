import md5 from 'blueimp-md5'

export function getAvatarFromEmail(email: string | null | undefined, size = 64): string {
  if (!email) return '/images/default-avatar.png'

  const lower = email.trim().toLowerCase()

  if (/^\d{5,10}@qq\.com$/.test(lower)) {
    const qq = lower.replace('@qq.com', '')
    return `https://q3.qlogo.cn/g?b=qq&nk=${qq}&s=100`
  }

  const hash = md5(lower)
  return `https://gravatar.loli.net/avatar/${hash}?s=${size}&d=identicon`
}
