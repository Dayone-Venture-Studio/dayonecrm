export interface NavItem {
  href: string
  label: string
  icon: string
  match?: 'exact' | 'subtree'
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  const href = item.href.replace(/\/+$/, '') || '/'
  const currentPath = pathname.replace(/\/+$/, '') || '/'

  if (item.match === 'exact') {
    return currentPath === href
  }

  return currentPath === href || currentPath.startsWith(`${href}/`)
}

export const adminNav: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: '📊', match: 'exact' },
  { href: '/admin/registrations', label: 'Registrations', icon: '📋' },
  { href: '/admin/startups', label: 'Startups', icon: '🚀' },
  { href: '/admin/performance', label: 'Performance', icon: '📈' },
  { href: '/admin/activity', label: 'Activity', icon: '⚡' },
  { href: '/tv', label: 'Live TV Wall', icon: '📺' },
]

export const founderNav: NavItem[] = [
  { href: '/founder', label: 'Dashboard', icon: '📊', match: 'exact' },
  { href: '/founder/weekly-plan', label: 'Weekly Plan', icon: '📅' },
  { href: '/founder/tasks', label: 'Tasks', icon: '📋' },
  { href: '/founder/staff', label: 'Staff', icon: '👥' },
  { href: '/founder/domains', label: 'Domains', icon: '🗂️' },
]

export const staffNav: NavItem[] = [
  { href: '/staff', label: 'My Dashboard', icon: '📊', match: 'exact' },
  { href: '/staff/tasks', label: 'My Tasks', icon: '📋' },
]

export const ventureManagerNav: NavItem[] = [
  { href: '/venture-manager', label: 'Portfolio Overview', icon: '📊', match: 'exact' },
  { href: '/venture-manager/my-notes', label: 'My Notes', icon: '📝' },
]

/** Founder nav gets a TV wall link pointed at that founder's own startup when known. */
export function withTvWall(nav: NavItem[], startupId?: string | null): NavItem[] {
  return [
    ...nav,
    { href: startupId ? `/tv/${startupId}` : '/tv', label: 'Live TV Wall', icon: '📺' },
  ]
}