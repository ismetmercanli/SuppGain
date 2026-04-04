import axios from 'axios'
import { getApiErrorMessage } from '../auth/auth-api'
import type { CreateSupplementTrackerPayload, DashboardIntakeRow, SupplementDashboard } from './types'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5260'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

function withAuth(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

function mapDashboard(raw: Record<string, unknown>): SupplementDashboard {
  const intakesRaw = Array.isArray(raw.intakes) ? raw.intakes : []
  const stockRaw = Array.isArray(raw.stockAlerts) ? raw.stockAlerts : []

  return {
    localDate: String(raw.localDate ?? ''),
    totalScheduledDoses: Number(raw.totalScheduledDoses ?? 0),
    completedDoses: Number(raw.completedDoses ?? 0),
    compliancePercent: Number(raw.compliancePercent ?? 0),
    lastCompletedProductName:
      raw.lastCompletedProductName === null || raw.lastCompletedProductName === undefined
        ? null
        : String(raw.lastCompletedProductName),
    lastCompletedAtUtc:
      raw.lastCompletedAtUtc === null || raw.lastCompletedAtUtc === undefined
        ? null
        : String(raw.lastCompletedAtUtc),
    intakes: intakesRaw.map((item) => {
      const row = item as Record<string, unknown>
      return {
        rowId: String(row.rowId ?? ''),
        trackerId: String(row.trackerId ?? ''),
        slotIndex: Number(row.slotIndex ?? 0),
        productId: String(row.productId ?? ''),
        productName: String(row.productName ?? ''),
        plannedTimeLocal: String(row.plannedTimeLocal ?? ''),
        contextHint: String(row.contextHint ?? ''),
        doseAmount: Number(row.doseAmount ?? 0),
        isCompleted: Boolean(row.isCompleted),
        loggedAtUtc:
          row.loggedAtUtc === null || row.loggedAtUtc === undefined ? null : String(row.loggedAtUtc),
        status: parseIntakeStatus(row.status),
      }
    }),
    stockAlerts: stockRaw.map((item) => {
      const s = item as Record<string, unknown>
      return {
        trackerId: String(s.trackerId ?? ''),
        productId: String(s.productId ?? ''),
        productName: String(s.productName ?? ''),
        currentStock: Number(s.currentStock ?? 0),
        lowStockThreshold: Number(s.lowStockThreshold ?? 0),
        severity: s.severity === 'urgent' || s.severity === 'warning' ? s.severity : 'warning',
      }
    }),
  }
}

function parseIntakeStatus(value: unknown): DashboardIntakeRow['status'] {
  if (value === 'completed' || value === 'due' || value === 'upcoming') {
    return value
  }
  return 'upcoming'
}

export async function getSupplementDashboard(
  token: string,
  date?: string,
): Promise<SupplementDashboard> {
  const response = await api.get<Record<string, unknown>>('/supplement-tracker/dashboard', {
    ...withAuth(token),
    params: date ? { date } : undefined,
  })
  return mapDashboard(response.data)
}

export async function consumeSupplementDose(
  token: string,
  trackerId: string,
  consumedAmount: number,
  note?: string,
): Promise<void> {
  await api.post(
    `/supplement-tracker/${trackerId}/consume`,
    { consumedAmount, note: note ?? '' },
    withAuth(token),
  )
}

export async function createSupplementTracker(
  token: string,
  payload: CreateSupplementTrackerPayload,
): Promise<void> {
  await api.post('/supplement-tracker', payload, withAuth(token))
}

export { getApiErrorMessage }
