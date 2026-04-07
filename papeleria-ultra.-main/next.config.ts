import withPWAInit from 'next-pwa'
import type { NextConfig } from 'next'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV !== 'production',
})

const nextConfig: NextConfig = {
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Evita advertencia por múltiples lockfiles en monorepo/workspace raíz
  turbopack: {
    root: process.cwd(),
  },
}

export default withPWA(nextConfig)
