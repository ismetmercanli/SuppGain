import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/auth-context'
import { getMyOrders } from '../../orders/orders-api'
import type { Order } from '../../orders/types'
import {
  autoCreateWeeklyProgram,
  createWeeklyProgram,
  deleteWeeklyProgram,
  getApiErrorMessage,
  getMyWeeklyPrograms,
  updateWeeklyProgram,
} from '../weekly-program-api'
import type { WeeklyManualScheduleItem, WeeklyProgram } from '../types'
import '../weekly-program.css'
import { PATHS } from '../../../shared/router/paths'

type PurchasedProduct = {
  id: string
  name: string
  category: string
}

const days = ['Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma', 'Cumartesi', 'Pazar']
const slots = ['Sabah', 'Ogle', 'Aksam']
type ManualEntry = {
  localId: string
  day: string
  slot: string
  productId: string
  dosage: string
  note: string
}

function extractPurchasedProducts(orders: Order[]): PurchasedProduct[] {
  const map = new Map<string, PurchasedProduct>()
  for (const order of orders) {
    for (const item of order.items) {
      if (!map.has(item.productId)) {
        map.set(item.productId, {
          id: item.productId,
          name: item.productName,
          category: 'Supplement',
        })
      }
    }
  }
  return Array.from(map.values())
}

function createEntryId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function buildContentFromEntries(
  entries: ManualEntry[],
  productsById: Map<string, PurchasedProduct>,
  source: 'manual-selection' | 'manual-updated',
): string {
  const schedule: WeeklyManualScheduleItem[] = entries
    .map((entry) => {
      const product = productsById.get(entry.productId)
      if (!product) {
        return null
      }
      return {
        day: entry.day,
        slot: entry.slot,
        productId: product.id,
        productName: product.name,
        category: product.category,
        dosage: entry.dosage.trim() || '1 doz',
        note: entry.note.trim() || 'Not yok',
      }
    })
    .filter((x): x is WeeklyManualScheduleItem => Boolean(x))

  const products = Array.from(
    new Set(schedule.map((item) => item.productId)),
  )
    .map((id) => productsById.get(id))
    .filter((x): x is PurchasedProduct => Boolean(x))

  return JSON.stringify({
    source,
    generatedAtUtc: new Date().toISOString(),
    products,
    schedule,
  })
}

function parseSchedule(contentJson: string): WeeklyManualScheduleItem[] {
  try {
    const parsed = JSON.parse(contentJson) as { schedule?: WeeklyManualScheduleItem[] }
    return Array.isArray(parsed.schedule) ? parsed.schedule : []
  } catch {
    return []
  }
}

export function WeeklyProgramPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [programs, setPrograms] = useState<WeeklyProgram[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [manualTitle, setManualTitle] = useState('Haftalik Manuel Program')
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([])
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingEntries, setEditingEntries] = useState<ManualEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const purchasedProducts = useMemo(() => extractPurchasedProducts(orders), [orders])
  const productsById = useMemo(
    () => new Map(purchasedProducts.map((product) => [product.id, product])),
    [purchasedProducts],
  )

  async function loadData(): Promise<void> {
    if (!session?.token) {
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const [myOrders, myPrograms] = await Promise.all([
        getMyOrders(session.token),
        getMyWeeklyPrograms(session.token),
      ])
      setOrders(myOrders)
      setPrograms(myPrograms)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [session?.token])

  useEffect(() => {
    if (manualEntries.length === 0 && purchasedProducts.length > 0) {
      setManualEntries([
        {
          localId: createEntryId(),
          day: days[0],
          slot: slots[0],
          productId: purchasedProducts[0].id,
          dosage: '1 doz',
          note: 'Kahvalti ile',
        },
      ])
    }
  }, [manualEntries.length, purchasedProducts])

  function toggleProduct(id: string): void {
    setSelectedProductIds((prev) => (
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    ))
  }

  async function handleAutoCreate(): Promise<void> {
    if (!session?.token) {
      return
    }

    setIsSaving(true)
    setMessage('')
    setError('')
    try {
      await autoCreateWeeklyProgram(session.token, {
        title: 'Haftalik Otomatik Program',
        selectedProductIds: selectedProductIds.length > 0 ? selectedProductIds : undefined,
      })
      setMessage('Satin alinan urunlere gore haftalik program olusturuldu.')
      await loadData()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleManualCreate(): Promise<void> {
    if (!session?.token) {
      return
    }

    if (manualEntries.length === 0) {
      setError('Manuel program icin en az bir satir eklemelisin.')
      return
    }

    const validCount = manualEntries.filter((entry) => productsById.has(entry.productId)).length
    if (validCount === 0) {
      setError('Manuel program satirlarinda gecerli supplement secmelisin.')
      return
    }

    setIsSaving(true)
    setMessage('')
    setError('')
    try {
      await createWeeklyProgram(session.token, {
        title: manualTitle.trim() || 'Haftalik Manuel Program',
        contentJson: buildContentFromEntries(manualEntries, productsById, 'manual-selection'),
      })
      setMessage('Manuel haftalik program olusturuldu.')
      setManualEntries((prev) => prev.slice(0, 1))
      await loadData()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  function addEntry(target: 'manual' | 'edit'): void {
    if (purchasedProducts.length === 0) {
      return
    }
    const newEntry: ManualEntry = {
      localId: createEntryId(),
      day: days[0],
      slot: slots[0],
      productId: purchasedProducts[0].id,
      dosage: '1 doz',
      note: '',
    }
    if (target === 'manual') {
      setManualEntries((prev) => [...prev, newEntry])
    } else {
      setEditingEntries((prev) => [...prev, newEntry])
    }
  }

  function removeEntry(target: 'manual' | 'edit', localId: string): void {
    if (target === 'manual') {
      setManualEntries((prev) => prev.filter((entry) => entry.localId !== localId))
    } else {
      setEditingEntries((prev) => prev.filter((entry) => entry.localId !== localId))
    }
  }

  function updateEntry(
    target: 'manual' | 'edit',
    localId: string,
    field: keyof Omit<ManualEntry, 'localId'>,
    value: string,
  ): void {
    const updater = (prev: ManualEntry[]) => prev.map((entry) => (
      entry.localId === localId ? { ...entry, [field]: value } : entry
    ))

    if (target === 'manual') {
      setManualEntries(updater)
    } else {
      setEditingEntries(updater)
    }
  }

  function startEditingProgram(program: WeeklyProgram): void {
    const schedule = parseSchedule(program.contentJson)
    const fallbackProductId = purchasedProducts[0]?.id ?? ''
    const mapped = schedule.length > 0
      ? schedule.map((item) => ({
        localId: createEntryId(),
        day: item.day,
        slot: item.slot,
        productId: item.productId || fallbackProductId,
        dosage: item.dosage,
        note: item.note,
      }))
      : []

    setEditingProgramId(program.programId)
    setEditingTitle(program.title)
    setEditingEntries(mapped)
    setMessage('')
    setError('')
  }

  function cancelEditingProgram(): void {
    setEditingProgramId(null)
    setEditingTitle('')
    setEditingEntries([])
  }

  async function handleUpdateProgram(programId: string): Promise<void> {
    if (!session?.token) {
      return
    }
    if (editingEntries.length === 0) {
      setError('Guncelleme icin en az bir satir eklemelisin.')
      return
    }

    setIsSaving(true)
    setError('')
    setMessage('')
    try {
      await updateWeeklyProgram(session.token, programId, {
        title: editingTitle.trim() || 'Haftalik Program',
        contentJson: buildContentFromEntries(editingEntries, productsById, 'manual-updated'),
      })
      setMessage('Program guncellendi.')
      cancelEditingProgram()
      await loadData()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteProgram(programId: string): Promise<void> {
    if (!session?.token) {
      return
    }
    const confirmed = window.confirm('Bu haftalik programi silmek istediginize emin misiniz?')
    if (!confirmed) {
      return
    }

    setIsSaving(true)
    setError('')
    setMessage('')
    try {
      await deleteWeeklyProgram(session.token, programId)
      if (editingProgramId === programId) {
        cancelEditingProgram()
      }
      setMessage('Program silindi.')
      await loadData()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="weekly-shell">
      <header className="weekly-topbar">
        <div>
          <h1>Haftalik Program</h1>
          <p>Satin alinan supplementlerden otomatik plan olustur veya manuel secim yap.</p>
        </div>
        <button type="button" className="sg-ghost-btn" onClick={() => navigate(PATHS.DASHBOARD)}>
          ⌂ Panele Don
        </button>
      </header>

      {message ? <p className="auth-success">{message}</p> : null}
      {error ? <p className="auth-error">{error}</p> : null}

      <div className="weekly-grid">
        <section className="weekly-card">
          <h2>Supplement Secimi</h2>
          {isLoading ? (
            <p className="weekly-muted">Veriler yukleniyor...</p>
          ) : purchasedProducts.length === 0 ? (
            <p className="weekly-muted">
              Satin alinmis urun bulunamadi. Once urun satin alip tekrar dene.
            </p>
          ) : (
            <div className="weekly-product-list">
              {purchasedProducts.map((product) => (
                <label key={product.id} className="weekly-product-item">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                  />
                  <span>{product.name}</span>
                </label>
              ))}
            </div>
          )}

          <div className="weekly-actions">
            <button
              type="button"
              className="auth-button"
              disabled={isSaving || purchasedProducts.length === 0}
              onClick={handleAutoCreate}
            >
              {isSaving ? 'Olusturuluyor...' : '⚙ Otomatik Program Olustur'}
            </button>
          </div>
        </section>

        <section className="weekly-card">
          <h2>Manuel Program</h2>
          <label className="auth-label" htmlFor="manual-title">Program Basligi</label>
          <input
            id="manual-title"
            className="auth-input"
            value={manualTitle}
            onChange={(event) => setManualTitle(event.target.value)}
          />
          <div className="weekly-manual-list">
            {manualEntries.map((entry) => (
              <div key={entry.localId} className="weekly-manual-item">
                <select
                  className="auth-input"
                  value={entry.day}
                  onChange={(event) => updateEntry('manual', entry.localId, 'day', event.target.value)}
                >
                  {days.map((day) => <option key={day} value={day}>{day}</option>)}
                </select>
                <select
                  className="auth-input"
                  value={entry.slot}
                  onChange={(event) => updateEntry('manual', entry.localId, 'slot', event.target.value)}
                >
                  {slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                </select>
                <select
                  className="auth-input"
                  value={entry.productId}
                  onChange={(event) => updateEntry('manual', entry.localId, 'productId', event.target.value)}
                >
                  {purchasedProducts.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
                <input
                  className="auth-input"
                  value={entry.dosage}
                  placeholder="Doz"
                  onChange={(event) => updateEntry('manual', entry.localId, 'dosage', event.target.value)}
                />
                <input
                  className="auth-input"
                  value={entry.note}
                  placeholder="Not"
                  onChange={(event) => updateEntry('manual', entry.localId, 'note', event.target.value)}
                />
                <button
                  type="button"
                  className="sg-ghost-btn"
                  onClick={() => removeEntry('manual', entry.localId)}
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
          <div className="weekly-actions">
            <button type="button" className="sg-ghost-btn" onClick={() => addEntry('manual')}>
              + Satir Ekle
            </button>
          </div>
          <div className="weekly-actions">
            <button
              type="button"
              className="auth-button"
              disabled={isSaving || purchasedProducts.length === 0}
              onClick={handleManualCreate}
            >
              {isSaving ? 'Kaydediliyor...' : '✎ Manuel Program Kaydet'}
            </button>
          </div>
        </section>
      </div>

      <section className="weekly-card">
        <h2>Gecmis Haftalik Programlar</h2>
        {programs.length === 0 ? (
          <p className="weekly-muted">Henuz haftalik program olusturulmamis.</p>
        ) : (
          <div className="weekly-program-list">
            {programs.map((program) => {
              const schedule = parseSchedule(program.contentJson)
              const isEditing = editingProgramId === program.programId
              return (
                <article key={program.programId} className="weekly-program-item">
                  <div className="weekly-program-header">
                    <h3>{program.title}</h3>
                    <span>{new Date(program.createdAtUtc).toLocaleString()}</span>
                  </div>
                  {isEditing ? (
                    <div className="weekly-edit-wrap">
                      <label className="auth-label" htmlFor={`program-title-${program.programId}`}>Program Basligi</label>
                      <input
                        id={`program-title-${program.programId}`}
                        className="auth-input"
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                      />
                      <div className="weekly-manual-list">
                        {editingEntries.map((entry) => (
                          <div key={entry.localId} className="weekly-manual-item">
                            <select
                              className="auth-input"
                              value={entry.day}
                              onChange={(event) => updateEntry('edit', entry.localId, 'day', event.target.value)}
                            >
                              {days.map((day) => <option key={day} value={day}>{day}</option>)}
                            </select>
                            <select
                              className="auth-input"
                              value={entry.slot}
                              onChange={(event) => updateEntry('edit', entry.localId, 'slot', event.target.value)}
                            >
                              {slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                            </select>
                            <select
                              className="auth-input"
                              value={entry.productId}
                              onChange={(event) => updateEntry('edit', entry.localId, 'productId', event.target.value)}
                            >
                              {purchasedProducts.map((product) => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                              ))}
                            </select>
                            <input
                              className="auth-input"
                              value={entry.dosage}
                              placeholder="Doz"
                              onChange={(event) => updateEntry('edit', entry.localId, 'dosage', event.target.value)}
                            />
                            <input
                              className="auth-input"
                              value={entry.note}
                              placeholder="Not"
                              onChange={(event) => updateEntry('edit', entry.localId, 'note', event.target.value)}
                            />
                            <button
                              type="button"
                              className="sg-ghost-btn"
                              onClick={() => removeEntry('edit', entry.localId)}
                            >
                              Sil
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="weekly-actions-row">
                        <button type="button" className="sg-ghost-btn" onClick={() => addEntry('edit')}>
                          + Satir Ekle
                        </button>
                        <button
                          type="button"
                          className="auth-button"
                          disabled={isSaving}
                          onClick={() => handleUpdateProgram(program.programId)}
                        >
                          Guncelle
                        </button>
                        <button type="button" className="sg-ghost-btn" onClick={cancelEditingProgram}>
                          Iptal
                        </button>
                      </div>
                    </div>
                  ) : schedule.length === 0 ? (
                    <p className="weekly-muted">Bu programda okunabilir plan verisi bulunamadi.</p>
                  ) : (
                    <>
                      <div className="weekly-schedule-grid">
                        {schedule.slice(0, 21).map((item, index) => (
                          <div key={`${program.programId}-${index}`} className="weekly-schedule-item">
                            <strong>{item.day} - {item.slot}</strong>
                            <p>{item.productName}</p>
                            <small>{item.dosage} | {item.note}</small>
                          </div>
                        ))}
                      </div>
                      <div className="weekly-actions-row">
                        <button
                          type="button"
                          className="sg-ghost-btn"
                          onClick={() => startEditingProgram(program)}
                        >
                          Guncelle
                        </button>
                        <button
                          type="button"
                          className="sg-ghost-btn"
                          onClick={() => handleDeleteProgram(program.programId)}
                        >
                          Sil
                        </button>
                      </div>
                    </>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
