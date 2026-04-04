import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/auth-context'
import { getProducts } from '../../products/products-api'
import type { Product } from '../../products/types'
import {
  consumeSupplementDose,
  createSupplementTracker,
  getApiErrorMessage,
  getSupplementDashboard,
} from '../supplement-tracking-api'
import type { DashboardIntakeRow, SupplementDashboard } from '../types'
import '../supplement-tracking.css'
import { PATHS } from '../../../shared/router/paths'

function formatTurkishLongDate(yyyyMmDd: string): string {
  const parts = yyyyMmDd.split('-').map(Number)
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return yyyyMmDd
  }
  const [y, m, d] = parts
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatLoggedTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

function intakeIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('omega') || n.includes('yag') || n.includes('balik')) return '◆'
  if (n.includes('pre') || n.includes('workout') || n.includes('enerji')) return '⚡'
  if (n.includes('vitamin') || n.includes('multi')) return '◉'
  if (n.includes('kreatin') || n.includes('bcaa') || n.includes('protein') || n.includes('whey')) return '◇'
  return '●'
}

function isNextConsumableRow(row: DashboardIntakeRow, intakes: DashboardIntakeRow[]): boolean {
  if (row.isCompleted) {
    return false
  }
  const forTracker = intakes.filter((r) => r.trackerId === row.trackerId)
  const done = forTracker.filter((r) => r.isCompleted).length
  return row.slotIndex === done
}

export function SupplementTrackingPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [dashboard, setDashboard] = useState<SupplementDashboard | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [consumingId, setConsumingId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [formProductId, setFormProductId] = useState('')
  const [formDailyDosage, setFormDailyDosage] = useState('1')
  const [formTimesPerDay, setFormTimesPerDay] = useState('2')
  const [formStock, setFormStock] = useState('30')
  const [formLow, setFormLow] = useState('5')
  const [formSaving, setFormSaving] = useState(false)

  const loadDashboard = useCallback(async () => {
    if (!session?.token) {
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const data = await getSupplementDashboard(session.token)
      setDashboard(data)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [session?.token])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    if (!session?.token || !modalOpen) {
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const list = await getProducts({ isActive: true })
        if (cancelled) {
          return
        }
        setProducts(list)
        setFormProductId((prev) => prev || list[0]?.id || '')
      } catch {
        if (!cancelled) {
          setProducts([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session?.token, modalOpen])

  const intakes = dashboard?.intakes ?? []

  const summaryLine = useMemo(() => {
    if (!dashboard || dashboard.totalScheduledDoses === 0) {
      return 'Henuz planli doz yok. Yeni kayit ekleyin.'
    }
    const last = dashboard.lastCompletedProductName
    const tail = last ? ` Son kayit: ${last}.` : ''
    return `${dashboard.completedDoses}/${dashboard.totalScheduledDoses} takviye tamamlandi.${tail}`
  }, [dashboard])

  async function handleConsume(row: DashboardIntakeRow): Promise<void> {
    if (!session?.token || row.doseAmount <= 0) {
      return
    }
    setConsumingId(row.rowId)
    setError('')
    try {
      await consumeSupplementDose(session.token, row.trackerId, row.doseAmount, '')
      await loadDashboard()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setConsumingId(null)
    }
  }

  async function handleCreateTracker(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!session?.token || !formProductId) {
      return
    }
    const dailyDosage = Number(formDailyDosage)
    const timesPerDay = Number(formTimesPerDay)
    const currentStock = Number(formStock)
    const lowStockThreshold = Number(formLow)
    if (
      Number.isNaN(dailyDosage) ||
      Number.isNaN(timesPerDay) ||
      Number.isNaN(currentStock) ||
      Number.isNaN(lowStockThreshold)
    ) {
      setError('Sayisal alanlari kontrol edin.')
      return
    }
    setFormSaving(true)
    setError('')
    try {
      await createSupplementTracker(session.token, {
        productId: formProductId,
        dailyDosage,
        timesPerDay,
        timesOfDayJson: '[]',
        currentStock,
        lowStockThreshold,
      })
      setModalOpen(false)
      await loadDashboard()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setFormSaving(false)
    }
  }

  const pct = dashboard?.compliancePercent ?? 0

  return (
    <div className="st-shell">
      <header className="st-topbar">
        <div>
          <button type="button" className="st-back" onClick={() => navigate(PATHS.DASHBOARD)}>
            ← Panel
          </button>
          <div className="st-title-block" style={{ marginTop: 14 }}>
            <div className="st-title-row">
              <h1>Takviye takibi</h1>
              <span className="st-badge">Canli panel</span>
            </div>
            {dashboard?.localDate ? (
              <p className="st-date-muted">{formatTurkishLongDate(dashboard.localDate)}</p>
            ) : null}
          </div>
        </div>
      </header>

      {error ? <p className="st-error">{error}</p> : null}

      <div className="st-layout">
        <div>
          <section className="st-card st-summary">
            <div className="st-summary-text">
              <strong>{pct}%</strong>
              <p>Gunluk uyum</p>
              <div className="st-bar-track">
                <div className="st-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <p style={{ marginTop: 10 }}>{summaryLine}</p>
            </div>
          </section>

          <section className="st-card">
            <div className="st-section-head">
              <h2>Gunluk alim listesi</h2>
              <span className="st-muted">Planlanan saatler (TR)</span>
            </div>
            {isLoading ? (
              <p className="st-muted">Yukleniyor...</p>
            ) : intakes.length === 0 ? (
              <div className="st-empty">
                <p>Aktif takip kaydi yok.</p>
                <p className="st-muted">Altta + Yeni kayit ile urun ekleyin veya haftalik program olusturun.</p>
                <button type="button" className="st-btn-consume" style={{ marginTop: 12 }} onClick={() => navigate(PATHS.WEEKLY_PROGRAM)}>
                  Haftalik programa git
                </button>
              </div>
            ) : (
              <div className="st-intake-list">
                {intakes.map((row) => {
                  const canConsume = isNextConsumableRow(row, intakes)
                  const rowClass =
                    row.status === 'completed'
                      ? 'st-intake-row is-done'
                      : row.status === 'due'
                        ? 'st-intake-row is-due'
                        : 'st-intake-row'
                  return (
                    <div key={row.rowId} className={rowClass}>
                      <div className="st-intake-icon">{intakeIcon(row.productName)}</div>
                      <div className="st-intake-body">
                        <h3>{row.productName}</h3>
                        <div className="st-intake-meta">
                          {row.plannedTimeLocal}
                          {row.contextHint ? ` · ${row.contextHint}` : null}
                          {row.isCompleted && row.loggedAtUtc
                            ? ` · Kayit: ${formatLoggedTime(row.loggedAtUtc)}`
                            : null}
                        </div>
                      </div>
                      <div>
                        {row.isCompleted ? (
                          <span className="st-status-pill done">Tamamlandi</span>
                        ) : row.status === 'upcoming' ? (
                          <span className="st-status-pill wait">Bekleniyor</span>
                        ) : null}
                        {!row.isCompleted ? (
                          <button
                            type="button"
                            className="st-btn-consume"
                            style={{ marginTop: 8, width: '100%' }}
                            disabled={!canConsume || consumingId !== null}
                            title={
                              canConsume
                                ? 'Bu dozu kaydet'
                                : 'Once ayni urunun onceki dozunu tamamlayin'
                            }
                            onClick={() => void handleConsume(row)}
                          >
                            {consumingId === row.rowId ? 'Kaydediliyor...' : 'Tuket'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="st-card">
          <div className="st-section-head">
            <h2>Stok monitoru</h2>
          </div>
          {!dashboard || dashboard.stockAlerts.length === 0 ? (
            <p className="st-muted">Dusuk stok uyarisı yok.</p>
          ) : (
            <div className="st-stock-list">
              {dashboard.stockAlerts.map((alert) => (
                <div
                  key={alert.trackerId}
                  className={`st-stock-item ${alert.severity === 'urgent' ? 'urgent' : ''}`}
                >
                  <span className={`st-stock-tag ${alert.severity === 'urgent' ? 'acil' : 'uyari'}`}>
                    {alert.severity === 'urgent' ? 'ACIL' : 'UYARI'}
                  </span>
                  <h3>{alert.productName}</h3>
                  <p className="st-stock-servings">
                    {Math.floor(alert.currentStock)} servis kaldi
                  </p>
                  <button
                    type="button"
                    className={`st-btn-cta ${alert.severity === 'urgent' ? 'primary' : 'secondary'}`}
                    onClick={() => navigate(PATHS.PRODUCTS)}
                  >
                    {alert.severity === 'urgent' ? 'Simdi yenile' : 'Urunlere git'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      <button type="button" className="st-fab" onClick={() => setModalOpen(true)}>
        + Yeni kayit
      </button>

      {modalOpen ? (
        <div
          className="st-modal-backdrop"
          role="presentation"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="st-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="st-modal-title"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h2 id="st-modal-title">Yeni takip kaydi</h2>
            <form onSubmit={(e) => void handleCreateTracker(e)}>
              <div className="st-form-grid">
                <label>
                  Urun
                  <select
                    value={formProductId}
                    onChange={(ev) => setFormProductId(ev.target.value)}
                    required
                  >
                    {products.length === 0 ? (
                      <option value="">Urun yuklenemedi</option>
                    ) : (
                      products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))
                    )}
                  </select>
                </label>
                <label>
                  Gunluk doz (servis)
                  <input
                    value={formDailyDosage}
                    onChange={(ev) => setFormDailyDosage(ev.target.value)}
                    inputMode="decimal"
                    required
                  />
                </label>
                <label>
                  Gunde kac kez
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formTimesPerDay}
                    onChange={(ev) => setFormTimesPerDay(ev.target.value)}
                    required
                  />
                </label>
                <label>
                  Mevcut stok (servis)
                  <input
                    type="number"
                    min={0}
                    value={formStock}
                    onChange={(ev) => setFormStock(ev.target.value)}
                    required
                  />
                </label>
                <label>
                  Dusuk stok esigi
                  <input
                    type="number"
                    min={0}
                    value={formLow}
                    onChange={(ev) => setFormLow(ev.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="st-modal-actions">
                <button type="button" onClick={() => setModalOpen(false)}>
                  Iptal
                </button>
                <button type="submit" className="primary" disabled={formSaving || products.length === 0}>
                  {formSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
