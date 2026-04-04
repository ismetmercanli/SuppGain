import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/auth-context'
import { addToCart } from '../../cart/cart-api'
import {
  createProduct,
  deleteProduct,
  getApiErrorMessage,
  getProducts,
  updateProduct,
} from '../products-api'
import type { Product, SaveProductRequest } from '../types'
import '../../dashboard/dashboard.css'
import '../products.css'
import { PATHS } from '../../../shared/router/paths'

interface ProductFormState {
  id?: string
  name: string
  description: string
  imageUrl: string
  price: string
  stock: string
  category: string
  isActive: boolean
}

const emptyForm: ProductFormState = {
  name: '',
  description: '',
  imageUrl: '',
  price: '',
  stock: '',
  category: '',
  isActive: true,
}

type ProductVisualType = 'powder' | 'pill'

function pickVisualType(product: Product): ProductVisualType {
  const key = `${product.name} ${product.category}`.toLowerCase()
  const pillKeywords = [
    'vitamin', 'mineral', 'tablet', 'kapsul', 'capsule', 'softgel', 'omega', 'zma',
  ]

  if (pillKeywords.some((word) => key.includes(word))) {
    return 'pill'
  }

  return 'powder'
}

function pickImageByHash(seed: string, urls: string[]): string {
  const value = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return urls[value % urls.length]
}

function getRealFallbackImage(product: Product): string {
  const key = `${product.name} ${product.category}`.toLowerCase()

  const powderUrls = [
    'https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
  ]
  const pillUrls = [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=1200&q=80',
  ]
  const barUrls = [
    'https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=80',
  ]
  const drinkUrls = [
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=1200&q=80',
  ]

  if (key.includes('bar')) {
    return pickImageByHash(key, barUrls)
  }
  if (key.includes('electrolyte') || key.includes('hydration') || key.includes('drink') || key.includes('carnitine')) {
    return pickImageByHash(key, drinkUrls)
  }

  return pickVisualType(product) === 'pill'
    ? pickImageByHash(key, pillUrls)
    : pickImageByHash(key, powderUrls)
}

function resolveProductImage(product: Product): string {
  const rawUrl = (product.imageUrl ?? '').trim()

  // Keep real custom URLs; replace synthetic placeholders with real photos.
  if (rawUrl.length > 0 && !rawUrl.includes('placehold.co')) {
    return rawUrl
  }

  return getRealFallbackImage(product)
}

export function ProductsPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [minPriceFilter, setMinPriceFilter] = useState('')
  const [maxPriceFilter, setMaxPriceFilter] = useState('')
  const [isActiveOnly, setIsActiveOnly] = useState(true)
  const [form, setForm] = useState<ProductFormState>(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const canManageProducts = Boolean(
    session?.token
    && session.user.role.trim().toLowerCase() === 'admin',
  )

  async function loadProducts(): Promise<void> {
    setIsLoading(true)
    setError('')
    try {
      const list = await getProducts({
        name: search || undefined,
        category: categoryFilter || undefined,
        minPrice: minPriceFilter ? Number(minPriceFilter) : undefined,
        maxPrice: maxPriceFilter ? Number(maxPriceFilter) : undefined,
        isActive: isActiveOnly,
      })
      setProducts(list)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.category))).sort()
  }, [products])

  function toPayload(current: ProductFormState): SaveProductRequest {
    return {
      name: current.name.trim(),
      description: current.description.trim(),
      imageUrl: current.imageUrl.trim() || null,
      price: Number(current.price),
      stock: Number(current.stock),
      category: current.category.trim(),
      isActive: current.isActive,
    }
  }

  async function handleFilter(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    await loadProducts()
  }

  async function handleSave(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!session?.token || !canManageProducts) {
      return
    }

    setIsSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = toPayload(form)
      if (form.id) {
        await updateProduct(session.token, form.id, payload)
        setMessage('Ürün başarıyla güncellendi.')
      } else {
        await createProduct(session.token, payload)
        setMessage('Ürün başarıyla eklendi.')
      }
      setForm(emptyForm)
      await loadProducts()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  function handleEdit(product: Product): void {
    if (!canManageProducts) {
      return
    }

    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl ?? '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      isActive: product.isActive,
    })
  }

  async function handleDelete(productId: string): Promise<void> {
    if (!session?.token || !canManageProducts) {
      return
    }

    const confirmed = window.confirm('Bu ürünü silmek istediğine emin misin?')
    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')
    try {
      await deleteProduct(session.token, productId)
      setMessage('Ürün başarıyla silindi.')
      if (form.id === productId) {
        setForm(emptyForm)
      }
      await loadProducts()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    }
  }

  async function handleAddToCart(productId: string): Promise<void> {
    if (!session?.token) {
      setError('Sepete urun eklemek icin giris yapmalisin.')
      return
    }

    setError('')
    setMessage('')
    try {
      await addToCart(session.token, { productId, quantity: 1 })
      setMessage('Urun sepete eklendi.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    }
  }

  return (
    <main className="products-shell">
      <header className="products-topbar">
        <div className="products-title">
          <h1>Koleksiyon</h1>
          <p>Ürünleri kart görünümünde incele, filtrele ve yönet.</p>
        </div>
        <div className="products-actions">
          {canManageProducts ? <span className="products-admin-chip">Urun Yonetimi Aktif</span> : null}
          <button type="button" className="sg-ghost-btn" onClick={() => navigate(PATHS.DASHBOARD)}>
            ⌂ Panele Don
          </button>
          <button type="button" className="sg-ghost-btn" onClick={() => navigate(PATHS.PROFILE)}>
            ◉ Profil
          </button>
        </div>
      </header>

      <div className="products-grid-layout">
        <aside className="products-filters">
          <h2>Filtreler</h2>
          <form className="auth-form" onSubmit={handleFilter}>
            <label className="auth-label" htmlFor="search">Ürün Ara</label>
            <input
              id="search"
              className="auth-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ürün adı..."
            />

            <label className="auth-label" htmlFor="category">Kategori</label>
            <input
              id="category"
              className="auth-input"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              placeholder="Protein, BCAA..."
              list="product-categories"
            />
            <datalist id="product-categories">
              {uniqueCategories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>

            <label className="auth-label" htmlFor="minPrice">Min Fiyat</label>
            <input
              id="minPrice"
              className="auth-input"
              type="number"
              min="0"
              value={minPriceFilter}
              onChange={(event) => setMinPriceFilter(event.target.value)}
            />

            <label className="auth-label" htmlFor="maxPrice">Maks Fiyat</label>
            <input
              id="maxPrice"
              className="auth-input"
              type="number"
              min="0"
              value={maxPriceFilter}
              onChange={(event) => setMaxPriceFilter(event.target.value)}
            />

            <label className="auth-label">
              <input
                type="checkbox"
                checked={isActiveOnly}
                onChange={(event) => setIsActiveOnly(event.target.checked)}
              />
              {' '}Sadece aktif ürünleri göster
            </label>

            <button className="auth-button" type="submit">
              Filtreyi Uygula
            </button>
          </form>
        </aside>

        <section className="products-content">
          {canManageProducts ? (
            <article className="products-form-panel">
              <h2>{form.id ? 'Ürünü Güncelle' : 'Yeni Ürün Ekle'}</h2>
              <form className="auth-form" onSubmit={handleSave}>
                <label className="auth-label" htmlFor="name">Ürün Adı</label>
                <input
                  id="name"
                  className="auth-input"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />

                <label className="auth-label" htmlFor="description">Açıklama</label>
                <textarea
                  id="description"
                  className="auth-input"
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  required
                />

                <label className="auth-label" htmlFor="categoryInput">Kategori</label>
                <input
                  id="categoryInput"
                  className="auth-input"
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  required
                />

                <label className="auth-label" htmlFor="imageUrl">Görsel URL</label>
                <input
                  id="imageUrl"
                  className="auth-input"
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  placeholder="https://..."
                />

                <label className="auth-label" htmlFor="price">Fiyat</label>
                <input
                  id="price"
                  className="auth-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  required
                />

                <label className="auth-label" htmlFor="stock">Stok</label>
                <input
                  id="stock"
                  className="auth-input"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                  required
                />

                <label className="auth-label">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  />
                  {' '}Aktif ürün
                </label>

                <div className="product-actions">
                  <button className="auth-button" type="submit" disabled={isSaving}>
                    {isSaving ? 'Kaydediliyor...' : form.id ? 'Güncelle' : 'Ekle'}
                  </button>
                  {form.id ? (
                    <button
                      className="sg-ghost-btn"
                      type="button"
                      onClick={() => setForm(emptyForm)}
                    >
                      İptal
                    </button>
                  ) : null}
                </div>
              </form>
            </article>
          ) : null}

          {message ? <p className="auth-success">{message}</p> : null}
          {error ? <p className="auth-error">{error}</p> : null}

          {isLoading ? (
            <p className="products-empty">Ürünler yükleniyor...</p>
          ) : products.length === 0 ? (
            <p className="products-empty">Filtrelere uygun ürün bulunamadı.</p>
          ) : (
            <div className="products-card-grid">
              {products.map((product) => (
                <article key={product.id} className="product-card">
                  <div className="product-card-image">
                    <img
                      src={resolveProductImage(product)}
                      alt={product.name}
                      loading="lazy"
                      onError={(event) => {
                        const image = event.currentTarget
                        image.onerror = null
                        image.src = getRealFallbackImage(product)
                      }}
                    />
                  </div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-meta">
                    <span>{product.category}</span>
                    <span>Stok: {product.stock}</span>
                  </div>
                  <div className="product-price">${product.price.toFixed(2)}</div>
                  <div className="product-actions">
                    <button
                      type="button"
                      className="sg-ghost-btn"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      ＋ Sepete Ekle
                    </button>
                    <button
                      type="button"
                      className="sg-ghost-btn"
                      onClick={() => navigate(PATHS.CHECKOUT)}
                    >
                      ◍ Sepete Git
                    </button>
                  </div>
                  {canManageProducts ? (
                    <div className="product-actions">
                      <button
                        type="button"
                        className="sg-ghost-btn"
                        onClick={() => handleEdit(product)}
                      >
                        ✎ Guncelle
                      </button>
                      <button
                        type="button"
                        className="sg-ghost-btn"
                        onClick={() => handleDelete(product.id)}
                      >
                        ⨯ Sil
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
