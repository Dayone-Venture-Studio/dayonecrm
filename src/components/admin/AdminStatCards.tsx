export interface AdminStatCard {
  label: string
  value: number
  icon: string
  color: string
}

export function AdminStatCards({ cards }: { cards: AdminStatCard[] }) {
  return (
    <div className="grid-stats" style={{ marginBottom: 32 }}>
      {cards.map((card) => (
        <div key={card.label} className="stat-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 22 }}>{card.icon}</span>
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: card.color,
              lineHeight: 1,
              marginBottom: 6,
            }}
          >
            {card.value}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{card.label}</div>
        </div>
      ))}
    </div>
  )
}
