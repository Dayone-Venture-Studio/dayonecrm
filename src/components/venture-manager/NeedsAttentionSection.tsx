'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CompanyLogo } from '@/components/brand/CompanyLogo'
import type { StartupWithHealth } from '@/lib/venture-manager/portfolioAnalytics'
import type { VentureManagerNoteWithProfile } from '@/types'
import {
  AlertTriangle,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  Flag,
} from 'lucide-react'

interface Props {
  atRiskStartups: StartupWithHealth[]
  urgentNotes: VentureManagerNoteWithProfile[]
  onAddNote?: (startupId: string) => void
}

export function NeedsAttentionSection({ atRiskStartups, urgentNotes, onAddNote }: Props) {
  const [isExpanded, setIsExpanded] = useState(true)
  const totalConcerns = atRiskStartups.length + urgentNotes.length

  // ── All clear state ──
  if (totalConcerns === 0) {
    return (
      <div style={{
        background: 'rgba(5,150,105,0.06)',
        border: '1px solid rgba(5,150,105,0.2)',
        borderRadius: 12,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
      }}>
        <CheckCircle2 size={18} color="#059669" />
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>All Clear! 🎉</span>
          <span style={{ fontSize: 13, color: '#047857', marginLeft: 8 }}>No startups require immediate attention</span>
        </div>
      </div>
    )
  }

  const criticalNotes = urgentNotes.filter((n) => n.urgency === 'CRITICAL')
  const highNotes = urgentNotes.filter((n) => n.urgency === 'HIGH')

  return (
    <div style={{
      background: 'rgba(217,119,6,0.04)',
      border: '1px solid rgba(217,119,6,0.22)',
      borderRadius: 12,
      marginBottom: 20,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'rgba(217,119,6,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={15} color="#d97706" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Needs Attention
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#d97706',
              background: 'rgba(217,119,6,0.12)', borderRadius: 999, padding: '1px 8px',
            }}>
              {totalConcerns}
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {atRiskStartups.length} startup{atRiskStartups.length !== 1 ? 's' : ''} at risk
              {urgentNotes.length > 0 && ` · ${urgentNotes.length} urgent note${urgentNotes.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={16} color="var(--color-text-muted)" /> : <ChevronDown size={16} color="var(--color-text-muted)" />}
      </button>

      {/* Body */}
      {isExpanded && (
        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Urgent Notes */}
          {(criticalNotes.length > 0 || highNotes.length > 0) && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Flag size={12} color="#ca2f2b" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#ca2f2b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Urgent Notes ({criticalNotes.length + highNotes.length})
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[...criticalNotes, ...highNotes].map((note) => (
                  <div key={note.id} style={{
                    background: 'var(--color-surface)',
                    border: `1px solid ${note.urgency === 'CRITICAL' ? 'rgba(202,47,43,0.2)' : 'rgba(217,119,6,0.2)'}`,
                    borderRadius: 8, padding: '10px 14px',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
                          color: note.urgency === 'CRITICAL' ? '#ca2f2b' : '#d97706',
                          background: note.urgency === 'CRITICAL' ? 'rgba(202,47,43,0.1)' : 'rgba(217,119,6,0.1)',
                        }}>
                          {note.urgency}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{note.entity_type.replace('_', ' ')}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--color-text-primary)', margin: 0 }}>{note.note_text}</p>
                      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                        by {note.creator?.full_name} · {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href={`/venture-manager/notes/${note.id}`} style={{ fontSize: 12, color: 'var(--color-brand)', whiteSpace: 'nowrap', textDecoration: 'none', fontWeight: 600 }}>View →</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* At-Risk Startups */}
          {atRiskStartups.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <TrendingDown size={12} color="#d97706" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  At-Risk Startups ({atRiskStartups.length})
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                {atRiskStartups.map((startup) => {
                  const reasons = []
                  if (startup.health.status === 'At Risk') reasons.push('Critical health')
                  if (startup.weekOverWeekDelta?.performanceStatusChange === 'declined') reasons.push('Declining performance')
                  if (startup.health.blockers.some((b) => b.urgency === 'CRITICAL')) reasons.push('Critical blockers')
                  if (startup.health.overdueTasks >= 3) reasons.push(`${startup.health.overdueTasks} overdue tasks`)

                  return (
                    <div key={startup.id} style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 10, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <CompanyLogo logoUrl={startup.logo_url} name={startup.name} size="sm" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{startup.name}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)' }}>{startup.health.score}/100</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
                            color: startup.health.status === 'At Risk' ? '#ca2f2b' : '#d97706',
                            background: startup.health.status === 'At Risk' ? 'rgba(202,47,43,0.1)' : 'rgba(217,119,6,0.1)',
                          }}>
                            {startup.health.status}
                          </span>
                          {reasons.slice(0, 2).map((r, i) => (
                            <span key={i} style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <AlertTriangle size={10} color="#d97706" />{r}
                            </span>
                          ))}
                        </div>
                        <Link
                          href={`/venture-manager/startups/${startup.id}`}
                          style={{ fontSize: 11, color: 'var(--color-brand)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, marginTop: 6 }}
                        >
                          View Details <ArrowRight size={10} />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

