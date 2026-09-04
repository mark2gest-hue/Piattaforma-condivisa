import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://aiutiamoci.cloud'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/posta/', '/studenti/'],
      },
      // Istruzioni esplicite per i motori di ricerca generativi e bot AI (ChatGPT, Perplexity, Claude, Gemini)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'cohere-ai',
        ],
        allow: ['/', '/llms.txt', '/images/'],
        disallow: ['/api/', '/admin/', '/posta/', '/studenti/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
