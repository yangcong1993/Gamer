export interface Project {
  type: 'external' | 'internal' // 'external' 表示外链，'internal' 表示内部项目
  title: string
  description: string
  imgSrc: string
  href?: string
  details?: string
}

const projectsData: Project[] = [
  {
    type: 'external',
    title: 'Ripple Movie V1.1',
    description: `115网盘蓝光原盘检索工具`,
    imgSrc: '/static/images/ripple-movie.png',
    href: 'https://ripp-movie.hiripple.com',
  },
  {
    type: 'internal',
    title: 'API',
    description: `hiRipple提供的API接口`,
    imgSrc: '/static/images/image-placeholder.webp',
    href: 'https://hiripple.com/api',
    details: `
  ### 🎮 随机游戏图片 - API

  
  **请求方式**: \`GET\`
  
  **请求地址**: 
  \`\`\`
  https://api.hiripple.com/api/pic
  \`\`\`
  
  **参数说明**:
  - \`type\`: 0/1 (选填)
    - \`type=0\`: 返回竖屏壁纸
    - \`type=1\`: 返回横屏壁纸
  - \`image\`: 0/1 (选填，默认0)
    - \`image=1\`: 直接返回随机图片
  
  **壁纸库来源**: 
  - Ripple自建图床，壁纸正在补充中，欢迎上传！
  
  **示例请求**:
  \`\`\`
  https://api.hiripple.com/api/pic?type=0&image=1
  \`\`\`
  
  ---
  
  ### 💬 一言 - API
  
  **请求方式**: \`GET\`
  
  **请求地址**: 
  \`\`\`
  https://api.hiripple.com/api/oneword
  \`\`\`
  
  **参数说明**: 
  - 无需参数
  
  **返回数据格式**:
  \`\`\`json
  {
    "words": "犹豫就会败北。",
    "source": "苇名一心（《只狼》）"
  }
  \`\`\`
  
  **备注**: 
  - 此API没有使用数据库
  - 一言库来源：[https://cloud.hiripple.com/s/EXhO](https://cloud.hiripple.com/s/EXhO) 
  - 欢迎补充！
  
  **示例请求**:
  \`\`\`
  https://api.hiripple.com/api/oneword
  \`\`\`  `,
  },
  {
    type: 'external',
    title: 'Wallpaper',
    description: `Ripple自建的游戏壁纸网站`,
    imgSrc: 'https://772123.xyz/newblog/wp14158641-elden-ring-dlc-wallpapers.jpg',
    href: 'https://wallpaper.hiripple.com/',
  },
  {
    type: 'external',
    title: 'Ripple-ai',
    description: `一站式Ai服务，为网页生成Ai摘要 / Ai插图 / 语音合成`,
    imgSrc: 'https://772123.xyz/newblog/335e9a57455eb59b2b401f708770c047.jpeg',
    href: 'https://github.com/CelestialRipple/RippleAi-Summary-Illustration-TTS',
  },
  {
    type: 'external',
    title: 'Koishi框架 游戏相关插件',
    description: `游戏新闻订阅、发售提醒、游戏库查询等`,
    imgSrc: 'https://772123.xyz/newblog/ad012abc570e27e75a23669ed94d37f8.png',
    href: 'https://www.npmjs.com/~rippppp',
  },
]

export default projectsData
