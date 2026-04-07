declare module 'next-pwa' {
  import type { NextConfig } from 'next'

  interface PWAOptions {
    dest: string
    disable?: boolean
  }

  type WithPWA = (config: NextConfig) => NextConfig

  export default function withPWAInit(options: PWAOptions): WithPWA
}
