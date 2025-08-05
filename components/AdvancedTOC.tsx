// components/AdvancedTOC.tsx
'use client'

import { useState, useEffect, useMemo, useRef } from 'react'

// ---  ---
interface TocItem {
  value: string
  url: string
  depth: number
}

interface TocNode extends TocItem {
  children: TocNode[]
}

interface AdvancedTOCProps {
  toc: TocItem[]
  pathname: string
  scrollRoot?: HTMLElement | null
  exclude?: string | string[]
}

const buildTOCTree = (items: TocItem[]): TocNode[] => {
  const root: TocNode[] = []
  const stack: TocNode[] = []

  items.forEach((item) => {
    const node: TocNode = { ...item, children: [] }
    const depth = item.depth

    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop()
    }

    if (stack.length === 0) {
      root.push(node)
    } else {
      stack[stack.length - 1].children.push(node)
    }

    stack.push(node)
  })

  return root
}

const isNodeOrDescendantActive = (node: TocNode, activeId: string | undefined): boolean => {
  if (!activeId) return false
  if (node.url.substring(1) === activeId) return true
  return node.children.some((child) => isNodeOrDescendantActive(child, activeId))
}

const TOCNodeComponent = ({
  node,
  activeId,
  index,
  total,
}: {
  node: TocNode
  activeId?: string
  index?: number
  total?: number
}) => {
  const isActive = node.url.substring(1) === activeId
  const shouldExpand = isNodeOrDescendantActive(node, activeId)
  const AMPLITUDE = 5
  const offsetX = useMemo(() => {
    if (node.depth !== 2 || total === undefined || total < 2) return 0
    const t = index! / (total - 1)
    return AMPLITUDE * (2 * Math.abs(t - 0.5) - 0.5)
  }, [index, total, node.depth])
  const depthStyles = {
    2: 'text-sm font-semibold',
    3: 'text-sm',
    4: 'text-xs',
  }
  const sizeClass = depthStyles[node.depth] || 'text-xs'

  const itemRef = useRef<HTMLAnchorElement>(null)
  const [isFullyVisible, setIsFullyVisible] = useState(true)

  useEffect(() => {
    if (!itemRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFullyVisible(entry.intersectionRatio === 1)
      },
      {
        root: itemRef.current.closest('.overflow-y-auto'),
        threshold: [0.4],
      }
    )

    observer.observe(itemRef.current)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isActive])

  return (
    <li
      className="my-1 transition-all duration-300"
      style={{
        opacity: isFullyVisible ? 1 : 0,
        transform: `translateX(${offsetX}px)`,
      }}
    >
      <a
        ref={itemRef}
        href={node.url}
        className={`transition-colors duration-200 hover:text-[#7c4dff] ${
          isActive ? 'font-bold text-[#7c4dff]' : 'text-gray-300'
        } ${sizeClass}`}
      >
        {node.value}
      </a>
      {shouldExpand && node.children.length > 0 && (
        <ul className="relative mt-2 border-l border-dashed border-gray-600 pl-4 dark:border-gray-700">
          {node.children.map((child, i) => (
            <TOCNodeComponent key={child.url} node={child} activeId={activeId} />
          ))}
        </ul>
      )}
    </li>
  )
}
const AdvancedTOC = ({ toc, pathname, scrollRoot, exclude = '' }: AdvancedTOCProps) => {
  const [activeId, setActiveId] = useState<string>()
  const exclusions = Array.isArray(exclude) ? exclude : [exclude]
  const filteredToc = useMemo(() => {
    const exclusions = Array.isArray(exclude) ? exclude : [exclude]

    return toc.filter((item) => item.depth > 1 && !exclusions.includes(item.value))
  }, [toc, exclude])
  const tocTree = useMemo(() => buildTOCTree(filteredToc), [filteredToc])
  useEffect(() => {
    if (!scrollRoot || filteredToc.length === 0) return

    let observer: IntersectionObserver | null = null
    let cancelled = false

    const tryAttach = () => {
      if (cancelled) return

      const targets = filteredToc
        .map((item) => document.getElementById(item.url.substring(1)))
        .filter(Boolean) as HTMLElement[]

      if (targets.length === 0) {
        requestAnimationFrame(tryAttach)
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id)
            }
          })
        },
        {
          root: scrollRoot,
          rootMargin: '0% 0% -80% 0px',
        }
      )

      targets.forEach((el) => observer!.observe(el))
    }

    tryAttach()

    return () => {
      cancelled = true
      observer?.disconnect()
    }
  }, [filteredToc, scrollRoot])

  useEffect(() => {
    const handleHash = () => setActiveId(window.location.hash.slice(1))
    window.addEventListener('hashchange', handleHash)
    handleHash()
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  if (!tocTree.length) {
    return null
  }

  return (
    <ul>
      {tocTree.map((node, idx) => (
        <TOCNodeComponent
          key={node.url}
          node={node}
          activeId={activeId}
          index={idx}
          total={tocTree.length}
        />
      ))}
    </ul>
  )
}

export default AdvancedTOC
