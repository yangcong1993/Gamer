// src/types/globals.d.ts
declare global {
  interface Window {
    cheat?: (code: string) => string
  }
}
export {}
