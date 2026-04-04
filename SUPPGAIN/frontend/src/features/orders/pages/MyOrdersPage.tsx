import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/auth-context'
import { getApiErrorMessage, getMyOrders } from '../orders-api'
import type { Order } from '../types'
import '../../dashboard/dashboard.css'
import '../orders.css'
import { PATHS } from '../../../shared/router/paths'

export function MyOrdersPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrders(): Promise<void> {
      if (!session?.token) {
        return
      }

      setIsLoading(true)
      setError('')
      try {
        const list = await getMyOrders(session.token)
        setOrders(list)
      } catch (requestError) {
        setError(getApiErrorMessage(requestError))
      } finally {
        setIsLoading(false)
      }
    }

    void loadOrders()
  }, [session?.token])

  return (
    <main className="sg-dashboard">
      <aside className="sg-sidebar">
        <div>
          <p className="sg-logo">SuppGain</p>
          <p className="sg-logo-sub">Elit Performans</p>
        </div>
        <nav className="sg-nav">
          <button type="button" className="sg-nav-item" onClick={() => navigate(PATHS.DASHBOARD)}>
            <span className="sg-nav-item-icon">⌂</span>
            <span>Panel</span>
          </button>
          <button type="button" className="sg-nav-item" onClick={() => navigate(PATHS.CHECKOUT)}>
            <span className="sg-nav-item-icon">◍</span>
            <span>Sepet / Odeme</span>
          </button>
          <button type="button" className="sg-nav-item is-active">
            <span className="sg-nav-item-icon">▣</span>
            <span>Siparislerim</span>
          </button>
        </nav>
      </aside>

      <section className="sg-main">
        <header className="sg-topbar">
          <p className="sg-welcome">Siparislerim</p>
          <div className="sg-topbar-actions">
            <button type="button" className="sg-ghost-btn" onClick={() => navigate(PATHS.CHECKOUT)}>
              ＋ Yeni Siparis
            </button>
          </div>
        </header>

        {error ? <p className="auth-error">{error}</p> : null}

        <article className="sg-progress-card">
          <p className="sg-progress-kicker">Gecmis Siparisler</p>
          {isLoading ? (
            <p className="orders-muted">Siparisler yukleniyor...</p>
          ) : orders.length === 0 ? (
            <p className="orders-empty">Henuz siparis gecmisiniz yok.</p>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <article key={order.orderId} className="orders-item">
                  <div className="sg-progress-label">
                    <span>Siparis #{order.orderId.slice(0, 8)}</span>
                    <strong>${order.totalAmount.toFixed(2)}</strong>
                  </div>
                  <p className="orders-meta">
                    Durum: {order.status} - {new Date(order.createdAtUtc).toLocaleString()}
                  </p>
                  <div className="orders-lines">
                    {order.items.map((item) => (
                      <p key={`${order.orderId}-${item.productId}`}>
                        {item.productName} x{item.quantity} - ${item.lineTotal.toFixed(2)}
                      </p>
                    ))}
                  </div>
                  <div className="product-actions" style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="sg-ghost-btn"
                      onClick={() => navigate(PATHS.ORDER_DETAIL.replace(':orderId', order.orderId))}
                    >
                      Detayi Gor
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  )
}
