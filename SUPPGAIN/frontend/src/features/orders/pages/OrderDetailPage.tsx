import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/auth-context'
import { getApiErrorMessage, getOrderById } from '../orders-api'
import type { Order } from '../types'
import '../../dashboard/dashboard.css'
import '../orders.css'
import { PATHS } from '../../../shared/router/paths'

export function OrderDetailPage() {
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const { session } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrder(): Promise<void> {
      if (!session?.token || !orderId) {
        return
      }

      setIsLoading(true)
      setError('')
      try {
        const response = await getOrderById(session.token, orderId)
        setOrder(response)
      } catch (requestError) {
        setError(getApiErrorMessage(requestError))
      } finally {
        setIsLoading(false)
      }
    }

    void loadOrder()
  }, [session?.token, orderId])

  return (
    <main className="sg-dashboard">
      <aside className="sg-sidebar">
        <div>
          <p className="sg-logo">SuppGain</p>
          <p className="sg-logo-sub">Supplement Dunyasi</p>
        </div>
        <nav className="sg-nav">
          <button type="button" className="sg-nav-item" onClick={() => navigate(PATHS.DASHBOARD)}>
            <span className="sg-nav-item-icon">⌂</span>
            <span>Panel</span>
          </button>
          <button type="button" className="sg-nav-item" onClick={() => navigate(PATHS.MY_ORDERS)}>
            <span className="sg-nav-item-icon">▣</span>
            <span>Siparislerim</span>
          </button>
          <button type="button" className="sg-nav-item is-active">
            <span className="sg-nav-item-icon">◉</span>
            <span>Siparis Detayi</span>
          </button>
        </nav>
      </aside>

      <section className="sg-main">
        <header className="sg-topbar">
          <p className="sg-welcome">Siparis Detayi</p>
          <div className="sg-topbar-actions">
            <button type="button" className="sg-ghost-btn" onClick={() => navigate(PATHS.MY_ORDERS)}>
              ← Siparislerime Don
            </button>
          </div>
        </header>

        {error ? <p className="auth-error">{error}</p> : null}

        <article className="sg-progress-card">
          {isLoading ? (
            <p className="orders-muted">Siparis detayi yukleniyor...</p>
          ) : !order ? (
            <p className="orders-empty">Siparis bulunamadi.</p>
          ) : (
            <>
              <p className="sg-progress-kicker">Siparis #{order.orderId.slice(0, 8)}</p>
              <h2>${order.totalAmount.toFixed(2)}</h2>
              <p className="orders-meta">
                Durum: {order.status} - {new Date(order.createdAtUtc).toLocaleString()}
              </p>
              <div className="orders-lines" style={{ marginTop: 14 }}>
                {order.items.map((item) => (
                  <p key={`${order.orderId}-${item.productId}`}>
                    {item.productName} x{item.quantity} - ${item.lineTotal.toFixed(2)}
                  </p>
                ))}
              </div>
            </>
          )}
        </article>
      </section>
    </main>
  )
}
