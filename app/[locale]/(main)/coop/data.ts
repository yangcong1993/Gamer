// file: app/friends/data.ts

export interface Friend {
  href: string
  avatar: string
  name: string
  description: string
  rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
}

export const friendsData: Friend[] = [
  {
    href: 'https://cyp0633.icu',
    avatar: 'https://cyp0633-public-resource.oss-cn-qingdao.aliyuncs.com/blog/cyp0633-icon.jpg',
    name: 'Cyp0633',
    description: '我们都曾是海滩上玩沙堡的孩子。现在仍是，只不过不在海滩上罢了。',
    rank: 1,
  },
  {
    href: 'http://elmagnifico.tech/',
    avatar: 'http://elmagnifico.tech/img/avatar.jpg',
    name: "Elmagnifico's Blog",
    description: 'C/C++，Python，Java，以及游戏等',
    rank: 2,
  },
  {
    href: 'https://skywt.cn',
    avatar: 'https://blog.skywt.cn/usr/themes/Daydream/assets/img/avatar.png',
    name: 'SkyWt',
    description: '我们的征途是星辰大海',
    rank: 10,
  },
  {
    href: 'https://www.velasx.com',
    avatar: 'https://public-1252562537.cos.ap-guangzhou.myqcloud.com/avatar.jpg',
    name: 'Velas电波站',
    description: '非正常信号发射与搜寻装置',
    rank: 10,
  },
  {
    href: 'https://ichika.cc',
    avatar: 'https://cdn.ichika.cc/page/HeadIcon.jpg',
    name: 'ichika',
    description: 'Hello,gamer!',
    rank: 3,
  },
  {
    href: 'https://funnywii.com',
    avatar: 'https://funnywii.com/upload/icon4.jpg',
    name: "FunnyWii's Zone",
    description: '算法攻城狮/皮具爱好者/摩托骑不倒/吉他能出声',
    rank: 1,
  },
  {
    href: 'https://blog.loccai.top/',
    avatar: 'http://blog.loccai.top/images/head/favicon.ico',
    name: 'LoCCaiの小窝',
    description: '你撑把小纸伞|叹姻缘太婉转',
    rank: 1,
  },
  {
    href: 'https://ssshooter.com',
    avatar: 'https://ssshooter.com/logo.png',
    name: 'UsubeniFantasy',
    description: "Write like you're running out of time.",
    rank: 1,
  },
  {
    href: 'https://www.ittoolman.top',
    avatar: 'https://www.ittoolman.top/images/avatar.png',
    name: "dellevin's blog",
    description: '望山叹高，登愈艰。入世哀难，伤无泪',
    rank: 1,
  },
  {
    href: 'https://blog.mufanc.xyz',
    avatar: 'https://blog.mufanc.xyz/assets/images/avatar.jpeg',
    name: 'Mufanc',
    description: '永不落幕の前奏詩',
    rank: 1,
  },
]
