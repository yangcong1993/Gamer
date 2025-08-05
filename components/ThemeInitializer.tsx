// file: components/ThemeInitializer.tsx

'use client'

import React from 'react'

const themeInitializerScript = `
(function() {
  function getInitialTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) return storedTheme;
    return 'dark'; // 默认设置为 'dark'
  }
  const theme = getInitialTheme();
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();
`

const ThemeInitializer = () => {
  return <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />
}

export default ThemeInitializer
