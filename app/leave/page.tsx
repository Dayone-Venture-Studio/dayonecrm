import { requireTeamMember } from '@/lib/auth/requireRole'
import { LeaveClient } from '@/components/leave/LeaveClient'
import { getMyLeaveRequests, getAllLeaveRequests } from '@/lib/leave/queries'

export default async function LeavePage() {
  const session = await requireTeamMember()
  const isManager = session.role === 'PROJECT_MANAGER' || session.role === 'ADMIN'

  const requests = isManager
    ? await getAllLeaveRequests()
    : await getMyLeaveRequests(session.id)

  return <LeaveClient session={session} requests={requests} isManager={isManager} />
}