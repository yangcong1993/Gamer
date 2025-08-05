'use client'
import { PhotoCapture } from './PhotoCapture'
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react'
import Image from 'next/image'
import Footprints from './Footprints'
import { DialogueBox, type DialogueBoxHandle } from './DialogueBox'
import { createClient } from '@/lib/client'
import { useGamepadVibration } from '@/lib/useGamepadVibration'
import {
  getTimeBasedDialogue,
  locationDialogues,
  getCityName,
  faceAnalysisDialogues,
  getFaceAnalysisDialogue,
  getRealtimeStatusDialogue,
} from './SpecialDialogueGenerator'

// --- 配置常量 ---
const FRAME_WIDTH = 48
const FRAME_HEIGHT = 64
const ANIMATION_SPEED = 150
const PIXELS_PER_SECOND = 400
const GAMEPAD_AXIS_THRESHOLD = 0.5
const SCROLL_THRESHOLD = 80

const directions = { down: 0, left: 1, right: 2, up: 3 } as const
type Direction = keyof typeof directions
const INTERACTIVE_TAGS = new Set(['A', 'BUTTON', 'INPUT', 'TEXTAREA'])
const KEY_CODES = {
  SPACE: ' ',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
} as const

// --- 类型定义 ---
type DialogueSegment = {
  text: string
  face?: string
}

type DialoguePiece = {
  segments: readonly DialogueSegment[]
  face: string
}

type DialogueLibrary = {
  greetings: DialoguePiece[]
  generics: DialoguePiece[]
  pageSpecific: Record<string, DialoguePiece[]>
}

const INTERACTION_KEYS: string[] = [
  KEY_CODES.SPACE,
  KEY_CODES.ENTER,
  KEY_CODES.ESCAPE,
  KEY_CODES.ARROW_UP,
  KEY_CODES.ARROW_DOWN,
  KEY_CODES.ARROW_LEFT,
  KEY_CODES.ARROW_RIGHT,
]

enum DialogueState {
  INITIAL = 'initial',
  NAME_CONFIRMATION = 'name_confirmation',
  NAME_INPUT = 'name_input',
  NORMAL = 'normal',
}

let hasGreetedInThisSession = false

const nameSetupTemplates = {
  nameConfirmation: {
    segments: [
      { text: '有人在吗？', face: 'niko_sad.png' },
      { text: '……{name}？', face: 'niko_speak.png' },
      { text: '你……在吗', face: 'niko_eyeclosed.png' },
    ],
    face: 'niko_speak.png',
    isNameConfirmation: true,
    confirmText: '我在',
    denyText: '我不叫那个名字哦',
  },
  askForName: {
    segments: [
      { text: '有人在吗？', face: 'niko_sad.png' },
      { text: '你……你好？', face: 'niko_speak.png' },
      { text: '你愿意告诉我你的名字吗？', face: 'niko_speak.png' },
    ],
    face: 'niko.png',
    isNameConfirmation: true,
    confirmText: '愿意',
    denyText: '不愿意',
  },
  nameInput: {
    segments: [{ text: '那……你叫什么名字呢？' }],
    face: 'niko.png',
    isNameInput: true,
  },
  defaultName: {
    segments: [
      { text: '呃、这样啊……', face: 'niko_sad.png' },
      { text: '那……就叫你"玩家"吧！' },
      { text: '很、很高兴认识你，玩家！', face: 'niko_smile.png' },
      { text: '我叫niko！', face: 'niko_smile.png' },
      { text: '看起来……又跑到了一个新的世界……', face: 'niko_upset2.png' },
      { text: '你可以用方向键移动、空格/回车确认、esc切换控制。', face: 'niko.png' },
      { text: '那……一起调查一下这里吧', face: 'niko_yawn.png' },
    ],
    face: 'niko.png',
  },
  welcomeNew: {
    segments: [
      { text: '很、很高兴认识你，{name}！', face: 'niko.png' },
      { text: '我叫niko！', face: 'niko_smile.png' },
      { text: '看起来……又跑到了一个新的世界……', face: 'niko_upset2.png' },
      { text: '你可以用方向键移动、空格/回车调查或对话、esc切换控制。', face: 'niko.png' },
      { text: '那……一起调查这里吧', face: 'niko_yawn.png' },
    ],
    face: 'niko_smile.png',
  },
} as const

interface CharacterOverlayProps {
  contentRef: React.RefObject<HTMLDivElement | null>
  isControlActive: boolean
  pathname: string
}
export interface CharacterOverlayHandle {
  notifyClick: (event: React.MouseEvent<HTMLDivElement>) => void
}
const CharacterOverlay = forwardRef<CharacterOverlayHandle, CharacterOverlayProps>(
  function CharacterOverlay({ contentRef, pathname, isControlActive }, ref) {
    const [position, setPosition] = useState({ x: 50, y: 50 })
    const [direction, setDirection] = useState<Direction>('down')
    const [frame, setFrame] = useState(0)
    const [isWalking, setIsWalking] = useState(false)
    const [isOverClickable, setIsOverClickable] = useState(false)
    const [isDialogueActive, setIsDialogueActive] = useState(false)
    const [dialogueQueue, setDialogueQueue] = useState<
      (DialoguePiece & {
        isNameInput?: boolean
        isNameConfirmation?: boolean
        confirmText?: string
        denyText?: string
      })[]
    >([])
    const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0)
    const [userName, setUserName] = useState('玩家')
    const [dialogueState, setDialogueState] = useState<DialogueState>(DialogueState.INITIAL)
    const [hasInitializedUser, setHasInitializedUser] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [dialogues, setDialogues] = useState<DialogueLibrary>({
      greetings: [],
      generics: [],
      pageSpecific: {},
    })
    const [isLoadingDialogues, setIsLoadingDialogues] = useState(true)
    const [dialogueError, setDialogueError] = useState<string | null>(null)
    const [showPhotoCapture, setShowPhotoCapture] = useState(false)
    const [confirmationContext, setConfirmationContext] = useState<'name' | 'location' | 'face'>(
      'name'
    )

    // --- Refs ---
    const overlayRef = useRef<HTMLDivElement>(null)
    const characterRef = useRef<HTMLDivElement>(null)
    const bubbleRef = useRef<HTMLDivElement>(null)
    const dialogueBoxRef = useRef<DialogueBoxHandle>(null)
    const prevPathnameRef = useRef<string | undefined>(undefined)

    const stateRef = useRef({
      keysPressed: {} as { [key: string]: boolean },
      lastFrameTime: performance.now(),
      lastAnimationTime: 0,
      gamepadIndex: null as number | null,
      shouldResetOnNav: true,
      hoverCheckTimeout: null as NodeJS.Timeout | null,
    })

    const supabase = useMemo(() => createClient(), [])
    const { vibrateClick } = useGamepadVibration()
    const normalizePathname = useCallback((path: string): string => {
      const localeRegex = /^\/[a-z]{2}(-[A-Z]{2})?\//
      return path.replace(localeRegex, '/')
    }, [])

    const getRandomDialogue = useCallback((dialogueArray: DialoguePiece[]) => {
      if (!dialogueArray || dialogueArray.length === 0) return null
      const randomIndex = Math.floor(Math.random() * dialogueArray.length)
      return dialogueArray[randomIndex]
    }, [])
    const getElementUnderCharacter = useCallback(() => {
      if (!characterRef.current) return null

      characterRef.current.style.pointerEvents = 'none'
      const charRect = characterRef.current.getBoundingClientRect()
      const targetX = charRect.left + charRect.width / 2
      const targetY = charRect.bottom - 10
      const element = document.elementFromPoint(targetX, targetY)
      characterRef.current.style.pointerEvents = 'auto'

      return element
    }, [])

    const handlePhotoTaken = useCallback(async (imageBlob: Blob) => {
      setShowPhotoCapture(false)
      setDialogueQueue([{ face: 'niko_yawn.png', segments: [{ text: '看到你啦，思考中…' }] }])
      setCurrentDialogueIndex(0)
      setIsDialogueActive(true)

      try {
        const resultDialogue = await getFaceAnalysisDialogue(imageBlob)
        setDialogueQueue([resultDialogue])
      } catch (error) {
        console.error('拍照分析失败:', error)
        const failureDialogue: DialoguePiece = {
          face: 'niko_upset.png',
          segments: [{ text: '呜… 分析失败了，可能是网络连接出现了问题。' }],
        }
        setDialogueQueue([failureDialogue])
      } finally {
        setCurrentDialogueIndex(0)
        setIsDialogueActive(true)
      }
    }, [])

    const handleCancelPhoto = useCallback(() => {
      setShowPhotoCapture(false)
      setDialogueQueue([faceAnalysisDialogues.userDenies])
      setCurrentDialogueIndex(0)
      setIsDialogueActive(true)
    }, [])

    const handleLocationConsent = useCallback((confirmed: boolean) => {
      if (confirmed) {
        ;(async () => {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported.'))
                return
              }
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
            })

            const { latitude, longitude } = position.coords
            const cityName = await getCityName(latitude, longitude)

            const successDialogue: DialoguePiece = {
              face: 'niko_surprise.png',
              segments: [
                {
                  text: `哇，成功了！ {name}，你现在是不是在「 ${cityName} 」附近？`,
                  face: 'niko_smile.png',
                },
                { text: '那会是一个什么样的地方呢？', face: 'niko3.png' },
              ],
            }
            setDialogueQueue([successDialogue])
          } catch (error) {
            setDialogueQueue([locationDialogues.requestFailure])
          } finally {
            setCurrentDialogueIndex(0)
            setIsDialogueActive(true)
            setConfirmationContext('name')
          }
        })()
      } else {
        setDialogueQueue([locationDialogues.userDenies])
        setCurrentDialogueIndex(0)
        setIsDialogueActive(true)
        setConfirmationContext('name')
      }
    }, [])

    const initializeUser = useCallback(async () => {
      if (hasInitializedUser) return

      const savedName = localStorage.getItem('character_user_name')

      if (savedName) {
        setUserName(savedName)
        setDialogueState(DialogueState.NORMAL)
      } else {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            setIsLoggedIn(true)
            const displayName =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split('@')[0] ||
              '用户'
            setUserName(displayName)
            setDialogueState(DialogueState.NAME_CONFIRMATION)
          } else {
            setIsLoggedIn(false)
            setDialogueState(DialogueState.INITIAL)
          }
        } catch (error) {
          console.error('获取用户信息失败:', error)
          setIsLoggedIn(false)
          setDialogueState(DialogueState.INITIAL)
        }
      }
      setHasInitializedUser(true)
    }, [hasInitializedUser, supabase.auth])

    const startDialogue = useCallback(async () => {
      // 清理按键状态
      Object.keys(stateRef.current.keysPressed).forEach((key) => {
        stateRef.current.keysPressed[key] = false
      })
      setIsWalking(false)

      if (isLoadingDialogues || dialogueError) {
        if (dialogueError) console.error('无法开始对话，因为:', dialogueError)
        return
      }
      if (isDialogueActive) return
      if (!hasInitializedUser) {
        initializeUser()
        return
      }

      let dialogueQueueToSet: (DialoguePiece & {
        isNameInput?: boolean
        isNameConfirmation?: boolean
        confirmText?: string
        denyText?: string
      })[] = []

      switch (dialogueState) {
        case DialogueState.INITIAL:
          dialogueQueueToSet = [nameSetupTemplates.askForName]
          break
        case DialogueState.NAME_CONFIRMATION:
          dialogueQueueToSet = [nameSetupTemplates.nameConfirmation]
          break
        case DialogueState.NAME_INPUT:
          dialogueQueueToSet = [nameSetupTemplates.nameInput]
          break
        case DialogueState.NORMAL: {
          let dialogueToShow: DialoguePiece | null = null

          if (!hasGreetedInThisSession) {
            dialogueToShow = getRandomDialogue(dialogues.greetings)
            hasGreetedInThisSession = true
          } else {
            const triggerSpecial = Math.random() < 0.1

            if (triggerSpecial) {
              const unseenOnceOnlyDialogues: ('location' | 'face')[] = []
              if (!localStorage.getItem('special_dialogue_seen_location')) {
                unseenOnceOnlyDialogues.push('location')
              }
              if (!localStorage.getItem('special_dialogue_seen_face')) {
                unseenOnceOnlyDialogues.push('face')
              }

              if (unseenOnceOnlyDialogues.length > 0) {
                const randomIndex = Math.floor(Math.random() * unseenOnceOnlyDialogues.length)
                const chosenDialogueType = unseenOnceOnlyDialogues[randomIndex]

                if (chosenDialogueType === 'location') {
                  localStorage.setItem('special_dialogue_seen_location', 'true')
                  setConfirmationContext('location')
                  dialogueToShow = locationDialogues.permissionRequest
                } else if (chosenDialogueType === 'face') {
                  localStorage.setItem('special_dialogue_seen_face', 'true')
                  setConfirmationContext('face')
                  dialogueToShow = faceAnalysisDialogues.permissionRequest
                }
              } else {
                const repeatableDialogues = ['time', 'realtime']
                const randomIndex = Math.floor(Math.random() * repeatableDialogues.length)
                const chosenDialogueType = repeatableDialogues[randomIndex]

                if (chosenDialogueType === 'time') {
                  dialogueToShow = getTimeBasedDialogue()
                } else {
                  dialogueToShow = await getRealtimeStatusDialogue()
                  if (!dialogueToShow) {
                    dialogueToShow = getTimeBasedDialogue()
                  }
                }
              }
            } else {
              const decodedPathname = decodeURIComponent(pathname)
              const normalizedPath = normalizePathname(decodedPathname)
              const specificDialogues = dialogues.pageSpecific[normalizedPath]
              if (specificDialogues && specificDialogues.length > 0) {
                dialogueToShow = getRandomDialogue(specificDialogues)
              } else {
                dialogueToShow = getRandomDialogue(dialogues.generics)
              }
            }
          }

          if (dialogueToShow) {
            dialogueQueueToSet = [dialogueToShow]
          }
          break
        }
      }

      if (dialogueQueueToSet.length > 0) {
        const finalQueue = dialogueQueueToSet.map((d) => {
          if (d.segments) {
            return {
              ...d,
              segments: d.segments.map((segment) => ({
                ...segment,
                text: segment.text.replace(/{name}/g, userName),
              })),
            }
          }
          return d
        })
        setDialogueQueue(finalQueue)
        setCurrentDialogueIndex(0)
        setIsDialogueActive(true)
      }
    }, [
      isDialogueActive,
      hasInitializedUser,
      dialogueState,
      userName,
      pathname,
      initializeUser,
      isLoadingDialogues,
      dialogueError,
      dialogues,
      getRandomDialogue,
      normalizePathname,
    ])

    const handleNameInput = useCallback((name: string) => {
      setUserName(name)
      localStorage.setItem('character_user_name', name)

      const welcomeTemplate = nameSetupTemplates.welcomeNew
      const welcomeDialogue = {
        ...welcomeTemplate,
        segments: welcomeTemplate.segments.map((segment) => ({
          ...segment,
          text: segment.text.replace('{name}', name),
        })),
      }

      setDialogueQueue([welcomeDialogue])
      setCurrentDialogueIndex(0)
      setDialogueState(DialogueState.NORMAL)
    }, [])

    const handleNameConfirmation = useCallback(
      (confirmed: boolean) => {
        if (dialogueState === DialogueState.INITIAL) {
          if (confirmed) {
            setDialogueState(DialogueState.NAME_INPUT)
            setDialogueQueue([nameSetupTemplates.nameInput])
            setCurrentDialogueIndex(0)
          } else {
            setUserName('玩家')
            localStorage.setItem('character_user_name', '玩家')
            setDialogueQueue([nameSetupTemplates.defaultName])
            setCurrentDialogueIndex(0)
            setDialogueState(DialogueState.NORMAL)
          }
        } else if (dialogueState === DialogueState.NAME_CONFIRMATION) {
          if (confirmed) {
            localStorage.setItem('character_user_name', userName)
            setDialogueState(DialogueState.NORMAL)
            const welcomeTemplate = nameSetupTemplates.welcomeNew
            const welcomeDialogue = {
              ...welcomeTemplate,
              segments: welcomeTemplate.segments.map((segment) => ({
                ...segment,
                text: segment.text.replace('{name}', userName),
              })),
            }
            setDialogueQueue([welcomeDialogue])
            setCurrentDialogueIndex(0)
          } else {
            setDialogueState(DialogueState.NAME_INPUT)
            setDialogueQueue([nameSetupTemplates.nameInput])
            setCurrentDialogueIndex(0)
          }
        }
      },
      [dialogueState, userName]
    )

    const handleConfirmation = useCallback(
      (confirmed: boolean) => {
        if (confirmationContext === 'location') {
          setIsDialogueActive(false)
          handleLocationConsent(confirmed)
        } else if (confirmationContext === 'face') {
          if (confirmed) {
            setIsDialogueActive(false)
            setShowPhotoCapture(true)
          } else {
            setDialogueQueue([faceAnalysisDialogues.userDenies])
            setCurrentDialogueIndex(0)
          }
          setConfirmationContext('name')
        } else {
          handleNameConfirmation(confirmed)
        }
      },
      [confirmationContext, handleLocationConsent, handleNameConfirmation]
    )

    const advanceDialogue = useCallback(() => {
      if (currentDialogueIndex < dialogueQueue.length - 1) {
        setCurrentDialogueIndex((prev) => prev + 1)
      } else {
        setIsDialogueActive(false)
        setDialogueQueue([])
      }
    }, [currentDialogueIndex, dialogueQueue.length])

    const performAction = useCallback(() => {
      if (!contentRef.current) return
      vibrateClick()

      const element = getElementUnderCharacter()

      if (!element) {
        startDialogue()
        return
      }

      let interactiveElement: HTMLElement | null = element as HTMLElement
      let foundInteractive = false
      while (interactiveElement && interactiveElement !== contentRef.current) {
        const tagName = interactiveElement.tagName.toUpperCase()

        if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
          ;(interactiveElement as HTMLInputElement | HTMLTextAreaElement).focus()
          foundInteractive = true
          break
        }

        if (INTERACTIVE_TAGS.has(tagName) || interactiveElement.dataset.interactive === 'true') {
          interactiveElement.click()
          foundInteractive = true
          break
        }

        interactiveElement = interactiveElement.parentElement
      }
      if (!foundInteractive) {
        startDialogue()
      }
    }, [contentRef, startDialogue, getElementUnderCharacter, vibrateClick])

    const handleCharacterKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === KEY_CODES.ENTER || e.key === KEY_CODES.SPACE) {
          e.preventDefault()
          startDialogue()
        }
      },
      [startDialogue]
    )

    // --- 初始化用户 ---
    useEffect(() => {
      initializeUser()
    }, [initializeUser])

    // --- 获取对话数据 ---
    useEffect(() => {
      const fetchDialogues = async () => {
        try {
          const { data, error } = await supabase
            .from('dialogues')
            .select('type, path, fallback_face, segments')

          if (error) throw new Error(`获取对话失败: ${error.message}`)

          if (data) {
            const newLibrary: DialogueLibrary = { greetings: [], generics: [], pageSpecific: {} }
            for (const row of data) {
              if (!row.segments || !Array.isArray(row.segments) || !row.fallback_face) {
                console.warn('Skipping dialogue row with invalid data:', row)
                continue
              }
              const piece: DialoguePiece = {
                segments: row.segments,
                face: row.fallback_face,
              }
              switch (row.type) {
                case 'greeting':
                  newLibrary.greetings.push(piece)
                  break
                case 'generic':
                  newLibrary.generics.push(piece)
                  break
                case 'page_specific':
                  if (row.path) {
                    const decodedPath = decodeURIComponent(row.path)
                    if (!newLibrary.pageSpecific[decodedPath])
                      newLibrary.pageSpecific[decodedPath] = []
                    newLibrary.pageSpecific[decodedPath].push(piece)
                  }
                  break
              }
            }
            setDialogues(newLibrary)
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err.message)
            setDialogueError(err.message)
          } else {
            console.error('An unknown error occurred', err)
            setDialogueError('An unknown error occurred')
          }
        } finally {
          setIsLoadingDialogues(false)
        }
      }
      fetchDialogues()
    }, [supabase])

    useImperativeHandle(
      ref,
      () => ({
        notifyClick: (event: React.MouseEvent<HTMLDivElement>) => {
          stateRef.current.shouldResetOnNav = true

          if (!contentRef.current) return

          const link = (event.target as HTMLElement).closest('a')
          if (!link) return

          const href = link.getAttribute('href') || ''
          if (href.includes('/tags/')) {
            stateRef.current.shouldResetOnNav = false
            return
          }

          const containerRect = contentRef.current.getBoundingClientRect()
          const linkRect = link.getBoundingClientRect()
          const isVisible =
            linkRect.top < containerRect.bottom && linkRect.bottom > containerRect.top

          if (isVisible) {
            stateRef.current.shouldResetOnNav = false
          }
        },
      }),
      [contentRef]
    )

    // --- 路径变化处理 ---
    useEffect(() => {
      if (stateRef.current.shouldResetOnNav) {
        if (contentRef.current) {
          const container = contentRef.current
          const safeY = container.scrollTop + 20
          const safeX = container.scrollLeft + container.clientWidth / 2 - FRAME_WIDTH / 2 + 350
          setPosition({ x: safeX, y: safeY })
        }
      }

      prevPathnameRef.current = pathname
      stateRef.current.shouldResetOnNav = true
    }, [pathname, contentRef])

    // --- 位置检查 ---
    useEffect(() => {
      const timer = setTimeout(() => {
        if (!contentRef.current || !characterRef.current) return

        const container = contentRef.current
        const charTop = position.y
        const charBottom = position.y + FRAME_HEIGHT
        const viewTop = container.scrollTop
        const viewBottom = container.scrollTop + container.clientHeight

        const isOffScreen = charBottom < viewTop || charTop > viewBottom
        if (isOffScreen) {
          const safeY = viewTop + 20
          const safeX = container.scrollLeft + container.clientWidth / 2 - FRAME_WIDTH / 2 + 350
          setPosition({ x: safeX, y: safeY })
        }
      }, 300)

      return () => clearTimeout(timer)
    }, [pathname, contentRef, position.y])

    // --- 键盘事件处理 ---
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const targetTag = (e.target as HTMLElement)?.tagName
        if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') {
          if (e.key === KEY_CODES.ESCAPE) {
            ;(e.target as HTMLElement).blur()
            e.preventDefault()
          }
          return
        }
        if (isDialogueActive) {
          e.stopImmediatePropagation()
          if (INTERACTION_KEYS.includes(e.key)) {
            e.preventDefault()
          }
          if (e.key === KEY_CODES.SPACE || e.key === KEY_CODES.ENTER) {
            dialogueBoxRef.current?.triggerInteraction()
          } else if (e.key === KEY_CODES.ESCAPE) {
            dialogueBoxRef.current?.triggerNegativeAction()
          }
          return
        }

        if (!isControlActive) return

        if (e.key === KEY_CODES.ESCAPE) {
          return
        }
        e.stopImmediatePropagation()
        if (INTERACTION_KEYS.includes(e.key)) {
          e.preventDefault()
        }
        stateRef.current.keysPressed[e.key] = true
        if (e.key === KEY_CODES.SPACE || e.key === KEY_CODES.ENTER) {
          performAction()
        }
      }

      const handleKeyUp = (e: KeyboardEvent) => {
        const targetTag = (e.target as HTMLElement)?.tagName
        if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') {
          return
        }

        if (isDialogueActive) {
          e.stopImmediatePropagation()
          return
        }
        if (!isControlActive) return
        e.stopImmediatePropagation()
        stateRef.current.keysPressed[e.key] = false
      }

      window.addEventListener('keydown', handleKeyDown, true)
      window.addEventListener('keyup', handleKeyUp, true)
      return () => {
        window.removeEventListener('keydown', handleKeyDown, true)
        window.removeEventListener('keyup', handleKeyUp, true)
      }
    }, [isControlActive, performAction, isDialogueActive])

    // --- 手柄支持 ---
    useEffect(() => {
      if (typeof window === 'undefined' || !('getGamepads' in navigator)) {
        return
      }

      let animationFrameId: number

      const lastButtonState = {
        Enter: false,
        Escape: false,
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
      }

      const dispatchKeyEvent = (key: string, type: 'keydown' | 'keyup') => {
        window.dispatchEvent(new KeyboardEvent(type, { key: key, bubbles: true, cancelable: true }))
      }

      const releaseAllKeys = () => {
        ;(Object.keys(lastButtonState) as Array<keyof typeof lastButtonState>).forEach((key) => {
          if (lastButtonState[key]) {
            dispatchKeyEvent(key, 'keyup')
            lastButtonState[key] = false
          }
        })
      }

      const gamepadLoop = () => {
        const gamepads = navigator.getGamepads()

        if (stateRef.current.gamepadIndex !== null && !gamepads[stateRef.current.gamepadIndex]) {
          stateRef.current.gamepadIndex = null
          releaseAllKeys()
        }

        if (stateRef.current.gamepadIndex === null) {
          for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
              stateRef.current.gamepadIndex = i
              break
            }
          }
        }

        if (stateRef.current.gamepadIndex !== null) {
          const gp = gamepads[stateRef.current.gamepadIndex]!
          const nowState = {
            Enter: gp.buttons[0]?.pressed ?? false,
            Escape: gp.buttons[1]?.pressed ?? false,
            ArrowUp:
              (gp.buttons[12]?.pressed ?? false) || (gp.axes[1] ?? 0) < -GAMEPAD_AXIS_THRESHOLD,
            ArrowDown:
              (gp.buttons[13]?.pressed ?? false) || (gp.axes[1] ?? 0) > GAMEPAD_AXIS_THRESHOLD,
            ArrowLeft:
              (gp.buttons[14]?.pressed ?? false) || (gp.axes[0] ?? 0) < -GAMEPAD_AXIS_THRESHOLD,
            ArrowRight:
              (gp.buttons[15]?.pressed ?? false) || (gp.axes[0] ?? 0) > GAMEPAD_AXIS_THRESHOLD,
          }
          ;(Object.keys(nowState) as Array<keyof typeof nowState>).forEach((key) => {
            if (nowState[key] !== lastButtonState[key]) {
              dispatchKeyEvent(key, nowState[key] ? 'keydown' : 'keyup')
              lastButtonState[key] = nowState[key]
            }
          })
        }
        animationFrameId = requestAnimationFrame(gamepadLoop)
      }
      gamepadLoop()
      return () => {
        cancelAnimationFrame(animationFrameId)
        releaseAllKeys()
      }
    }, [])

    useEffect(() => {
      let animationFrameId: number

      const gameLoop = (currentTime: number) => {
        const deltaTime = (currentTime - stateRef.current.lastFrameTime) / 1000
        stateRef.current.lastFrameTime = currentTime

        if (!isControlActive || isDialogueActive) {
          if (isWalking) setIsWalking(false)
          animationFrameId = requestAnimationFrame(gameLoop)
          return
        }

        let dx = 0
        let dy = 0
        let currentDirection = direction
        let walking = false

        if (stateRef.current.keysPressed[KEY_CODES.ARROW_UP]) {
          dy = -1
          currentDirection = 'up'
          walking = true
        } else if (stateRef.current.keysPressed[KEY_CODES.ARROW_DOWN]) {
          dy = 1
          currentDirection = 'down'
          walking = true
        }

        if (stateRef.current.keysPressed[KEY_CODES.ARROW_LEFT]) {
          dx = -1
          currentDirection = 'left'
          walking = true
        } else if (stateRef.current.keysPressed[KEY_CODES.ARROW_RIGHT]) {
          dx = 1
          currentDirection = 'right'
          walking = true
        }

        if (dx !== 0 && dy !== 0) {
          const length = Math.sqrt(dx * dx + dy * dy)
          dx /= length
          dy /= length
        }

        const moveX = dx * PIXELS_PER_SECOND * deltaTime
        const moveY = dy * PIXELS_PER_SECOND * deltaTime

        if (walking) {
          let newX = position.x + moveX
          let newY = position.y + moveY

          if (contentRef.current) {
            const container = contentRef.current
            const { scrollTop, scrollHeight, clientHeight, scrollWidth } = container
            const scrollAmount = PIXELS_PER_SECOND * deltaTime

            if (
              dy > 0 &&
              newY - scrollTop > clientHeight - SCROLL_THRESHOLD &&
              scrollTop < scrollHeight - clientHeight
            ) {
              container.scrollTop += scrollAmount
              newY = container.scrollTop + clientHeight - SCROLL_THRESHOLD
            }
            if (dy < 0 && newY - scrollTop < SCROLL_THRESHOLD && scrollTop > 0) {
              container.scrollTop -= scrollAmount
              newY = container.scrollTop + SCROLL_THRESHOLD
            }

            newX = Math.max(0, Math.min(newX, scrollWidth - FRAME_WIDTH))
            newY = Math.max(0, Math.min(newY, scrollHeight - FRAME_HEIGHT))
          }
          setPosition({ x: newX, y: newY })
        }

        setDirection(currentDirection)
        setIsWalking(walking)

        animationFrameId = requestAnimationFrame(gameLoop)
      }

      animationFrameId = requestAnimationFrame(gameLoop)

      return () => {
        cancelAnimationFrame(animationFrameId)
      }
    }, [isControlActive, isDialogueActive, position, direction, isWalking, contentRef])

    // --- 动画帧处理 ---
    useEffect(() => {
      if (!isControlActive) return

      let rafId: number
      const step = (time: number) => {
        if (isWalking) {
          if (time - stateRef.current.lastAnimationTime >= ANIMATION_SPEED) {
            setFrame((prev) => (prev + 1) % 4)
            stateRef.current.lastAnimationTime = time
          }
        } else if (frame !== 0) {
          setFrame(0)
        }
        rafId = requestAnimationFrame(step)
      }

      rafId = requestAnimationFrame(step)
      return () => cancelAnimationFrame(rafId)
    }, [isControlActive, isWalking, frame])

    // --- 悬停检查 ---
    useEffect(() => {
      if (isWalking || !isControlActive) {
        setIsOverClickable(false)
        return
      }
      const timeoutId = setTimeout(() => {
        if (!characterRef.current || !contentRef.current) return

        const element = getElementUnderCharacter()
        let foundClickable = false
        let node: HTMLElement | null = element as HTMLElement

        while (node && node !== contentRef.current) {
          const tagName = node.tagName.toUpperCase()
          if (INTERACTIVE_TAGS.has(tagName) || node.dataset.interactive === 'true') {
            foundClickable = true
            break
          }
          node = node.parentElement
        }
        setIsOverClickable(foundClickable)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
      }
    }, [isWalking, isControlActive, contentRef, getElementUnderCharacter])

    useEffect(() => {
      requestAnimationFrame(() => {
        if (characterRef.current) {
          characterRef.current.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`
          characterRef.current.style.backgroundPosition = `-${frame * FRAME_WIDTH}px -${directions[direction] * FRAME_HEIGHT}px`

          if (bubbleRef.current) {
            const bubbleX = position.x - 24
            const bubbleY = position.y - 24
            bubbleRef.current.style.transform = `translate3d(${bubbleX}px, ${bubbleY}px, 0)`
          }
        }
      })
    }, [position, frame, direction])

    return (
      <div ref={overlayRef} className="character-overlay">
        <Footprints
          characterPosition={position}
          isWalking={isWalking}
          direction={direction}
          isActive={isControlActive}
        />

        <div ref={bubbleRef} className={`action-bubble ${isOverClickable ? 'visible' : ''}`}>
          <Image
            src="/static/images/anim1.png"
            alt="可交互提示"
            width={32}
            height={32}
            unoptimized
          />
        </div>

        <div
          ref={characterRef}
          className="character"
          onClick={startDialogue}
          onKeyDown={handleCharacterKeyDown}
          role="button"
          tabIndex={0}
          aria-label="与角色Niko互动"
        />

        {showPhotoCapture && (
          <PhotoCapture onPhotoTaken={handlePhotoTaken} onCancel={handleCancelPhoto} />
        )}

        {isDialogueActive && dialogueQueue.length > 0 && (
          <DialogueBox
            ref={dialogueBoxRef}
            key={`${currentDialogueIndex}-${confirmationContext}-${dialogueQueue[0]?.segments[0]?.text}`}
            dialogue={dialogueQueue[currentDialogueIndex]}
            onFinished={advanceDialogue}
            onNameInput={handleNameInput}
            onNameConfirmation={handleConfirmation}
            userName={userName}
            audioSrc="/static/audio/typing-sound.wav"
          />
        )}
      </div>
    )
  }
)

export default CharacterOverlay
