// 类型定义，与 CharacterOverlay 中的保持一致
type DialogueSegment = {
  text: string
  face?: string
}

export type DialoguePiece = {
  segments: DialogueSegment[]
  face: string
  isNameConfirmation?: boolean
  confirmText?: string
  denyText?: string
}

/**
 * @description 根据当前时间生成一句问候语。
 * @returns {DialoguePiece} 返回一个基于时间段的对话对象。
 */
export const getTimeBasedDialogue = (): DialoguePiece => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 8) {
    return {
      face: 'niko_surprised.png',
      segments: [{ text: '{name}，没想到你起地这么早，真是个好习惯！' }],
    }
  }
  if (hour >= 8 && hour < 12) {
    return {
      face: 'niko_yawn.png',
      segments: [{ text: '早上好，{name}。昨晚睡的好吗？niko梦到自己「回家」了……' }],
    }
  }
  if (hour >= 12 && hour < 15) {
    return {
      face: 'niko3.png',
      segments: [{ text: '下午好，{name}。如果累了的话，去睡一个午觉吧～' }],
    }
  }
  if (hour >= 15 && hour < 18) {
    return {
      face: 'niko_speak.png',
      segments: [{ text: 'niko喜欢在傍晚看着天边的晚霞。{name}，此时你的世界也看的到吗？' }],
    }
  }
  if (hour >= 18 && hour < 22) {
    return {
      face: 'niko6.png',
      segments: [{ text: '夜幕降临，{name}，你晚上会做些什么呢？' }],
    }
  }
  if (hour >= 22 && hour < 23) {
    return {
      face: 'niko_yawn.png',
      segments: [{ text: '已经10点多了，{name}，要好好休息哦' }],
    }
  }
  if (hour >= 23 && hour < 24) {
    return {
      face: 'niko_yawn.png',
      segments: [{ text: '已经11点多了，{name}，要好好休息哦' }],
    }
  }
  return {
    face: 'niko_yawn.png',
    segments: [{ text: '已经凌晨了… {name}，不要再熬夜了哦。' }],
  }
}

/**
 * @description 通过 Geoapify API 将经纬度转换为城市名称。
 * @param lat 纬度
 * @param lng 经度
 * @returns {Promise<string>} 返回城市名称或一个备用字符串。
 */
export const getCityName = async (lat: number, lng: number): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY

  if (!apiKey) {
    console.warn('Geoapify API key is missing in .env.local')
    return `经纬度 (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`
  }

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&lang=zh&apiKey=${apiKey}`
    )

    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.statusText}`)
    }

    const data = await response.json()

    const city = data.features?.[0]?.properties?.city
    const state = data.features?.[0]?.properties?.state
    const county = data.features?.[0]?.properties?.county

    if (city) return city
    if (state) return state
    if (county) return county

    return '一个很特别的地方'
  } catch (error) {
    console.error('Failed to fetch city name:', error)
    return '一个很神秘的地方'
  }
}

export const locationDialogues = {
  permissionRequest: {
    face: 'niko_speak.png',
    segments: [
      { text: '那个… {name}，我能试试感知一下你现在所在的地方吗？', face: 'niko4.png' },
      { text: '也许有一天，我会跑到你的身边！', face: 'niko_smile.png' },
    ],
    isNameConfirmation: true,
    confirmText: '可以呀',
    denyText: '还是不要了',
  },
  userDenies: {
    face: 'niko_distressed.png',
    segments: [{ text: '哦…好的，没关系！我尊重你的决定。' }],
  },
  requestSuccess: {
    face: 'niko_shock.png',
    segments: [],
  },
  requestFailure: {
    face: 'niko_upset.png',
    segments: [
      { text: '嗯…？我想试着感知一下你那边，但好像失败了…', face: 'niko_distressed2.png' },
      { text: '没关系，我们下次再试试吧！', face: 'niko.png' },
    ],
  },
}

export const getRealtimeStatusDialogue = async (): Promise<DialoguePiece | null> => {
  try {
    const response = await fetch(
      'https://cnvskdxccijlakolvxot.supabase.co/functions/v1/realtime-status'
    )

    if (!response.ok) {
      throw new Error(`Realtime API error: ${response.statusText}`)
    }

    const data = await response.json()
    const { appName, timestamp } = data

    if (!appName || !timestamp) {
      console.warn('Realtime API response is missing data.', data)
      return null
    }

    const now = new Date()
    const eventTime = new Date(timestamp)
    const diffMs = now.getTime() - eventTime.getTime()
    const diffMinutes = Math.round(diffMs / (1000 * 60))

    let timeAgo: string
    if (diffMinutes < 1) {
      timeAgo = '刚才'
    } else {
      timeAgo = `${diffMinutes}分钟前`
    }

    const dialogue: DialoguePiece = {
      face: 'niko_surprised.png',
      segments: [
        {
          text: `「${timeAgo}」Ripp和我说……他去了一个叫「${appName}」的地方。`,
          face: 'niko_what.png',
        },
        { text: '{name}，你也去过吗？', face: 'niko_speak.png' },
      ],
    }

    return dialogue
  } catch (error) {
    console.error('Failed to fetch realtime status:', error)
    return null
  }
}

export const getFaceAnalysisDialogue = async (imageBlob: Blob): Promise<DialoguePiece> => {
  const formData = new FormData()
  formData.append('image_file', imageBlob)

  try {
    const response = await fetch('/api/analyze-face', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok || data.error_message) {
      throw new Error(data.error_message || 'Failed to analyze face.')
    }

    if (!data.faces || data.faces.length === 0) {
      return { face: 'niko_sad.png', segments: [{ text: '嗯？我好像没有看到你…' }] }
    }

    const face = data.faces[0]
    const attrs = face.attributes

    const segments: DialogueSegment[] = []
    segments.push({ text: '让我想一想…', face: 'niko_speak.png' })

    const gender = attrs.gender?.value
    const maleBeauty = attrs.beauty?.male_score ?? 75
    const femaleBeauty = attrs.beauty?.female_score ?? 75
    const beauty = Math.round((maleBeauty + femaleBeauty) / 2)

    if (beauty >= 80) {
      if (gender === 'Male') {
        segments.push(
          {
            text: `呃，请允许niko组织一下语言……`,
            face: 'niko_shock.png',
          },
          {
            text: ` 虽然看起来像是男生……但{name}，你是niko见过「最可爱」的人（好想真正地见你一面）`,
            face: 'niko_shock.png',
          }
        )
      } else if (gender === 'Female') {
        segments.push(
          {
            text: `呃，请允许niko组织一下语言……`,
            face: 'niko_shock.png',
          },
          {
            text: ` 绝对发自真心！{name}，你是niko见过「最可爱」的女孩！（好想真正地见你一面）`,
            face: 'niko_shock.png',
          }
        )
      }
    } else if (beauty >= 70) {
      if (gender === 'Male') {
        segments.push(
          {
            text: `哇，没想到你居然长这样……`,
            face: 'niko_surprised.png',
          },
          {
            text: ` 看起来像是男生……但{name}，你真的「好可爱」！`,
            face: 'niko_smile.png',
          }
        )
      } else if (gender === 'Female') {
        segments.push(
          {
            text: `哇，没想到你居然长这样……`,
            face: 'niko_surprised.png',
          },
          {
            text: ` {name}，你真是个「好可爱」的女孩！`,
            face: 'niko_smile.png',
          }
        )
      }
    } else if (beauty >= 60) {
      if (gender === 'Male') {
        segments.push(
          {
            text: `哇，没想到你居然长这样……`,
            face: 'niko3.png',
          },
          {
            text: ` 看起来像是男生……但却「有些可爱」呢！`,
            face: 'niko4.png',
          }
        )
      } else if (gender === 'Female') {
        segments.push(
          {
            text: `哇，没想到你居然长这样……`,
            face: 'niko3.png',
          },
          {
            text: ` {name}，你让niko回忆起了小时候，看起来像是位「可爱」的邻家少女！`,
            face: 'niko4.png',
          }
        )
      }
    } else {
      segments.push({ text: `{name}，你看起来非常舒服和亲切呢`, face: 'niko.png' })
    }
    if (segments.length <= 1) {
      return { face: 'niko.png', segments: [{ text: '嗯…我看清你的脸了！真可爱～' }] }
    }

    const age = attrs.age?.value
    if (age !== undefined) {
      segments.push({ text: `真意想不到，你看起来才 ${age} 岁，对吗？`, face: 'niko_83c.png' })
    }

    const smileValue = attrs.smile?.value ?? 0
    const emotionData = attrs.emotion

    if (smileValue > 50) {
      segments.push({ text: '笑容很灿烂呢，我也为你感到开心！', face: 'niko_smile.png' })
    } else if (emotionData) {
      // 找到置信度最高的情绪
      const topEmotion = Object.entries(emotionData).reduce((a, b) =>
        (b[1] as number) > (a[1] as number) ? b : a
      )[0]

      switch (topEmotion) {
        case 'happiness':
          segments.push({
            text: `笑容很灿烂呢，我也为你感到开心！有什么好事发生吗？`,
            face: 'niko_smile.png',
          })
          break
        case 'sadness':
          segments.push({ text: '感觉你有点伤心… 需要一个拥抱吗？', face: 'niko_sad.png' })
          break
        case 'surprise':
          segments.push({ text: '哇！你看起来有点惊讶！', face: 'niko_surprised.png' })
          break
        default:
          segments.push({
            text: `但是，感觉你没什么表情呢……有什么烦恼吗？`,
            face: 'niko_eyeclosed.png',
          })
      }
    }
    return { face: 'niko_smile.png', segments }
  } catch (error) {
    console.error('Face++ API call failed:', error)
    return {
      face: 'niko_upset.png',
      segments: [{ text: '呜… 失败了，可能是跨纬度的连接出现了问题。' }],
    }
  }
}

export const faceAnalysisDialogues = {
  permissionRequest: {
    face: 'niko_speak.png',
    segments: [
      { text: '{name}，谢谢你陪了niko这么久。', face: 'niko_upset.png' },
      {
        text: '虽然有些冒昧，但可以让niko通过「摄像头」和你见一面吗？',
        face: 'niko.png',
      },
    ],
    isNameConfirmation: true,
    confirmText: '好呀',
    denyText: '不太方便',
  },
  userDenies: {
    face: 'niko_sad.png',
    segments: [{ text: '这样啊…没关系，我理解的！' }],
  },
}
