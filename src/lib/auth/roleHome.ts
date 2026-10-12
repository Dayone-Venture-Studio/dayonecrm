import type { Role } from '@/types'

/** Landing route for each role after sign-in (and for the authenticated root guard). */
export const ROLE_HOME: Record<Role, string> = {
  ADMIN: '/admin',
  FOUNDER: '/founder',
  STAFF: '/staff',
  VENTURE_MANAGER: '/venture-manager',
  PROJECT_MANAGER: '/daily-sprint',
  EMPLOYEE: '/daily-sprint',
}

export function getRoleHome(role: Role): string {
  return ROLE_HOME[role] ?? '/'
}
