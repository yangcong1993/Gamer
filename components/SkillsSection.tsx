// file: components/SkillsSection.tsx

'use client'

import { useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import {
  SiHtml5,
  SiCss3,
  SiWordpress,
  SiReplit,
  SiMsi,
  SiUbuntu,
  SiPython,
  SiPhp,
  SiMysql,
  SiNpm,
  SiNextdotjs,
  SiReact,
  SiNodedotjs,
  SiTypescript,
  SiJavascript,
  SiPostgresql,
  SiAndroid,
  SiTailwindcss,
  SiGit,
  SiVercel,
  SiAppletv,
  SiApple,
  SiMarkdown,
  SiCplusplus,
} from 'react-icons/si'
import {
  BsLaptop,
  BsChatSquareTextFill,
  BsNintendoSwitch,
  BsPlaystation,
  BsSpeaker,
  BsSmartwatch,
  BsAward,
  BsBook,
  BsFillTrophyFill,
  BsRouter,
  BsPersonWorkspace,
  BsTv,
} from 'react-icons/bs'
import { FiChevronDown, FiMonitor, FiAward, FiServer } from 'react-icons/fi'

const skillCategories = [
  {
    title: 'Programming Language',
    skills: [
      { name: 'TypeScript', icon: <SiTypescript /> },
      { name: 'JavaScript (ES6+)', icon: <SiJavascript /> },
      { name: 'PostgreSQL', icon: <SiPostgresql /> },
      { name: 'HTML5', icon: <SiHtml5 /> },
      { name: 'CSS3', icon: <SiCss3 /> },
      { name: 'C++', icon: <SiCplusplus /> },
      { name: 'Python', icon: <SiPython /> },
      { name: 'SQL', icon: <SiMysql /> },
      { name: 'Markdown', icon: <SiMarkdown /> },
      { name: 'Php', icon: <SiPhp /> },
    ],
  },
  {
    title: 'Stack',
    skills: [
      { name: 'Next.js', icon: <SiNextdotjs /> },
      { name: 'React', icon: <SiReact /> },
      { name: 'Node.js', icon: <SiNodedotjs /> },
      { name: 'Tailwind CSS', icon: <SiTailwindcss /> },
      { name: 'Git', icon: <SiGit /> },
      { name: 'Vercel', icon: <SiVercel /> },
      { name: 'Npmjs', icon: <SiNpm /> },
      { name: 'Replit', icon: <SiReplit /> },
      { name: 'Wordpress', icon: <SiWordpress /> },
    ],
  },
  {
    title: 'Equipment',
    skills: [
      { name: 'Ubuntu (VM machine）', icon: <SiUbuntu /> },
      { name: 'MI MIX 2', icon: <SiAndroid /> },
      { name: 'iPhone 13 Pro', icon: <SiApple /> },
      { name: 'Apple TV 4K', icon: <SiAppletv /> },
      { name: 'Apple watch series 7 (stainless steel)', icon: <BsSmartwatch /> },
      { name: 'MacBook Air (M4)', icon: <BsLaptop /> },
      { name: 'MSI Rtx 4070 Ti Super', icon: <SiMsi /> },
      { name: 'Nintendo Switch 2', icon: <BsNintendoSwitch /> },
      { name: 'PlayStation 5', icon: <BsPlaystation /> },
      { name: 'TCL Q9K', icon: <BsTv /> },
      { name: 'EDIFIER A80', icon: <BsSpeaker /> },
      { name: 'KTC M27P20', icon: <FiMonitor /> },
      { name: 'N100 Server (NAS)', icon: <FiServer /> },
      { name: 'ZTE BE7200 PRO+', icon: <BsRouter /> },
    ],
  },
  {
    title: 'Skill',
    skills: [
      { name: 'CCF CSP TOP 11.05%', icon: <FiAward /> },
      { name: 'NCRE level-2', icon: <BsAward /> },
      { name: 'Chinese (mother tongue)', icon: <BsChatSquareTextFill /> },
      { name: 'English (IELTS 7, CET-6 546)', icon: <BsChatSquareTextFill /> },
      { name: 'Japanese (N5)', icon: <BsChatSquareTextFill /> },
      { name: '17 PSN Platinum Trophies', icon: <BsFillTrophyFill /> },
    ],
  },
  {
    title: 'Education & Experience',
    skills: [
      {
        name: 'Hunan university, bachelor of Electronic Science and Technology.',
        icon: <BsBook />,
      },
      {
        name: 'Hunan university, student pursuing a MA degree of Software Engineering.',
        icon: <BsBook />,
      },
      { name: 'ShangHai Zhengmi Technology（Internship in Backend）', icon: <BsPersonWorkspace /> },
    ],
  },
]

export default function SkillsSection() {
  const [isOpen, setIsOpen] = useState(false)

  const contentVariants: Variants = {
    collapsed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] },
    },
  }

  const chevronVariants: Variants = {
    collapsed: { rotate: 0 },
    open: { rotate: 180 },
  }

  return (
    <section className="skills-section">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="expand-button"
        whileTap={{ scale: 0.98 }}
        aria-expanded={isOpen}
        aria-controls="skills-content-wrapper"
      >
        <span>Learn more about Ripp……</span>
        <motion.div
          variants={chevronVariants}
          animate={isOpen ? 'open' : 'collapsed'}
          transition={{ duration: 0.3 }}
        >
          <FiChevronDown size={20} />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id="skills-content-wrapper"
            key="skills-content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={contentVariants}
            className="skills-content-wrapper"
          >
            <div className="skills-container">
              {skillCategories.map((category) => (
                <div key={category.title} className="skill-category">
                  <h3 className="skill-category-title">{category.title}</h3>
                  <div className="skills-list">
                    {category.skills.map((skill) => (
                      <div key={skill.name} className="skill-item">
                        <span className="skill-icon">{skill.icon}</span>
                        <span className="skill-name">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
