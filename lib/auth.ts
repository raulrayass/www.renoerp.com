import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

const isProduction = process.env.NODE_ENV === 'production'

const getBaseURL = () => {
  // Explicit URL configuration takes precedence
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL
  }

  // Vercel production environment
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  // Vercel preview/development deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // V0 sandbox runtime
  if (process.env.V0_RUNTIME_URL) {
    return process.env.V0_RUNTIME_URL
  }

  // Fallback to localhost
  return 'http://localhost:3000'
}

const baseURL = getBaseURL()
console.log('[v0] Auth baseURL:', baseURL)

export const auth = betterAuth({
  database: pool,
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://v0-nccamp.vercel.app',
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieAttributes: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'lax' : 'lax',
      path: '/',
      domain: isProduction ? undefined : undefined,
    },
  },
})
