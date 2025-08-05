# GAMER Next.js Blog

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0.5-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square)](https://www.gnu.org/licenses/gpl-3.0)

Gamer is a game-themed personal website template built with Next.js, blending modern web technologies with a unique, game-like interactive experience.

## :sparkles: Example Site

- [Ripple's Blog](https://hiripple.com)

If you are also using Gamer, feel free to submit a PR to be added here!

## :rocket: Core Features

- **:zap: Peak Performance**: Excellent scores on LightHouse and Gtmetrix, with an average Performance of 95%, and near-perfect scores for SEO & Best Practices.
- **:art: Game-Inspired Design**: A minimalist yet sophisticated UI/component design that perfectly fits the theme.
- **:gem: Attention to Detail**: Responsive design with smooth and modern front-end animations.
- **☀️ Dark/Light Mode**: Thoughtfully designed themes with preference memory.
- **🌎 I18n Ready**: Route-level internationalization support for seamless, SEO-friendly language switching.
- **:computer: Real-time Status**: View the blogger's status, online user count, and send live comments via WebSocket connections.
- **:pencil: Syntax Highlighting**: Supports rich Markdown and LaTeX syntax for diverse writing needs.
- **🔌 Extendable**: Optional plugins like Buttondown, kBar, and Umami to expand functionality.

## 🎮 Special Features

"You can browse the blog as if you were playing a game!"

- **Full Keyboard/Gamepad Support**: Browse smoothly without a mouse, with gamepad vibration feedback included.
- **Explore with a Companion**: Discover pages with Niko, introducing your posts from an imaginary third-person perspective. Many hidden interactions await!
- **Quest: Easter Eggs**: Gamer incorporates elements from over 20+ games, stylized to fit the theme.
- **Sparks**: Traverse the deep red passage and ride the "Kaihāra Dentetsu" to a world of a completely different style.

### 🔧 Tech Stack

- **Next.js 15** + **React 19** + **TypeScript**
- **Tailwind CSS 4** for styling
- **Contentlayer** for content management
- **Supabase** for backend services
- **Framer Motion** for animations
- **MDX** support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn or npm

### Installation

```bash
npm install
```

### Environment Configuration

Copy `.env.example` to `.env.local` and configure your environment variables.

### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the result.

### Build & Deploy

```bash
npm run build
npm start
```

## 📁 Project Structure

```
GAMER-Nextjs-blog/
├── app/                  # Next.js App Router
│   ├── [locale]/         # Internationalization routes
│   │   └── (main)/       # Main pages
│   │       ├── blog/     # Blog pages
│   │       ├── projects/
│   │       ├── sparks/
│   │       └── ...
│   └── api/              # API routes
├── components/           # React components
│   ├── CharacterOverlay.tsx   # Character control component
│   ├── AnimatedConstruction.tsx # Construction animation
│   ├── GuessGame.tsx          # Guess game component
│   └── ...
├── data/                 # Static data
│   ├── blog/             # Blog posts (MDX)
│   ├── authors/          # Author information
│   └── projectsData.ts   # Project data
├── contexts/             # React Context
├── css/                  # Stylesheets
├── public/               # Static assets
└── supabase/             # Supabase Edge Functions
```

## 🌐 Internationalization

The project uses `next-intl` for multilingual support:

```typescript
// messages/en.json
{
  "home": {
    "title": "Welcome to my blog",
    "description": "A gamified personal space"
  }
}
```

## 📝 Blog Writing

For custom styles, please refer to: `style-test.mdx`.

Write blog posts using MDX format:

```mdx
---
title: 'My First Blog Post'
date: '2024-01-01'
tags: ['Tech', 'Sharing']
draft: false
summary: 'This is an example blog post.'
---

# Welcome to My Blog

You can use **Markdown** syntax here, as well as React components!
```

## 🔧 Deployment

### Deploy on Vercel

1.  Fork this repository.
2.  Import the project in Vercel.
3.  Configure environment variables.
4.  Deploy!

## 🤝 Contributing

Issues and Pull Requests are welcome!

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the [GNU GPL v3](https://choosealicense.com/licenses/gpl-3.0/) license.

When using Gamer, **please do not remove the attribution link at the bottom of the webpage**.

## 🙏 Acknowledgements

-   Based on [Tailwind Nextjs Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog).
-   Thanks to all contributors of the open-source projects used.

## 📞 Contact

-   Website: [https://hiripple.com](https://hiripple.com)
-   GitHub: [@CelestialRipple](https://github.com/CelestialRipple)
-   Email: me@hiripple.com

---

⭐ If you find this project helpful, please give it a star!
