import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Docker 部署时使用 standalone 输出，减少镜像体积
  output: 'standalone',

  // 将 /api/* 请求代理到后端服务（仅服务端执行，无需暴露后端端口）
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_INTERNAL_URL || 'http://backend:8080'}/api/:path*`,
      },
    ]
  },

  // 允许外部图片域（Owner 头像可能来自外部 CDN）
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

}

export default nextConfig
