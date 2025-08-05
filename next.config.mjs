// next.config.mjs

import { withContentlayer } from 'next-contentlayer2'
import withBundleAnalyzer from '@next/bundle-analyzer'
import createNextIntlPlugin from 'next-intl/plugin'
import { locales, defaultLocale } from './i18n/index.js'

const nextIntl = createNextIntlPlugin({
  locales,
  defaultLocale,
})

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/* ---------- CSP -------------------------------------------------------- */
const mediaSrc = ["'self'", 'blob:', 'data:', '*.s3.amazonaws.com']
if (process.env.NODE_ENV === 'development') {
  mediaSrc.push('http://192.168.5.68:3000')
  mediaSrc.push('http://192.168.5.34:3000')
}

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app analytics.umami.is cdn.apple-livephotoskit.com platform.twitter.com cpwebassets.codepen.io;
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src ${mediaSrc.join(' ')} 772123.xyz;
  connect-src *;
  font-src 'self';
  frame-src giscus.app codepen.io;
`

const securityHeaders = [
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim() },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self)' },
]

/* ---------- 其他可从环境变量读取 ------------------------------------- */
const output = process.env.EXPORT ? 'export' : undefined
const basePath = process.env.BASE_PATH || undefined
const unoptimized = !!process.env.UNOPTIMIZED

/** @type {import('next').NextConfig} */
const baseConfig = {
  output,
  basePath,
  reactStrictMode: true,
  trailingSlash: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  eslint: { dirs: ['app', 'components', 'layouts', 'scripts'] },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '772123.xyz' },
      { protocol: 'https', hostname: 'cyp0633-public-resource.oss-cn-qingdao.aliyuncs.com' },
      { protocol: 'http', hostname: 'elmagnifico.tech' },
      { protocol: 'https', hostname: 'blog.skywt.cn' },
      { protocol: 'https', hostname: 'public-1252562537.cos.ap-guangzhou.myqcloud.com' },
      { protocol: 'https', hostname: 'cdn.ichika.cc' },
      { protocol: 'https', hostname: 'funnywii.com' },
      { protocol: 'http', hostname: 'blog.loccai.top' },
      { protocol: 'https', hostname: 'ssshooter.com' },
      { protocol: 'https', hostname: 'www.ittoolman.top' },
      { protocol: 'https', hostname: 'blog.mufanc.xyz' },
      { protocol: 'https', hostname: 'wallpaper-inner.hiripple.com' },
      { protocol: 'https', hostname: 'qnmob3.doubanio.com' },
      { protocol: 'https', hostname: 'hiripple.com' },
      { protocol: 'https', hostname: 'gravatar.loli.net' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'q3.qlogo.cn' },
    ],
    unoptimized,
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  async redirects() {
    return [
      {
        source: '/archives/3813',
        destination: '/zh/blog/2024-12-29-strmemby无痛刮削，应对网盘风控新策略',
        permanent: true,
      },
      {
        source: '/archives/626',
        destination: '/zh/blog/2021-11-13-从零开始搭建xray服务器（vless协议）',
        permanent: true,
      },
      {
        source: '/archives/2478',
        destination: '/zh/blog/2022-10-16-hysteria：能否让校园网歇斯底里？',
        permanent: true,
      },
      {
        source: '/archives/1011',
        destination: '/zh/blog/2022-02-14-请制御我！oneshot：独立和metagame',
        permanent: true,
      },
      {
        source: '/archives/548',
        destination: '/zh/blog/2021-11-13-如何提高观影体验？dmitrirender与svp-pro详解',
        permanent: true,
      },
      {
        source: '/archives/1770',
        destination: '/zh/blog/2022-10-13-向大家推荐一个网站',
        permanent: true,
      },
      {
        source: '/archives/687',
        destination: '/zh/blog/2021-12-16-各大平台的脚本市场',
        permanent: true,
      },
      {
        source: '/archives/3431',
        destination: '/zh/blog/2023-11-08-nas折腾记2️⃣：玩转homeassistant与plex',
        permanent: true,
      },
      {
        source: '/archives/1786',
        destination: '/zh/blog/2022-10-16-hysteria：能否让校园网歇斯底里',
        permanent: true,
      },
      {
        source: '/archives/669',
        destination: '/zh/blog/2021-12-01-校园网ipv6免流终级导航（以湖南大学为例）',
        permanent: true,
      },
      {
        source: '/archives/3407',
        destination: '/zh/blog/2023-11-03-nas折腾记1️⃣：从openwrt到unraid',
        permanent: true,
      },
      {
        source: '/archives/970',
        destination: '/zh/blog/2022-07-19-穿越时空的鬼才创意-小岛秀夫与gba游戏《我们',
        permanent: true,
      },
      {
        source: '/archives/2567',
        destination: '/zh/blog/2023-01-11-steam游戏信息查询程序设计（node-js',
        permanent: true,
      },
      {
        source: '/archives/3874',
        destination: '/zh/blog/m4-macbook-air',
        permanent: true,
      },
      {
        source: '/archives/170',
        destination: '/zh/blog/2021-11-13-如何提高观影体验？dmitrirender与svp-pro详解',
        permanent: true,
      },
      {
        source: '/archives/236',
        destination:
          '/zh/blog/2021-11-14-ac2100使用breed不死后台刷入padavan老毛子固件无线桥接校园网',
        permanent: true,
      },
      {
        source: '/archives/567',
        destination: '/zh/blog/2021-11-20-搭建青龙面板',
        permanent: true,
      },
      {
        source: '/ripple-movie',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/api',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/self-host-web',
        destination: '/projects',
        permanent: true,
      },
    ]
  },
  webpack(config) {
    config.module.rules.push({ test: /\.svg$/, use: ['@svgr/webpack'] })
    return config
  },
}

const composedPlugins = bundleAnalyzer(withContentlayer(baseConfig))

export default nextIntl(composedPlugins)
