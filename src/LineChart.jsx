import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'

function parseCSV(text) {
  const [headerLine, ...rows] = text.trim().split('\n')
  const headers = headerLine.split(',').map(h => h.trim())
  return rows.map(row => {
    const values = row.split(',').map(v => v.trim())
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]))
  })
}

const RANGES = [
  { label: '1A', months: 12 },
  { label: '5A', months: 60 },
  { label: 'Todo', months: null },
]

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="tooltip-date">{new Date(label).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
      <p className="tooltip-value">{payload[0].value.toFixed(2).replace('.', ',')} {unit}</p>
    </div>
  )
}

function closestBefore(data, targetDate) {
  const t = targetDate.getTime()
  return data.reduce((best, d) => {
    const dt = new Date(d.date).getTime()
    if (dt <= t && (!best || dt > new Date(best.date).getTime())) return d
    return best
  }, null)
}

function pctChange(current, past) {
  if (!past || past.value === 0) return null
  return ((current - past.value) / past.value) * 100
}

const INDICATORS = [
  { label: 'vs. hace 1 semana', days: 7 },
  { label: 'vs. hace 1 mes', days: 30 },
  { label: 'vs. hace 1 año', days: 365 },
]

export default function PriceLineChart({ csvUrl, title, dateKey, valueKey, unit, color, sourceLabel, sourceUrl, yMax }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [range, setRange] = useState('Todo')

  useEffect(() => {
    fetch(csvUrl)
      .then(r => r.text())
      .then(text => {
        const rows = parseCSV(text)
        const parsed = rows
          .filter(r => r[dateKey] && r[valueKey])
          .map(r => ({
            date: r[dateKey],
            value: parseFloat(r[valueKey]),
          }))
          .filter(r => !isNaN(r.value))
        setData(parsed)
      })
      .catch(() => setError('No se pudieron cargar los datos'))
      .finally(() => setLoading(false))
  }, [csvUrl])

  const filtered = (() => {
    const selected = RANGES.find(r => r.label === range)
    if (!selected?.months) return data
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - selected.months)
    return data.filter(d => new Date(d.date) >= cutoff)
  })()

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })
  }

  const tickCount = 5
  const step = Math.max(1, Math.floor(filtered.length / tickCount))
  const ticks = filtered
    .filter((_, i) => i % step === 0 || i === filtered.length - 1)
    .map(d => d.date)

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h2 className="chart-title">{title}</h2>
        <div className="range-selector">
          {RANGES.map(r => (
            <button
              key={r.label}
              className={`range-btn ${range === r.label ? 'active' : ''}`}
              onClick={() => setRange(r.label)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="chart-state">Cargando datos...</div>}
      {error && <div className="chart-state error">{error}</div>}

      {!loading && !error && (
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={filtered} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              ticks={ticks}
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: '#888' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#888' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v.toFixed(0)}
              width={50}
              domain={[0, yMax ?? 'auto']}
              ticks={yMax ? Array.from({ length: 6 }, (_, i) => Math.round((yMax / 5) * i)) : undefined}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {!loading && !error && data.length > 0 && (() => {
        const latest = data[data.length - 1]
        return (
          <div className="indicators">
            {INDICATORS.map(({ label, days }) => {
              const target = new Date(latest.date)
              target.setDate(target.getDate() - days)
              const past = closestBefore(data, target)
              const pct = pctChange(latest.value, past)
              const sign = pct > 0 ? '+' : ''
              const cls = pct === null ? '' : pct > 0 ? 'up' : 'down'
              return (
                <div key={label} className="indicator">
                  <span className={`indicator-value ${cls}`}>
                    {pct === null ? '—' : `${sign}${pct.toFixed(1).replace('.', ',')}%`}
                  </span>
                  <span className="indicator-label">{label}</span>
                </div>
              )
            })}
          </div>
        )
      })()}

      <p className="chart-unit">
        Unidad: {unit}{sourceLabel && <> · <a href={sourceUrl} target="_blank" rel="noopener noreferrer">{sourceLabel}</a></>} · Autor: Newtral.es
      </p>
    </div>
  )
}
