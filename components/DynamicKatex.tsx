'use client'
import 'katex/dist/katex.min.css'
import { InlineMath } from 'react-katex'
import { ComponentProps } from 'react'

type DynamicKatexProps = ComponentProps<typeof InlineMath>

const DynamicKatex: React.FC<DynamicKatexProps> = (props) => {
  return <InlineMath {...props} />
}

export default DynamicKatex
