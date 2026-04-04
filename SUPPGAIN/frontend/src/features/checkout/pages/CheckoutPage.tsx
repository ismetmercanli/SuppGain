import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/auth-context'
import { getMyCart, getApiErrorMessage } from '../../cart/cart-api'
import { createOrder, getOrderById } from '../../orders/orders-api'
import type { Cart } from '../../cart/types'
import type { Order } from '../../orders/types'
import '../checkout.css'
import { PATHS } from '../../../shared/router/paths'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [promoCode, setPromoCode] = useState('')

  useEffect(() => {
    async function loadCart(): Promise<void> {
      if (!session?.token) {
        return
      }

      setIsLoading(true)
      setError('')
      try {
        const response = await getMyCart(session.token)
        setCart(response)
      } catch (requestError) {
        setError(getApiErrorMessage(requestError))
      } finally {
        setIsLoading(false)
      }
    }

    void loadCart()
  }, [session?.token])

  const discountAmount = useMemo(() => {
    if (!cart) {
      return 0
    }

    if (promoCode.trim().toUpperCase() === 'PER20') {
      return Number((cart.totalAmount * 0.2).toFixed(2))
    }

    return 0
  }, [cart, promoCode])

  const payableAmount = useMemo(() => {
    if (!cart) {
      return 0
    }

    return Number((cart.totalAmount - discountAmount).toFixed(2))
  }, [cart, discountAmount])

  async function handleCreateOrder(): Promise<void> {
    if (!session?.token || !cart || cart.items.length === 0) {
      return
    }

    setIsSubmitting(true)
    setError('')
    setMessage('')

    try {
      const created = await createOrder(session.token)
      const fetched = await getOrderById(session.token, created.orderId)
      setOrder(fetched)
      setMessage('Siparis basariyla olusturuldu.')

      // Refresh cart after checkout attempt.
      const refreshedCart = await getMyCart(session.token)
      setCart(refreshedCart)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="checkout-shell">
      <header className="checkout-top">
        <div className="checkout-logo">SUPPGAIN</div>
        <div className="checkout-steps">
          <span className="checkout-step-badge">1</span> Sepet
          <span className="checkout-step-badge active">2</span> Odeme
          <span className="checkout-step-badge">3</span> Onay
        </div>
        <button
          type="button"
          className="checkout-button"
          onClick={() => navigate(PATHS.MY_ORDERS)}
        >
          ▣ Siparislerim
        </button>
      </header>

      <div className="checkout-grid">
        <section className="checkout-col">
          <h2>Siparisiniz ({cart?.items.length ?? 0} urun)</h2>
          {isLoading ? (
            <p className="checkout-muted">Sepet yukleniyor...</p>
          ) : !cart || cart.items.length === 0 ? (
            <p className="checkout-muted">Sepetiniz bos. Urunler ekranindan urun ekleyin.</p>
          ) : (
            <div className="checkout-cart-list">
              {cart.items.map((item) => (
                <article key={item.productId} className="checkout-cart-item">
                  <div className="checkout-cart-title">
                    <span>{item.productName}</span>
                    <span>${item.lineTotal.toFixed(2)}</span>
                  </div>
                  <p className="checkout-muted">{item.quantity} adet x ${item.unitPrice.toFixed(2)}</p>
                </article>
              ))}
            </div>
          )}

          <label className="checkout-muted" htmlFor="promo">Promosyon Kodu</label>
          <div className="checkout-form-row">
            <input
              id="promo"
              className="checkout-input"
              value={promoCode}
              onChange={(event) => setPromoCode(event.target.value)}
              placeholder="PER20"
            />
            <button type="button" className="checkout-button">
              ✓ Uygula
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <button type="button" className="checkout-button" onClick={() => navigate(PATHS.PRODUCTS)}>
              ← Urunlere Don
            </button>
          </div>
        </section>

        <section className="checkout-col">
          <h2>Teslimat Bilgileri</h2>
          <article className="checkout-card">
            <p className="checkout-pill">Varsayilan Adres</p>
            <p style={{ marginBottom: 0 }}>Burak Yilmaz</p>
            <p className="checkout-muted">Levent Mah. Yasemin Sok. No:12 D:4 Besiktas / Istanbul</p>
            <p className="checkout-muted">+90 532 555 44 88</p>
          </article>

          <h2>Odeme Yontemi</h2>
          <article className="checkout-card">
            <div className="checkout-form-row">
              <button type="button" className="checkout-button">Kredi Karti</button>
              <button type="button" className="checkout-button">₺ Havale / EFT</button>
            </div>
            <div style={{ marginTop: 10 }} />
            <input className="checkout-input" placeholder="Kart uzerindeki isim" value="BURAK YILMAZ" readOnly />
            <div style={{ marginTop: 10 }} />
            <input className="checkout-input" placeholder="Kart numarasi" value="0000 0000 0000 0000" readOnly />
            <div style={{ marginTop: 10 }} />
            <div className="checkout-form-row">
              <input className="checkout-input" placeholder="AA / YY" value="AA / YY" readOnly />
              <input className="checkout-input" placeholder="CVV" value="***" readOnly />
            </div>
          </article>
        </section>

        <aside className="checkout-summary">
          <h3>Ozet</h3>
          <div className="checkout-summary-line">
            <span>Ara Toplam</span>
            <strong>${cart?.totalAmount.toFixed(2) ?? '0.00'}</strong>
          </div>
          <div className="checkout-summary-line">
            <span>Kargo</span>
            <strong>Ucretsiz</strong>
          </div>
          <div className="checkout-summary-line">
            <span>Indirim ({promoCode.trim().toUpperCase() || '-'})</span>
            <strong>- ${discountAmount.toFixed(2)}</strong>
          </div>
          <div className="checkout-summary-total">
            <span>Odenecek</span>
            <span>${payableAmount.toFixed(2)}</span>
          </div>

          <div style={{ marginTop: 14 }}>
            <button
              type="button"
              className="checkout-button"
              disabled={isSubmitting || !cart || cart.items.length === 0}
              onClick={handleCreateOrder}
            >
              {isSubmitting ? 'Isleniyor...' : 'Siparisi Onayla'}
            </button>
          </div>

          {message ? <p className="auth-success">{message}</p> : null}
          {error ? <p className="auth-error">{error}</p> : null}

          {order ? (
            <div className="checkout-card" style={{ marginTop: 12 }}>
              <p className="checkout-pill">Siparis Olustu</p>
              <p style={{ marginBottom: 0 }}>ID: {order.orderId}</p>
              <p className="checkout-muted">Durum: {order.status}</p>
              <p className="checkout-muted">Olusturulma: {new Date(order.createdAtUtc).toLocaleString()}</p>
              <div style={{ marginTop: 10 }}>
                <button
                  type="button"
                  className="checkout-button"
                  onClick={() => navigate(PATHS.MY_ORDERS)}
                >
                  ▣ Siparislerime Git
                </button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  )
}
