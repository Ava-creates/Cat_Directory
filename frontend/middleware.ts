import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const adminUser = process.env.ADMIN_USERNAME
  const adminPass = process.env.ADMIN_PASSWORD
  if (!adminUser || !adminPass) {
    return new NextResponse('Admin credentials not configured', { status: 401 })
  }

  const authHeader = request.headers.get('authorization') || ''
  const [scheme, encoded] = authHeader.split(' ')
  if (scheme !== 'Basic' || !encoded) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin"',
      },
    })
  }

  let decoded = ''
  try {
    decoded = atob(encoded)
  } catch {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin"',
      },
    })
  }

  const [user, pass] = decoded.split(':')
  if (user !== adminUser || pass !== adminPass) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin"',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
