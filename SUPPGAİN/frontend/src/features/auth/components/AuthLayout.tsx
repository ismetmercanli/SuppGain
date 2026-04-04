import type { PropsWithChildren } from 'react'

interface AuthLayoutProps extends PropsWithChildren {
  title: string
  subtitle: string
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="auth-brand">SUPPGAIN</p>
        <h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
      </section>
    </main>
  )
}
