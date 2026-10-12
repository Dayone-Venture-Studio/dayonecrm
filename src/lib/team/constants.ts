/** Fixed department list shared by member/task forms and the sprint filters. */
export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Operations',
  'Finance',
  'HR',
  'Other',
] as const

export type Department = (typeof DEPARTMENTS)[number]

export function isDepartment(value: unknown): value is Department {
  return typeof value === 'string' && (DEPARTMENTS as readonly string[]).includes(value)
}
