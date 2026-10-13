'use client'

import { useState } from 'react'
import { CompanyLogo } from '@/components/brand/CompanyLogo'
import { DeleteStartupModal } from '@/components/admin/DeleteStartupModal'
import { Trash2 } from 'lucide-react'
import type { Startup, StartupMember, Domain, WeeklyPlan, Task, ActivityLog } from '@/types'

interface StartupDetailClientProps {
  startup: Startup
  founder?: StartupMember & { profile: any }
  staff: (StartupMember & { profile: any })[]
  currentPlan?: WeeklyPlan
  currentPlanTasks: Task[]
  domains: Domain[]
  activity: ActivityLog[]
}

export function StartupDetailClient({
  startup,
  founder,
  staff,
  currentPlan,
  currentPlanTasks,
  domains,
  activity,
}: StartupDetailClientProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const doneTasks = currentPlanTasks.filter((t) => t.status === 'DONE').length
  const totalTasks = currentPlanTasks.length

  const statusColors: Record<string, string> = {
    ACTIVE: 'badge-success',
    PENDING: 'badge-warning',
    REJECTED: 'badge-danger',
    INACTIVE: 'badge-neutral',
  }

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CompanyLogo logoUrl={startup.logo_url} name={startup.name} size={48} />
          <div>
            <h1 className="page-title">{startup.name}</h1>
            <p className="page-subtitle">{startup.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`badge ${statusColors[startup.status] || 'badge-neutral'}`} style={{ fontSize: 13 }}>
            {startup.status}
          </span>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="btn btn-danger"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Founder & Staff */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Team</h2>
          {founder && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Founder
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar">{founder.profile?.full_name?.charAt(0)?.toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{founder.profile?.full_name}</div>
                </div>
              </div>
            </div>
          )}
          {staff.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Staff ({staff.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {staff.map((m) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar avatar-sm">{m.profile?.full_name?.charAt(0)?.toUpperCase()}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{m.profile?.full_name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current Week */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Current Week</h2>
          {currentPlan ? (
            <>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                {new Date(currentPlan.week_start).toLocaleDateString()} →{' '}
                {new Date(currentPlan.week_end).toLocaleDateString()}
              </div>
              {currentPlan.goal && (
                <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16, fontStyle: 'italic' }}>
                  {currentPlan.goal}
                </div>
              )}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Task completion</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {doneTasks}/{totalTasks}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill progress-fill-brand"
                    style={{ width: totalTasks > 0 ? `${(doneTasks / totalTasks) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <p>No weekly plan yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        {/* Domains */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Domains</h2>
          {domains.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No domains created</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {domains.map((d) => (
                <span key={d.id} className="badge badge-info">{d.name}</span>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Activity</h2>
          {activity?.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No activity yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activity?.slice(0, 6).map((log) => (
                <div key={log.id} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-brand)', marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {log.action.replace(/_/g, ' ').toLowerCase()}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 11, marginLeft: 8 }}>
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteStartupModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        startupId={startup.id}
        startupName={startup.name}
      />
    </>
  )
}
