import 'server-only'
import { redirect } from 'next/navigation'
import { getSession } from './getSession'
import type { Role, SessionUser } from '@/types'

/**
 * Enforces that the current user is authenticated and has one of the allowed roles.
 * Redirects to /login if not authenticated, /unauthorized if wrong role.
 */
export async function requireRole(allowedRoles: Role[]): Promise<SessionUser> {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  if (!allowedRoles.includes(session.role)) {
    redirect('/unauthorized')
  }

  return session
}

/**
 * Convenience: require ADMIN role
 */
export async function requireAdmin(): Promise<SessionUser> {
  return requireRole(['ADMIN'])
}

/**
 * Convenience: require FOUNDER role
 */
export async function requireFounder(): Promise<SessionUser> {
  return requireRole(['FOUNDER'])
}

/**
 * Convenience: require STAFF role
 */
export async function requireStaff(): Promise<SessionUser> {
  return requireRole(['STAFF'])
}

/**
 * Convenience: require VENTURE_MANAGER role
 */
export async function requireVentureManager(): Promise<SessionUser> {
  return requireRole(['VENTURE_MANAGER'])
}

/**
 * Convenience: require FOUNDER or STAFF (startup member)
 */
export async function requireStartupMember(): Promise<SessionUser> {
  return requireRole(['FOUNDER', 'STAFF'])
}

/**
 * Convenience: require EMPLOYEE role (internal team member)
 */
export async function requireEmployee(): Promise<SessionUser> {
  return requireRole(['EMPLOYEE'])
}

/**
 * Convenience: require PROJECT_MANAGER role (internal team lead)
 */
export async function requireProjectManager(): Promise<SessionUser> {
  return requireRole(['PROJECT_MANAGER'])
}

/**
 * Convenience: require EMPLOYEE or PROJECT_MANAGER (internal team portal)
 */
export async function requireTeamMember(): Promise<SessionUser> {
  return requireRole(['EMPLOYEE', 'PROJECT_MANAGER'])
}
