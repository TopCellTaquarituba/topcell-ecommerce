import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const COOKIE_NAME = 'cust_token'

function getJwtSecret() {
  return process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret'
}

export function signCustomerToken(payload: { id: string; email?: string | null }) {
  const secret = getJwtSecret()
  return jwt.sign({ sub: payload.id, email: payload.email || undefined }, secret, { expiresIn: '30d' })
}

export function verifyCustomerToken(token: string): { sub: string; email?: string } | null {
  try {
    const secret = getJwtSecret()
    const decoded: any = jwt.verify(token, secret)
    return { sub: decoded.sub, email: decoded.email }
  } catch {
    return null
  }
}

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/' })
}

export function getAuthTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(COOKIE_NAME)?.value || null
}

// Password utilities (Node built-in scrypt)
import crypto from 'node:crypto'

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16)
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, buf) => (err ? reject(err) : resolve(buf)))
  })
  return `s1$${salt.toString('hex')}$${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    // format: s1$<salt_hex>$<hash_hex>
    const [scheme, saltHex, hashHex] = stored.split('$')
    if (!scheme || !saltHex || !hashHex) return false
    const salt = Buffer.from(saltHex, 'hex')
    const expected = Buffer.from(hashHex, 'hex')
    const derived = await new Promise<Buffer>((resolve, reject) => {
      crypto.scrypt(password, salt, expected.length, (err, buf) => (err ? reject(err) : resolve(buf)))
    })
    return crypto.timingSafeEqual(derived, expected)
  } catch {
    return false
  }
}
