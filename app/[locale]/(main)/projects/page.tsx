import projectsData from '@/data/projectsData'
import Card from '@/components/Card'
import { genPageMetadata } from 'app/[locale]/(main)/seo'
import GuessGame from '@/components/GuessGame'
import ProjectCard from '@/components/ProjectCard'
export const metadata = genPageMetadata({ title: 'Projects' })
import Image from 'next/image'

export default function Projects() {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <div className="space-y-2 pt-6 pb-8 md:space-y-5">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
              Projects
            </h1>
            <GuessGame />
          </div>
          <div className="container py-12">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
              {projectsData.map((project) => (
                <ProjectCard key={project.title} project={project} />
              ))}
            </div>
          </div>
        </div>

        <Image
          src="/static/images/ff-sword.avif"
          alt="Decorative Sword"
          width={72}
          height={72}
          style={{
            alignSelf: 'flex-end',
            marginTop: '2rem',
            marginRight: '2rem',
            filter: 'drop-shadow(3px 5px 4px rgba(0, 0, 0, 0.4))',
            pointerEvents: 'none',
          }}
        />
      </div>
    </>
  )
}
