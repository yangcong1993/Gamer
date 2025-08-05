import Link from 'next/link'
import { slug } from 'github-slugger'
interface Props {
  text: string
}

const Tag = ({ text }: Props) => {
  return (
    <Link
      href={`/tags/${slug(text)}`}
      className="mr-3 text-sm font-medium text-[#793EC3] uppercase dark:text-[#7c4dff]"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
