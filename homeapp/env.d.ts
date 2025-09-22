/// <reference types="vite/client" />

declare global {
  interface Window {
    childHistoryBack?: () => void
  }
}
export {}
