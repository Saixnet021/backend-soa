import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login']
const adminPaths = ['/dashboard/especies', '/dashboard/usuarios']
const qaPaths = ['/dashboard/calidad/registrar']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (publicPaths.some(p => pathname.startsWith(p))) return NextResponse.next()
  if (pathname === '/') return NextResponse.redirect(new URL('/login', request.url))

  const token = request.cookies.get('token')?.value
  if (!token) return NextResponse.redirect(new URL('/login', request.url))

  let rol = ''
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    rol = decoded.rol || ''
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (adminPaths.some(p => pathname.startsWith(p)) && rol !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname.startsWith('/dashboard/calidad/registrar') && rol !== 'ADMIN' && rol !== 'QA') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-).*)'],
}
